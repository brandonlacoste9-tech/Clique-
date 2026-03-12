// API client for Clique backend
import axios from "axios";
import { useAuthStore } from "../store/cliqueStore";

const API_URL = "http://localhost:3001"; // Change for production

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
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
  },
);

// Auth API
export const authAPI = {
  requestOTP: (phone) => api.post("/auth/otp", { phone }),
  verifyOTP: (phone, otp, username) =>
    api.post("/auth/verify", { phone, otp, username }),
  refreshToken: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
};

// User API
export const userAPI = {
  getMe: () => api.get("/users/me"),
  updateProfile: (data) => api.patch("/users/me", data),
  getUser: (username) => api.get(`/users/${username}`),
  searchUsers: (query) => api.get("/users/search", { params: { q: query } }),
  getFriends: () => api.get("/users/me/friends"),
  addFriend: (username) => api.post("/users/friends", { username }),
  acceptFriend: (userId) => api.post(`/users/friends/${userId}/accept`),
  removeFriend: (userId) => api.delete(`/users/friends/${userId}`),
};

// Stories API
export const storiesAPI = {
  getFeed: () => api.get("/stories/feed"),
  getMyStories: () => api.get("/stories/me"),
  viewStory: (storyId) => api.post(`/stories/${storyId}/view`),
  replyToStory: (storyId, text) =>
    api.post(`/stories/${storyId}/reply`, { text }),
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`),
  getViewers: (storyId) => api.get(`/stories/${storyId}/viewers`),
};

// Upload API
export const uploadAPI = {
  getPresignedUrl: (contentType, fileExtension) =>
    api.post("/upload/presigned", { contentType, fileExtension }),
  createStory: (data) => api.post("/upload/story", data),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get("/messages/conversations"),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
  sendMessage: (userId, data) => api.post(`/messages/${userId}`, data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
};

// Cliques API
export const cliquesAPI = {
  getNearby: (lat, lng, radius) =>
    api.get("/cliques/nearby", { params: { lat, lng, radius } }),
  getClique: (slug) => api.get(`/cliques/${slug}`),
  createClique: (data) => api.post("/cliques", data),
  join: (id) => api.post(`/cliques/${id}/join`),
  leave: (id) => api.delete(`/cliques/${id}/leave`),
  getMessages: (id, params) => api.get(`/cliques/${id}/messages`, { params }),
  sendMessage: (id, data) => api.post(`/cliques/${id}/messages`, data),
};

// Notifications API
export const notificationsAPI = {
  registerPushToken: (pushToken, platform, appVersion, osVersion) =>
    api.post("/notifications/register", {
      pushToken,
      platform,
      appVersion,
      osVersion,
    }),
  unregisterPushToken: (pushToken) =>
    api.delete("/notifications/unregister", { data: { pushToken } }),
  getPendingRequests: () => api.get("/notifications/pending"),
};

// Elite Queue API
export const eliteAPI = {
  register: (email) => api.post("/elite/register", { email }),
  getHall: () => api.get("/elite/hall"),
};

export default api;
