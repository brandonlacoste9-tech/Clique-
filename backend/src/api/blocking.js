// Blocking API - Mute and block users
import { query } from '../models/db.js';

export default async function blockingRoutes(fastify, opts) {
  
  // Mute user
  fastify.post('/mute/:userId', async (request, reply) => {
    const myId = request.user.userId;
    const { userId } = request.params;
    
    if (myId === userId) {
      return reply.code(400).send({ error: 'Cannot mute yourself' });
    }
    
    // Check friendship exists
    const friendResult = await query(
      `SELECT id, status FROM friendships 
       WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
      [myId, userId]
    );
    
    if (friendResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Friendship not found' });
    }
    
    const friendship = friendResult.rows[0];
    
    if (friendship.status === 'blocked') {
      return reply.code(400).send({ error: 'User is already blocked' });
    }
    
    if (friendship.status === 'muted') {
      return { message: 'User is already muted' };
    }
    
    // Update friendship to muted
    await query(
      `UPDATE friendships SET status = 'muted', updated_at = NOW() 
       WHERE id = $1`,
      [friendship.id]
    );
    
    return { message: 'User muted' };
  });
  
  // Unmute user
  fastify.delete('/mute/:userId', async (request, reply) => {
    const myId = request.user.userId;
    const { userId } = request.params;
    
    const friendResult = await query(
      `SELECT id, status FROM friendships 
       WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
      [myId, userId]
    );
    
    if (friendResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Friendship not found' });
    }
    
    const friendship = friendResult.rows[0];
    
    if (friendship.status !== 'muted') {
      return { message: 'User is not muted' };
    }
    
    // Update friendship back to accepted
    await query(
      `UPDATE friendships SET status = 'accepted', updated_at = NOW() 
       WHERE id = $1`,
      [friendship.id]
    );
    
    return { message: 'User unmuted' };
  });
  
  // Block user
  fastify.post('/block/:userId', async (request, reply) => {
    const myId = request.user.userId;
    const { userId } = request.params;
    
    if (myId === userId) {
      return reply.code(400).send({ error: 'Cannot block yourself' });
    }
    
    // Check friendship exists
    const friendResult = await query(
      `SELECT id, status FROM friendships 
       WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
      [myId, userId]
    );
    
    if (friendResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Friendship not found' });
    }
    
    const friendship = friendResult.rows[0];
    
    if (friendship.status === 'blocked') {
      return { message: 'User is already blocked' };
    }
    
    // Update friendship to blocked
    await query(
      `UPDATE friendships SET status = 'blocked', updated_at = NOW() 
       WHERE id = $1`,
      [friendship.id]
    );
    
    return { message: 'User blocked' };
  });
  
  // Unblock user
  fastify.delete('/block/:userId', async (request, reply) => {
    const myId = request.user.userId;
    const { userId } = request.params;
    
    const friendResult = await query(
      `SELECT id, status FROM friendships 
       WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
      [myId, userId]
    );
    
    if (friendResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Friendship not found' });
    }
    
    const friendship = friendResult.rows[0];
    
    if (friendship.status !== 'blocked') {
      return { message: 'User is not blocked' };
    }
    
    // Delete the friendship entirely
    await query(
      `DELETE FROM friendships WHERE id = $1`,
      [friendship.id]
    );
    
    return { message: 'User unblocked' };
  });
  
  // Get muted users
  fastify.get('/muted', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT 
        u.id, u.username, u.display_name, u.avatar_url,
        f.status, f.updated_at
       FROM friendships f
       JOIN users u ON (CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END) = u.id
       WHERE (f.user_a = $1 OR f.user_b = $1) AND f.status = 'muted'
       ORDER BY f.updated_at DESC`,
      [userId]
    );
    
    return {
      mutedUsers: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        mutedAt: row.updated_at
      }))
    };
  });
  
  // Get blocked users
  fastify.get('/blocked', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT 
        u.id, u.username, u.display_name, u.avatar_url,
        f.status, f.updated_at
       FROM friendships f
       JOIN users u ON (CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END) = u.id
       WHERE (f.user_a = $1 OR f.user_b = $1) AND f.status = 'blocked'
       ORDER BY f.updated_at DESC`,
      [userId]
    );
    
    return {
      blockedUsers: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        blockedAt: row.updated_at
      }))
    };
  });
  
  // Check if user is muted or blocked
  fastify.get('/status/:userId', async (request, reply) => {
    const myId = request.user.userId;
    const { userId } = request.params;
    
    const result = await query(
      `SELECT status FROM friendships 
       WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`,
      [myId, userId]
    );
    
    return {
      status: result.rows[0]?.status || 'none'
    };
  });
}
