// API client for Clique backend
import axios from 'axios';
import { useAuthStore } from '../store/cliqueStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  requestOTP: (phone) => api.post('/auth/otp', { phone }),
  verifyOTP: (phone, otp, username) => api.post('/auth/verify', { phone, otp, username }),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout')
};

// User API
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getUser: (username) => api.get(`/users/${username}`),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  getFriends: () => api.get('/users/me/friends'),
  addFriend: (username) => api.post('/users/friends', { username }),
  acceptFriend: (userId) => api.post(`/users/friends/${userId}/accept`),
  removeFriend: (userId) => api.delete(`/users/friends/${userId}`),
  getStats: () => api.get('/users/me/stats'),
  updateTheme: (data) => api.patch('/users/me/theme', data),
  getTheme: () => api.get('/users/me/theme')
};

// Stories API
export const storiesAPI = {
  getFeed: () => api.get('/stories/feed'),
  getMyStories: () => api.get('/stories/me'),
  viewStory: (storyId) => api.post(`/stories/${storyId}/view`),
  replyToStory: (storyId, text) => api.post(`/stories/${storyId}/reply`, { text }),
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`),
  getViewers: (storyId) => api.get(`/stories/${storyId}/viewers`),
  getProgress: (storyId) => api.get(`/stories/${storyId}/progress`),
  updateProgress: (storyId, data) => api.post(`/stories/${storyId}/progress`, data),
  getReplies: (storyId) => api.get(`/stories/${storyId}/replies`),
  getFiltered: (params) => api.get('/stories/filtered', { params })
};

// Upload API
export const uploadAPI = {
  getPresignedUrl: (contentType, fileExtension) =>
    api.post('/upload/presigned', { contentType, fileExtension }),
  createStory: (data) => api.post('/upload/story', data)
};

// Notifications API
export const notificationsAPI = {
  registerToken: (pushToken, platform, appVersion, osVersion) =>
    api.post('/notifications/register-token', { pushToken, platform, appVersion, osVersion }),
  unregisterToken: (token) => api.delete(`/notifications/token/${token}`),
  getDevices: () => api.get('/notifications/devices'),
  deleteDevice: (id) => api.delete(`/notifications/device/${id}`)
};

// Reactions API
export const reactionsAPI = {
  addReaction: (storyId, emoji) => api.post(`/reactions/stories/${storyId}`, { emoji }),
  removeReaction: (storyId) => api.delete(`/reactions/stories/${storyId}`),
  getReactions: (storyId) => api.get(`/reactions/stories/${storyId}`),
  checkReaction: (storyId) => api.get(`/reactions/stories/${storyId}/check`),
  getMyReactions: () => api.get('/reactions/me')
};

// Scheduling API
export const schedulingAPI = {
  scheduleStory: (data) => api.post('/scheduling/schedule', data),
  createDraft: (data) => api.post('/scheduling/draft', data),
  getScheduledStories: () => api.get('/scheduling/schedule'),
  getDrafts: () => api.get('/scheduling/drafts'),
  publishStory: (id) => api.post(`/scheduling/schedule/${id}/publish`),
  deleteStory: (id) => api.delete(`/scheduling/${id}`),
  updateDraft: (id, data) => api.patch(`/scheduling/draft/${id}`, data)
};

// Blocking API
export const blockingAPI = {
  muteUser: (userId) => api.post(`/blocking/mute/${userId}`),
  unmuteUser: (userId) => api.delete(`/blocking/mute/${userId}`),
  blockUser: (userId) => api.post(`/blocking/block/${userId}`),
  unblockUser: (userId) => api.delete(`/blocking/block/${userId}`),
  getMutedUsers: () => api.get('/blocking/muted'),
  getBlockedUsers: () => api.get('/blocking/blocked'),
  getUserStatus: (userId) => api.get(`/blocking/status/${userId}`)
};

// Subscription API
export const subscriptionAPI = {
  getSubscription: () => api.get('/subscriptions/me'),
  getPlans: () => api.get('/subscriptions/plans'),
  createCheckout: (planId) => api.post('/subscriptions/checkout', { planId }),
  cancelSubscription: () => api.delete('/subscriptions/me'),
  upgrade: (planId) => api.post('/subscriptions/upgrade', { planId }),
  checkFeature: (feature) => api.get(`/subscriptions/feature/${feature}`)
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
  sendMessage: (userId, data) => api.post(`/messages/${userId}`, data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  startTyping: (userId, isTyping) => api.post(`/messages/typing/${userId}`, { isTyping }),
  getTypingStatus: (userId) => api.get(`/messages/typing/${userId}`)
};

export default api;
