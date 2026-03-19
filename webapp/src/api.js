import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || 'guest-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createSubscriptionSession = async () => {
  try {
    const response = await api.post('/subscribe');
    return response.data;
  } catch (error) {
    console.error('Error creating subscription session:', error);
    throw error;
  }
};

export const createUpgradeSession = async (itemId) => {
  try {
    const response = await api.post('/upgrade', { itemId });
    return response.data;
  } catch (error) {
    console.error('Error creating upgrade session:', error);
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.patch('/me', data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export default api;
