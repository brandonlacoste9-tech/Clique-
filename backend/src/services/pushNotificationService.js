// Push Notification Service — Expo Push Notifications
import { Expo } from "expo-server-sdk";
import { query } from "../models/db.js";

const expo = new Expo();

/**
 * Register a device push token for a user.
 */
export async function registerPushToken(
  userId,
  pushToken,
  platform,
  appVersion,
  osVersion,
) {
  if (!Expo.isExpoPushToken(pushToken)) {
    throw new Error("Invalid Expo push token");
  }

  await query(
    `INSERT INTO devices (user_id, push_token, platform, app_version, os_version, last_seen_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id, push_token) DO UPDATE SET
       last_seen_at = NOW(),
       app_version = EXCLUDED.app_version,
       os_version = EXCLUDED.os_version`,
    [userId, pushToken, platform, appVersion, osVersion],
  );
}

/**
 * Send push notification to a user.
 */
export async function sendPushToUser(recipientId, { title, body, data = {} }) {
  const result = await query(
    "SELECT push_token FROM devices WHERE user_id = $1",
    [recipientId],
  );

  if (result.rows.length === 0) return;

  const messages = result.rows
    .filter((row) => Expo.isExpoPushToken(row.push_token))
    .map((row) => ({
      to: row.push_token,
      sound: "default",
      title,
      body,
      data,
      channelId: "elite_messages",
    }));

  if (messages.length === 0) return;

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error("[PUSH] Failed to send notifications:", err.message);
    }
  }
}

/**
 * Notify user of a new message.
 */
export async function notifyNewMessage(
  recipientId,
  senderUsername,
  messagePreview,
) {
  await sendPushToUser(recipientId, {
    title: `💬 ${senderUsername}`,
    body:
      messagePreview.length > 80
        ? messagePreview.substring(0, 77) + "..."
        : messagePreview,
    data: { type: "new_message", senderUsername },
  });
}

/**
 * Notify user of a story reply.
 */
export async function notifyStoryReply(ownerId, replierUsername) {
  await sendPushToUser(ownerId, {
    title: `✨ ${replierUsername} a répondu à ta story`,
    body: "Ouvre Clique pour voir la réponse",
    data: { type: "story_reply", replierUsername },
  });
}

/**
 * Notify user of a friend request.
 */
export async function notifyFriendRequest(recipientId, senderUsername) {
  await sendPushToUser(recipientId, {
    title: "👑 Nouvelle demande d'ami",
    body: `${senderUsername} veut rejoindre ton Élite`,
    data: { type: "friend_request", senderUsername },
  });
}

/**
 * Notify user of a story view.
 */
export async function notifyStoryView(ownerId, viewerUsername) {
  await sendPushToUser(ownerId, {
    title: "👁️ Nouvelle vue",
    body: `${viewerUsername} a vu ta story`,
    data: { type: "story_view", viewerUsername },
  });
}
