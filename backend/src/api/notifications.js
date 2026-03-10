// Notifications API - Push notifications and story progress tracking
import { query } from '../models/db.js';
import { config } from '../config/index.js';

export default async function notificationRoutes(fastify, opts) {
  
  // Register Expo push token
  fastify.post('/register-token', async (request, reply) => {
    const userId = request.user.userId;
    const { pushToken, platform = 'ios', appVersion, osVersion } = request.body;
    
    if (!pushToken) {
      return reply.code(400).send({ error: 'Push token required' });
    }
    
    // Check if token already exists
    const existing = await query(
      'SELECT id FROM devices WHERE push_token = $1 AND user_id = $2',
      [pushToken, userId]
    );
    
    if (existing.rows.length > 0) {
      // Update last seen
      await query(
        'UPDATE devices SET last_seen_at = NOW(), app_version = $1, os_version = $2 WHERE id = $3',
        [appVersion, osVersion, existing.rows[0].id]
      );
      return { message: 'Token already registered' };
    }
    
    // Register new device
    await query(
      `INSERT INTO devices (user_id, platform, push_token, app_version, os_version, last_seen_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (push_token) 
       DO UPDATE SET user_id = $1, last_seen_at = NOW()`,
      [userId, platform, pushToken, appVersion, osVersion]
    );
    
    return { message: 'Token registered' };
  });
  
  // Unregister push token
  fastify.delete('/token/:token', async (request, reply) => {
    const { token } = request.params;
    
    await query('DELETE FROM devices WHERE push_token = $1', [token]);
    
    return { message: 'Token unregistered' };
  });
  
  // Send test notification
  fastify.post('/test', async (request, reply) => {
    const userId = request.user.userId;
    const { title, body, data } = request.body;
    
    // Get user's devices
    const devices = await query(
      'SELECT push_token, platform FROM devices WHERE user_id = $1',
      [userId]
    );
    
    if (devices.rows.length === 0) {
      return reply.code(404).send({ error: 'No devices registered' });
    }
    
    // In production, send to Expo push notification service
    // For now, log the notification
    fastify.log.info('Test notification:', {
      title,
      body,
      data,
      tokens: devices.rows.map(d => d.push_token)
    });
    
    return { message: 'Test notification sent' };
  });
  
  // Get my devices
  fastify.get('/devices', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      'SELECT id, platform, push_token, app_version, os_version, last_seen_at, created_at FROM devices WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return {
      devices: result.rows.map(d => ({
        id: d.id,
        platform: d.platform,
        pushToken: d.push_token,
        appVersion: d.app_version,
        osVersion: d.os_version,
        lastSeenAt: d.last_seen_at,
        createdAt: d.created_at
      }))
    };
  });
  
  // Delete device
  fastify.delete('/device/:id', async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;
    
    const result = await query(
      'DELETE FROM devices WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Device not found' });
    }
    
    return { message: 'Device removed' };
  });
}
