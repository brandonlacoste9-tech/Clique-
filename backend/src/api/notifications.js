// Notifications API — Push token registration + device management
import { registerPushToken } from '../services/pushNotificationService.js';
import { query } from '../models/db.js';

export default async function notificationRoutes(fastify, opts) {
  // Register push token
  fastify.post('/register', async (request, reply) => {
    const userId = request.user.userId;
    const { pushToken, platform = 'ios', appVersion, osVersion } = request.body;

    if (!pushToken) {
      return reply.code(400).send({ error: 'Push token required' });
    }

    try {
      await registerPushToken(userId, pushToken, platform, appVersion, osVersion);
      return { message: 'Notifications activées' };
    } catch (err) {
      return reply.code(400).send({ error: err.message });
    }
  });

  // Unregister push token (logout)  
  fastify.delete('/unregister', async (request, reply) => {
    const userId = request.user.userId;
    const { pushToken } = request.body;

    await query(
      'DELETE FROM devices WHERE user_id = $1 AND push_token = $2',
      [userId, pushToken]
    );

    return { message: 'Notifications désactivées' };
  });

  // Get pending friend requests (notification-style)
  fastify.get('/pending', async (request, reply) => {
    const userId = request.user.userId;

    const requests = await query(
      `SELECT f.id, f.created_at,
              u.id as user_id, u.username, u.display_name, u.avatar_url
       FROM friendships f
       JOIN users u ON f.user_a = u.id
       WHERE f.user_b = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return {
      pendingRequests: requests.rows.map(r => ({
        requestId: r.id,
        user: {
          id: r.user_id,
          username: r.username,
          displayName: r.display_name,
          avatarUrl: r.avatar_url
        },
        createdAt: r.created_at
      }))
    };
  });
}
