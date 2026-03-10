// Scheduling API - Story scheduling and drafts
import { query } from '../models/db.js';

export default async function schedulingRoutes(fastify, opts) {
  
  // Create scheduled story
  fastify.post('/schedule', async (request, reply) => {
    const userId = request.user.userId;
    const { mediaKey, mediaType, thumbnailKey, caption, mood, location, scheduleAt } = request.body;
    
    if (!mediaKey || !scheduleAt) {
      return reply.code(400).send({ error: 'Media and schedule time required' });
    }
    
    const scheduleTime = new Date(scheduleAt);
    if (scheduleTime <= new Date()) {
      return reply.code(400).send({ error: 'Schedule time must be in the future' });
    }
    
    // Create scheduled story
    const result = await query(
      `INSERT INTO stories (
        user_id, media_key, media_type, thumbnail_key, caption, mood, location,
        schedule_at, is_scheduled, created_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), $9)
      RETURNING *`,
      [
        userId,
        mediaKey,
        mediaType,
        thumbnailKey,
        caption,
        mood,
        location,
        scheduleTime,
        new Date(scheduleTime.getTime() + 24 * 60 * 60 * 1000) // 24 hours later
      ]
    );
    
    return {
      story: {
        id: result.rows[0].id,
        mediaKey: result.rows[0].media_key,
        mediaType: result.rows[0].media_type,
        thumbnailKey: result.rows[0].thumbnail_key,
        caption: result.rows[0].caption,
        mood: result.rows[0].mood,
        scheduleAt: result.rows[0].schedule_at,
        createdAt: result.rows[0].created_at
      }
    };
  });
  
  // Create draft
  fastify.post('/draft', async (request, reply) => {
    const userId = request.user.userId;
    const { mediaKey, mediaType, thumbnailKey, caption, mood, location } = request.body;
    
    if (!mediaKey) {
      return reply.code(400).send({ error: 'Media required' });
    }
    
    const result = await query(
      `INSERT INTO stories (
        user_id, media_key, media_type, thumbnail_key, caption, mood, location,
        is_draft, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
      RETURNING *`,
      [userId, mediaKey, mediaType, thumbnailKey, caption, mood, location]
    );
    
    return {
      draft: {
        id: result.rows[0].id,
        mediaKey: result.rows[0].media_key,
        mediaType: result.rows[0].media_type,
        thumbnailKey: result.rows[0].thumbnail_key,
        caption: result.rows[0].caption,
        mood: result.rows[0].mood,
        createdAt: result.rows[0].created_at
      }
    };
  });
  
  // Get scheduled stories
  fastify.get('/schedule', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT id, media_key, media_type, thumbnail_key, caption, mood, location, schedule_at, created_at
       FROM stories 
       WHERE user_id = $1 AND is_scheduled = true AND schedule_at > NOW()
       ORDER BY schedule_at ASC`,
      [userId]
    );
    
    return {
      scheduledStories: result.rows.map(row => ({
        id: row.id,
        mediaKey: row.media_key,
        mediaType: row.media_type,
        thumbnailKey: row.thumbnail_key,
        caption: row.caption,
        mood: row.mood,
        location: row.location,
        scheduleAt: row.schedule_at,
        createdAt: row.created_at
      }))
    };
  });
  
  // Get drafts
  fastify.get('/drafts', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT id, media_key, media_type, thumbnail_key, caption, mood, location, created_at
       FROM stories 
       WHERE user_id = $1 AND is_draft = true
       ORDER BY created_at DESC`,
      [userId]
    );
    
    return {
      drafts: result.rows.map(row => ({
        id: row.id,
        mediaKey: row.media_key,
        mediaType: row.media_type,
        thumbnailKey: row.thumbnail_key,
        caption: row.caption,
        mood: row.mood,
        location: row.location,
        createdAt: row.created_at
      }))
    };
  });
  
  // Publish scheduled story
  fastify.post('/schedule/:id/publish', async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;
    
    const result = await query(
      `UPDATE stories 
       SET is_scheduled = false, schedule_at = NULL, expires_at = NOW() + INTERVAL '24 hours'
       WHERE id = $1 AND user_id = $2 AND is_scheduled = true
       RETURNING *`,
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Scheduled story not found' });
    }
    
    return {
      story: {
        id: result.rows[0].id,
        mediaKey: result.rows[0].media_key,
        mediaType: result.rows[0].media_type,
        thumbnailKey: result.rows[0].thumbnail_key,
        caption: result.rows[0].caption,
        mood: result.rows[0].mood,
        createdAt: result.rows[0].created_at,
        expiresAt: result.rows[0].expires_at
      }
    };
  });
  
  // Delete scheduled story or draft
  fastify.delete('/:id', async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;
    
    const result = await query(
      'DELETE FROM stories WHERE id = $1 AND user_id = $2 AND (is_scheduled = true OR is_draft = true) RETURNING id',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Story not found' });
    }
    
    return { message: 'Story deleted' };
  });
  
  // Update draft
  fastify.patch('/draft/:id', async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;
    const { caption, mood, location } = request.body;
    
    const updates = [];
    const values = [id, userId];
    let paramIndex = 3;
    
    if (caption !== undefined) {
      updates.push(`caption = ${paramIndex++}`);
      values.push(caption);
    }
    if (mood !== undefined) {
      updates.push(`mood = ${paramIndex++}`);
      values.push(mood);
    }
    if (location !== undefined) {
      updates.push(`location = ${paramIndex++}`);
      values.push(location);
    }
    
    if (updates.length === 0) {
      return reply.code(400).send({ error: 'No fields to update' });
    }
    
    values.push(id, userId);
    
    const result = await query(
      `UPDATE stories SET ${updates.join(', ')} WHERE id = ${paramIndex} AND user_id = ${paramIndex + 1} RETURNING *`,
      values
    );
    
    return {
      draft: {
        id: result.rows[0].id,
        caption: result.rows[0].caption,
        mood: result.rows[0].mood,
        location: result.rows[0].location
      }
    };
  });
}
