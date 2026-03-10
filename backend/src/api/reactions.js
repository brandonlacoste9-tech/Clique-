// Reactions API - Emoji reactions to stories
import { query } from '../models/db.js';

export default async function reactionRoutes(fastify, opts) {
  
  // Add reaction to story
  fastify.post('/stories/:storyId', async (request, reply) => {
    const userId = request.user.userId;
    const { storyId } = request.params;
    const { emoji } = request.body;
    
    if (!emoji) {
      return reply.code(400).send({ error: 'Emoji required' });
    }
    
    // Check story exists and is not expired
    const storyResult = await query(
      'SELECT user_id FROM stories WHERE id = $1 AND expires_at > NOW()',
      [storyId]
    );
    
    if (storyResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Story not found or expired' });
    }
    
    // Check if reaction already exists
    const existing = await query(
      'SELECT id FROM story_reactions WHERE story_id = $1 AND user_id = $2',
      [storyId, userId]
    );
    
    if (existing.rows.length > 0) {
      return { message: 'Reaction already exists' };
    }
    
    // Add reaction
    await query(
      'INSERT INTO story_reactions (story_id, user_id, emoji, created_at) VALUES ($1, $2, $3, NOW())',
      [storyId, userId, emoji]
    );
    
    // Update reaction count on story
    await query(
      'UPDATE stories SET reaction_count = COALESCE(reaction_count, 0) + 1 WHERE id = $1',
      [storyId]
    );
    
    return { message: 'Reaction added' };
  });
  
  // Remove reaction from story
  fastify.delete('/stories/:storyId', async (request, reply) => {
    const userId = request.user.userId;
    const { storyId } = request.params;
    
    const result = await query(
      'DELETE FROM story_reactions WHERE story_id = $1 AND user_id = $2 RETURNING id',
      [storyId, userId]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Reaction not found' });
    }
    
    // Update reaction count on story
    await query(
      'UPDATE stories SET reaction_count = GREATEST(COALESCE(reaction_count, 1) - 1, 0) WHERE id = $1',
      [storyId]
    );
    
    return { message: 'Reaction removed' };
  });
  
  // Get story reactions
  fastify.get('/stories/:storyId', async (request, reply) => {
    const { storyId } = request.params;
    
    const result = await query(
      `SELECT 
        sr.emoji, sr.created_at,
        u.id as user_id, u.username, u.display_name, u.avatar_url
       FROM story_reactions sr
       JOIN users u ON sr.user_id = u.id
       WHERE sr.story_id = $1
       ORDER BY sr.created_at DESC`,
      [storyId]
    );
    
    // Group by emoji
    const reactions = {};
    result.rows.forEach(row => {
      if (!reactions[row.emoji]) {
        reactions[row.emoji] = {
          emoji: row.emoji,
          count: 0,
          users: []
        };
      }
      reactions[row.emoji].count++;
      reactions[row.emoji].users.push({
        userId: row.user_id,
        username: row.username,
        displayName: row.display_name,
        avatarUrl: row.avatar_url
      });
    });
    
    return {
      reactions: Object.values(reactions),
      totalCount: result.rows.length
    };
  });
  
  // Check if user reacted to story
  fastify.get('/stories/:storyId/check', async (request, reply) => {
    const userId = request.user.userId;
    const { storyId } = request.params;
    
    const result = await query(
      'SELECT emoji FROM story_reactions WHERE story_id = $1 AND user_id = $2',
      [storyId, userId]
    );
    
    return {
      hasReacted: result.rows.length > 0,
      emoji: result.rows[0]?.emoji || null
    };
  });
  
  // Get my reactions (for quick reply)
  fastify.get('/me', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT 
        sr.story_id, sr.emoji, sr.created_at,
        s.caption, s.media_key, s.media_type, s.thumbnail_key,
        s.user_id as story_owner_id,
        u.username as story_owner_username,
        u.display_name as story_owner_display_name
       FROM story_reactions sr
       JOIN stories s ON sr.story_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE sr.user_id = $1
       ORDER BY sr.created_at DESC
       LIMIT 50`,
      [userId]
    );
    
    return {
      reactions: result.rows.map(row => ({
        storyId: row.story_id,
        emoji: row.emoji,
        createdAt: row.created_at,
        story: {
          caption: row.caption,
          mediaKey: row.media_key,
          mediaType: row.media_type,
          thumbnailKey: row.thumbnail_key,
          owner: {
            id: row.story_owner_id,
            username: row.story_owner_username,
            displayName: row.story_owner_display_name
          }
        }
      }))
    };
  });
}
