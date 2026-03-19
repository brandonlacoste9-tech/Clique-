import { create } from 'zustand';
import api from './api';

// ── Auth Store ──
export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
  updateUserSettings: (settings) => set((state) => ({
    user: state.user ? { ...state.user, settings: { ...state.user?.settings, ...settings } } : null
  })),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Fetch real profile from backend
  fetchProfile: async () => {
    try {
      const { data } = await api.get('/me');
      set({ user: data, isAuthenticated: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

// ── Messages Store ──
export const useMessagesStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  loading: false,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/conversations');
      set({ conversations: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchMessages: async (convoId) => {
    try {
      const { data } = await api.get(`/conversations/${convoId}/messages`);
      set((state) => ({
        messages: { ...state.messages, [convoId]: data },
      }));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  },

  setActiveConversation: (convo) => {
    set({ activeConversation: convo });
    if (convo && !get().messages[convo.id]) {
      get().fetchMessages(convo.id);
    }
  },

  addMessage: (convoId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [convoId]: [...(state.messages[convoId] || []), message],
      },
    })),

  sendMessage: async (convoId, text) => {
    try {
      const { data } = await api.post(`/conversations/${convoId}/messages`, { text });
      get().addMessage(convoId, data);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  },
}));

// ── Cliques Store ──
export const useCliquesStore = create((set) => ({
  cliques: [],
  loading: false,

  fetchCliques: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/cliques');
      set({ cliques: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

// ── UI Store ──
export const useUIStore = create((set) => ({
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
