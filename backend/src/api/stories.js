// Story API - Upload, view, manage ephemeral stories
import { v4 as uuidv4 } from 'uuid';
import { query } from '../models/db.js';
import { storyCache, presence } from '../services/redis.js';
import { config } from '../config/index.js';

export default async function storyRoutes(fastify, opts) {
  
  // Get stories feed (friends + public)
  fastify.get('/feed', async (request, reply) => {
    const userId = request.user.userId;
    const { lat, lng, radius = 5000 } = request.query;
    
    try {
      // Get friends list
      const friendsResult = await query(
        `SELECT 
          CASE 
            WHEN user_a = $1 THEN user_b 
            ELSE user_a 
          END as friend_id
         FROM friendships 
         WHERE (user_a = $1 OR user_b = $1) AND status = 'accepted'`,
        [userId]
      );
      
      const friendIds = friendsResult.rows.map(r => r.friend_id);
      
      // Build query for active stories
      let storiesQuery = `
        SELECT 
          s.id, s.user_id, s.media_key, s.media_type, s.thumbnail_key,
          s.caption, s.mood, s.created_at, s.expires_at,
          s.view_count, s.reply_count, s.is_public,
          u.username, u.display_name, u.avatar_url,
          ST_X(s.location::geometry) as lng, 
          ST_Y(s.location::geometry) as lat,
          EXISTS(
            SELECT 1 FROM story_views sv 
            WHERE sv.story_id = s.id AND sv.viewer_id = $1
          ) as has_viewed
        FROM stories s
        JOIN users u ON s.user_id = u.id
        WHERE s.expires_at > NOW()
          AND s.user_id != $1
          AND (
            s.user_id = ANY($2) -- friends
            OR s.is_public = true -- public stories
          )
        ORDER BY s.created_at DESC
        LIMIT 50
      `;
      
      const result = await query(storiesQuery, [userId, friendIds]);
      
      // Group by user for story ring UI
      const grouped = result.rows.reduce((acc, story) => {
        if (!acc[story.user_id]) {
          acc[story.user_id] = {
            user: {
              id: story.user_id,
              username: story.username,
              displayName: story.display_name,
              avatarUrl: story.avatar_url
            },
            stories: [],
            hasUnviewed: false
          };
        }
        
        acc[story.user_id].stories.push({
          id: story.id,
          mediaKey: story.media_key,
          mediaType: story.media_type,
          thumbnailKey: story.thumbnail_key,
          caption: story.caption,
          mood: story.mood,
          createdAt: story.created_at,
          expiresAt: story.expires_at,
          viewCount: story.view_count,
          replyCount: story.reply_count,
          isPublic: story.is_public,
          location: story.lat && story.lng ? { lat: story.lat, lng: story.lng } : null,
          hasViewed: story.has_viewed
        });
        
        if (!story.has_viewed) {
          acc[story.user_id].hasUnviewed = true;
        }
        
        return acc;
      }, {});
      
      return {
        stories: Object.values(grouped),
        totalCount: result.rows.length
      };
      
    } catch (err) {
      fastify.log.error('Feed error:', err);
      return reply.code(500).send({ error: 'Failed to load stories' });
    }
  });
  
  // Get my stories
  fastify.get('/me', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT 
        s.*,
        (SELECT COUNT(*) FROM story_views sv WHERE sv.story_id = s.id) as total_views,
        (SELECT COUNT(*) FROM story_views sv WHERE sv.story_id = s.id AND sv.screenshot_detected = true) as screenshot_count
       FROM stories s
       WHERE s.user_id = $1 AND s.expires_at > NOW()
       ORDER BY s.created_at DESC`,
      [userId]
    );
    
    return {
      stories: result.rows.map(row => ({
        id: row.id,
        mediaKey: row.media_key,
        mediaType: row.media_type,
        thumbnailKey: row.thumbnail_key,
        caption: row.caption,
        mood: row.mood,
        viewCount: parseInt(row.total_views),
        screenshotCount: parseInt(row.screenshot_count),
        replyCount: row.reply_count,
        expiresAt: row.expires_at,
        createdAt: row.created_at
      }))
    };
  });
  
  // View a story
  fastify.post('/:id/view', async (request, reply) => {
    const { id } = request.params;
    const viewerId = request.user.userId;
    const { screenshotDetected = false } = request.body || {};
    
    try {
      // Check story exists and not expired
      const storyResult = await query(
        'SELECT user_id, allow_replies FROM stories WHERE id = $1 AND expires_at > NOW()',
        [id]
      );
      
      if (storyResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Story not found or expired' });
      }
      
      const story = storyResult.rows[0];
      
      // Don't count self-views
      if (story.user_id === viewerId) {
        return { message: 'Self view ignored' };
      }
      
      // Record view (upsert)
      await query(
        `INSERT INTO story_views (story_id, viewer_id, viewed_at, screenshot_detected)
         VALUES ($1, $2, NOW(), $3)
         ON CONFLICT (story_id, viewer_id) 
         DO UPDATE SET screenshot_detected = EXCLUDED.screenshot_detected OR story_views.screenshot_detected`,
        [id, viewerId, screenshotDetected]
      );
      
      // Increment view count
      await query(
        'UPDATE stories SET view_count = view_count + 1 WHERE id = $1',
        [id]
      );
      
      // Notify story owner in real-time (if online)
      const isOnline = await presence.isOnline(story.user_id);
      if (isOnline) {
        // WebSocket notification would go here
        fastify.log.info(`Notifying ${story.user_id} of new view`);
      }
      
      return { message: 'View recorded' };
      
    } catch (err) {
      fastify.log.error('View error:', err);
      return reply.code(500).send({ error: 'Failed to record view' });
    }
  });
  
  // Reply to a story (starts DM)
  fastify.post('/:id/reply', async (request, reply) => {
    const { id } = request.params;
    const senderId = request.user.userId;
    const { text, mediaKey } = request.body;
    
    if (!text && !mediaKey) {
      return reply.code(400).send({ error: 'Text or media required' });
    }
    
    // Get story owner
    const storyResult = await query(
      'SELECT user_id, allow_replies FROM stories WHERE id = $1 AND expires_at > NOW()',
      [id]
    );
    
    if (storyResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Story not found or expired' });
    }
    
    const story = storyResult.rows[0];
    
    if (!story.allow_replies) {
      return reply.code(403).send({ error: 'Replies disabled for this story' });
    }
    
    // Create message
    const messageResult = await query(
      `INSERT INTO messages (sender_id, recipient_id, content_type, text_content, content_key, reply_to_story_id, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        senderId,
        story.user_id,
        mediaKey ? 'image' : 'text',
        text,
        mediaKey,
        id
      ]
    );
    
    // Increment reply count on story
    await query('UPDATE stories SET reply_count = reply_count + 1 WHERE id = $1', [id]);
    
    return {
      message: 'Reply sent',
      conversationId: messageResult.rows[0].id
    };
  });
  
  // Delete my story
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;
    
    const result = await query(
      'DELETE FROM stories WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Story not found or not yours' });
    }
    
    // Invalidate cache
    await storyCache.invalidateUserStories(userId);
    
    return { message: 'Story deleted' };
  });
  
  // Get story viewers (my story only)
  fastify.get('/:id/viewers', async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT 
        sv.viewer_id, sv.viewed_at, sv.screenshot_detected,
        u.username, u.display_name, u.avatar_url
       FROM story_views sv
       JOIN users u ON sv.viewer_id = u.id
       JOIN stories s ON sv.story_id = s.id
       WHERE s.id = $1 AND s.user_id = $2
       ORDER BY sv.viewed_at DESC`,
      [id, userId]
    );
    
    return {
      viewers: result.rows.map(row => ({
        userId: row.viewer_id,
        username: row.username,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        viewedAt: row.viewed_at,
        screenshotDetected: row.screenshot_detected
      }))
    };
  });
}
