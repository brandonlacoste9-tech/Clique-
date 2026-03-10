// WebSocket handlers for real-time features
import { presence } from './redis.js';

export function storySocketHandler(socket, request) {
  const userId = request.user?.userId;
  
  if (!userId) {
    socket.close(4001, 'Unauthorized');
    return;
  }

  // Mark user as online
  presence.setOnline(userId, socket.id);

  // Send connected confirmation
  socket.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to story stream',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'subscribe':
          // Subscribe to story updates
          socket.storySubscriptions = message.storyIds || [];
          break;
          
        case 'ping':
          socket.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          }));
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  // Handle disconnection
  socket.on('close', () => {
    presence.setOffline(userId);
    console.log(`User ${userId} disconnected`);
  });

  // Handle errors
  socket.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
}

// Broadcast story update to subscribers
export async function broadcastStoryUpdate(fastify, storyId, userId) {
  const clients = fastify.websocketServer.clients;
  
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      try {
        client.send(JSON.stringify({
          type: 'story_update',
          storyId,
          userId,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Broadcast error:', err);
      }
    }
  });
}

// Broadcast notification to specific user
export async function broadcastNotification(fastify, userId, notification) {
  const clients = fastify.websocketServer.clients;
  
  clients.forEach((client) => {
    // Check if this client is subscribed to this user
    if (client.userId === userId && client.readyState === 1) {
      try {
        client.send(JSON.stringify({
          type: 'notification',
          ...notification,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Notification broadcast error:', err);
      }
    }
  });
}
