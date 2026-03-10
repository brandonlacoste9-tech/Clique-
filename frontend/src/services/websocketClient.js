// WebSocket client for real-time features
import io from 'socket.io-client';
import { useAuthStore } from '../store/cliqueStore';

const WS_URL = 'http://localhost:3001';

let socket = null;
let isConnected = false;

export const connectWebSocket = () => {
  const { token } = useAuthStore.getState();
  
  if (!token) return;

  socket = io(WS_URL, {
    transports: ['websocket'],
    auth: {
      token
    }
  });

  socket.on('connect', () => {
    isConnected = true;
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    isConnected = false;
    console.log('WebSocket disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('WebSocket connection error:', err);
    isConnected = false;
  });

  socket.on('story_update', (data) => {
    console.log('Story update received:', data);
    // Handle story update notification
  });

  socket.on('notification', (data) => {
    console.log('Notification received:', data);
    // Handle real-time notification
  });
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
};

export const subscribeToStory = (storyId) => {
  if (socket && isConnected) {
    socket.emit('subscribe', { storyIds: [storyId] });
  }
};

export const unsubscribeFromStory = (storyId) => {
  if (socket && isConnected) {
    socket.emit('subscribe', { storyIds: [] });
  }
};

export const sendPing = () => {
  if (socket && isConnected) {
    socket.emit('ping');
  }
};

export const getSocket = () => socket;
export const getIsConnected = () => isConnected;
