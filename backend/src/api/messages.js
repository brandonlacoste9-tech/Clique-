// Messages API - DM with ephemeral support + real-time
import { query, withTransaction } from "../models/db.js";
import { ephemeralQueue, presence } from "../services/redis.js";
import { sendToUser, isUserConnected } from "../services/websocket.js";
import { notifyNewMessage } from "../services/pushNotificationService.js";
import { config } from "../config/index.js";

export default async function messageRoutes(fastify, opts) {
  // Get conversations list
  fastify.get("/conversations", async (request, reply) => {
    const userId = request.user.userId;

    const result = await query(
      `SELECT 
        c.id as conversation_id,
        CASE WHEN c.user_a = $1 THEN c.user_b ELSE c.user_a END as other_user_id,
        u.username, u.display_name, u.avatar_url,
        c.last_message_at,
        CASE WHEN c.user_a = $1 THEN c.unread_count_a ELSE c.unread_count_b END as unread_count,
        m.content_type, m.text_content, m.sent_at as last_message_time,
        c.streak_count, c.streak_expires_at
       FROM conversations c
       JOIN users u ON (CASE WHEN c.user_a = $1 THEN c.user_b ELSE c.user_a END) = u.id
       LEFT JOIN messages m ON c.last_message_id = m.id
       WHERE c.user_a = $1 OR c.user_b = $1
       ORDER BY c.last_message_at DESC NULLS LAST`,
      [userId],
    );

    const conversations = await Promise.all(
      result.rows.map(async (row) => {
        const isOnline = await presence.isOnline(row.other_user_id);
        return {
          conversationId: row.conversation_id,
          user: {
            id: row.other_user_id,
            username: row.username,
            displayName: row.display_name,
            avatarUrl: row.avatar_url,
            isOnline,
          },
          lastMessage: row.last_message_at
            ? {
                type: row.content_type,
                text: row.text_content,
                sentAt: row.last_message_time,
              }
            : null,
          unreadCount: row.unread_count,
          streak: {
            count: row.streak_count,
            expiresAt: row.streak_expires_at,
          },
        };
      }),
    );

    return { conversations };
  });

  // Get messages in conversation
  fastify.get("/:userId", async (request, reply) => {
    const myId = request.user.userId;
    const { userId } = request.params;
    const { before, limit = 50 } = request.query;

    // Build query
    let sql = `
      SELECT m.*, 
        s.id as reply_story_id, s.media_key as reply_story_media
      FROM messages m
      LEFT JOIN stories s ON m.reply_to_story_id = s.id
      WHERE ((m.sender_id = $1 AND m.recipient_id = $2) 
         OR (m.sender_id = $2 AND m.recipient_id = $1))
        AND (m.deleted_by_sender_at IS NULL OR m.sender_id != $1)
        AND (m.deleted_by_recipient_at IS NULL OR m.recipient_id != $1)
    `;

    const params = [myId, userId];

    if (before) {
      sql += ` AND m.sent_at < $3`;
      params.push(before);
    }

    sql += ` ORDER BY m.sent_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);

    // Mark as read
    await query(
      `UPDATE messages SET read_at = NOW() 
       WHERE sender_id = $1 AND recipient_id = $2 AND read_at IS NULL`,
      [userId, myId],
    );

    // Reset unread count
    await query(
      `UPDATE conversations 
       SET unread_count_a = CASE WHEN user_a = $1 THEN 0 ELSE unread_count_a END,
           unread_count_b = CASE WHEN user_b = $1 THEN 0 ELSE unread_count_b END
       WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
      [myId, userId],
    );

    // Send read receipts via WebSocket
    sendToUser(userId, 'messages_read', {
      readBy: myId,
      readAt: new Date().toISOString()
    });

    return {
      messages: result.rows
        .map((m) => ({
          id: m.id,
          senderId: m.sender_id,
          contentType: m.content_type,
          text: m.text_content,
          contentKey: m.content_key,
          ephemeral: m.ephemeral_mode,
          expiresAt: m.expires_at,
          sentAt: m.sent_at,
          readAt: m.read_at,
          replyToStory: m.reply_story_id
            ? {
                id: m.reply_story_id,
                mediaKey: m.reply_story_media,
              }
            : null,
        }))
        .reverse(),
    };
  });

  // Global search across all conversations
  fastify.get("/search/global", async (request, reply) => {
    const userId = request.user.userId;
    const { q, limit = 20 } = request.query;

    if (!q || q.length < 2) {
      return { results: [] };
    }

    const result = await query(
      `SELECT m.id, m.sender_id, m.recipient_id, m.content_type, m.text_content, m.sent_at,
              u.username as other_username, u.display_name as other_display_name, u.avatar_url as other_avatar_url,
              CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END as other_user_id
       FROM messages m
       JOIN users u ON (CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END) = u.id
       WHERE (m.sender_id = $1 OR m.recipient_id = $1)
         AND m.content_type = 'text'
         AND m.text_content ILIKE $2
         AND (m.deleted_by_sender_at IS NULL OR m.sender_id != $1)
         AND (m.deleted_by_recipient_at IS NULL OR m.recipient_id != $1)
       ORDER BY m.sent_at DESC
       LIMIT $3`,
      [userId, `%${q}%`, limit],
    );

    return {
      results: result.rows.map((m) => ({
        id: m.id,
        text: m.text_content,
        sentAt: m.sent_at,
        user: {
          id: m.other_user_id,
          username: m.other_username,
          displayName: m.other_display_name,
          avatarUrl: m.other_avatar_url,
        },
      })),
    };
  });

  // Send message
  fastify.post("/:userId", async (request, reply) => {
    const senderId = request.user.userId;
    const { userId: recipientId } = request.params;
    const {
      text,
      contentType = "text",
      contentKey,
      ephemeral = false,
      replyToStoryId,
    } = request.body;

    if (!text && !contentKey) {
      return reply.code(400).send({ error: "Message content required" });
    }

    // Calculate expiry for ephemeral
    let expiresAt = null;
    if (ephemeral) {
      expiresAt = new Date();
      expiresAt.setSeconds(
        expiresAt.getSeconds() + config.EPHEMERAL_MESSAGE_TTL_SECONDS,
      );
    }

    const result = await query(
      `INSERT INTO messages (
        sender_id, recipient_id, content_type, text_content, content_key,
        ephemeral_mode, expires_at, reply_to_story_id, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *`,
      [
        senderId,
        recipientId,
        contentType,
        text,
        contentKey,
        ephemeral,
        expiresAt,
        replyToStoryId,
      ],
    );

    const message = result.rows[0];

    // Update conversation
    await query(
      `INSERT INTO conversations (user_a, user_b, last_message_id, last_message_at, unread_count_a, unread_count_b)
       VALUES (
         LEAST($1, $2), GREATEST($1, $2), $3, NOW(),
         CASE WHEN $2 < $1 THEN 1 ELSE 0 END,
         CASE WHEN $1 < $2 THEN 1 ELSE 0 END
       )
       ON CONFLICT (user_a, user_b) 
       DO UPDATE SET 
         last_message_id = $3,
         last_message_at = NOW(),
         unread_count_a = CASE WHEN $2 < $1 THEN conversations.unread_count_a + 1 ELSE conversations.unread_count_a END,
         unread_count_b = CASE WHEN $1 < $2 THEN conversations.unread_count_b + 1 ELSE conversations.unread_count_b END`,
      [senderId, recipientId, message.id],
    );

    // Schedule ephemeral deletion
    if (ephemeral && expiresAt) {
      await ephemeralQueue.scheduleDeletion(message.id, expiresAt);
    }

    // Real-time delivery via WebSocket
    const delivered = sendToUser(recipientId, 'new_message', {
      id: message.id,
      senderId: message.sender_id,
      contentType: message.content_type,
      text: message.text_content,
      contentKey: message.content_key,
      ephemeral: message.ephemeral_mode,
      expiresAt: message.expires_at,
      sentAt: message.sent_at,
    });

    // If not online via WebSocket, send push notification
    if (!delivered) {
      const senderResult = await query(
        'SELECT username FROM users WHERE id = $1',
        [senderId]
      );
      const senderUsername = senderResult.rows[0]?.username || 'Someone';
      const preview = contentType === 'text' ? text : `📷 ${contentType}`;
      
      notifyNewMessage(recipientId, senderUsername, preview).catch(err => {
        fastify.log.error('Push notification error:', err.message);
      });
    }

    return {
      message: {
        id: message.id,
        contentType: message.content_type,
        text: message.text_content,
        contentKey: message.content_key,
        ephemeral: message.ephemeral_mode,
        expiresAt: message.expires_at,
        sentAt: message.sent_at,
        delivered,
      },
    };
  });

  // Delete message (for me)
  fastify.delete("/:messageId", async (request, reply) => {
    const userId = request.user.userId;
    const { messageId } = request.params;

    await query(
      `UPDATE messages 
       SET deleted_by_sender_at = CASE WHEN sender_id = $1 THEN NOW() ELSE deleted_by_sender_at END,
           deleted_by_recipient_at = CASE WHEN recipient_id = $1 THEN NOW() ELSE deleted_by_recipient_at END
       WHERE id = $2 AND (sender_id = $1 OR recipient_id = $1)`,
      [userId, messageId],
    );

    return { message: "Message deleted" };
  });
}
