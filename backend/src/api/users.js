// User API - Profile, friends, settings
import { query } from '../models/db.js';
import { presence, storyCache } from '../services/redis.js';

export default async function userRoutes(fastify, opts) {
  
  // Get my profile
  fastify.get('/me', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT id, username, display_name, avatar_url, bio, location,
              snap_score, streak_count, story_visibility, 
              allow_screenshots, ghost_mode, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      location: user.location,
      snapScore: user.snap_score,
      streakCount: user.streak_count,
      settings: {
        storyVisibility: user.story_visibility,
        allowScreenshots: user.allow_screenshots,
        ghostMode: user.ghost_mode
      },
      createdAt: user.created_at
    };
  });
  
  // Update profile
  fastify.patch('/me', async (request, reply) => {
    const userId = request.user.userId;
    const { displayName, bio, avatarUrl, location } = request.body;
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (displayName !== undefined) {
      updates.push(`display_name = $${paramIndex++}`);
      values.push(displayName);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(avatarUrl);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(location);
    }
    
    if (updates.length === 0) {
      return reply.code(400).send({ error: 'No fields to update' });
    }
    
    values.push(userId);
    
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    return {
      id: result.rows[0].id,
      username: result.rows[0].username,
      displayName: result.rows[0].display_name,
      avatarUrl: result.rows[0].avatar_url,
      bio: result.rows[0].bio,
      location: result.rows[0].location
    };
  });
  
  // Get user by username
  fastify.get('/:username', async (request, reply) => {
    const { username } = request.params;
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT id, username, display_name, avatar_url, bio, location, snap_score
       FROM users WHERE username = $1 AND deleted_at IS NULL`,
      [username]
    );
    
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Check friendship status
    const friendResult = await query(
      `SELECT status FROM friendships 
       WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
      [userId, user.id]
    );
    
    const friendshipStatus = friendResult.rows[0]?.status || 'none';
    const isOnline = await presence.isOnline(user.id);
    
    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      location: user.location,
      snapScore: user.snap_score,
      friendshipStatus,
      isOnline
    };
  });
  
  // Search users
  fastify.get('/search', async (request, reply) => {
    const { q } = request.query;
    const userId = request.user.userId;
    
    if (!q || q.length < 2) {
      return reply.code(400).send({ error: 'Query too short' });
    }
    
    const result = await query(
      `SELECT id, username, display_name, avatar_url
       FROM users 
       WHERE (username ILIKE $1 OR display_name ILIKE $1)
         AND id != $2
         AND deleted_at IS NULL
       LIMIT 20`,
      [`%${q}%`, userId]
    );
    
    return {
      users: result.rows.map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        avatarUrl: u.avatar_url
      }))
    };
  });
  
  // Get friends list
  fastify.get('/me/friends', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT 
        u.id, u.username, u.display_name, u.avatar_url,
        f.streak_count, f.streak_last_snapped_at,
        CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END as friend_id
       FROM friendships f
       JOIN users u ON (CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END) = u.id
       WHERE (f.user_a = $1 OR f.user_b = $1) AND f.status = 'accepted'
       ORDER BY f.streak_last_snapped_at DESC NULLS LAST`,
      [userId]
    );
    
    // Check online status for each
    const friendsWithPresence = await Promise.all(
      result.rows.map(async (row) => {
        const isOnline = await presence.isOnline(row.id);
        return {
          id: row.id,
          username: row.username,
          displayName: row.display_name,
          avatarUrl: row.avatar_url,
          streakCount: row.streak_count,
          lastSnappedAt: row.streak_last_snapped_at,
          isOnline
        };
      })
    );
    
    return { friends: friendsWithPresence };
  });
  
  // Add friend
  fastify.post('/friends', async (request, reply) => {
    const userId = request.user.userId;
    const { username } = request.body;
    
    // Find user
    const userResult = await query(
      'SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL',
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    const friendId = userResult.rows[0].id;
    
    if (friendId === userId) {
      return reply.code(400).send({ error: 'Cannot add yourself' });
    }
    
    // Check existing friendship
    const existing = await query(
      `SELECT status FROM friendships 
       WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
      [userId, friendId]
    );
    
    if (existing.rows.length > 0) {
      return reply.code(409).send({ 
        error: 'Friendship already exists',
        status: existing.rows[0].status 
      });
    }
    
    // Create friendship
    await query(
      `INSERT INTO friendships (user_a, user_b, status, created_at)
       VALUES ($1, $2, 'pending', NOW())`,
      [userId, friendId]
    );
    
    return { message: 'Friend request sent', status: 'pending' };
  });
  
  // Accept friend request
  fastify.post('/friends/:id/accept', async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;
    
    const result = await query(
      `UPDATE friendships 
       SET status = 'accepted', updated_at = NOW()
       WHERE user_b = $1 AND user_a = $2 AND status = 'pending'
       RETURNING *`,
      [userId, id]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Friend request not found' });
    }
    
    return { message: 'Friend request accepted' };
  });
  
  // Remove/block friend
  fastify.delete('/friends/:id', async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;
    const { block = false } = request.body || {};
    
    if (block) {
      // Update to blocked
      await query(
        `UPDATE friendships 
         SET status = 'blocked', updated_at = NOW()
         WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
        [userId, id]
      );
      return { message: 'User blocked' };
    } else {
      // Delete friendship
      await query(
        `DELETE FROM friendships 
         WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
        [userId, id]
      );
      return { message: 'Friend removed' };
    }
  });
}
