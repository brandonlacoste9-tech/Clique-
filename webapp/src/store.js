import { create } from 'zustand';

// Auth store
export const useAuthStore = create((set, get) => ({
  user: {
    id: 'guest-001',
    displayName: 'SOVEREIGN USER',
    username: 'guest',
    influenceScore: 42.5,
    snapScore: 1200,
    streakCount: 7,
    sovereignTier: 'INITIÉ',
    location: 'Québec',
    bio: 'Living the hive life 🐝',
  },
  token: 'guest-token',
  isAuthenticated: true,

  setUser: (user) => set({ user }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));

// Messages store
export const useMessagesStore = create((set, get) => ({
  conversations: [
    {
      id: '1',
      name: 'Alex Tremblay',
      avatar: '🧑‍💻',
      lastMessage: 'yo check this out 🔥',
      time: '2m',
      unread: 3,
      online: true,
    },
    {
      id: '2',
      name: 'Marie-Ève',
      avatar: '👩‍🎨',
      lastMessage: 'On se voit tantôt?',
      time: '15m',
      unread: 0,
      online: true,
    },
    {
      id: '3',
      name: 'Jayden K',
      avatar: '🏀',
      lastMessage: 'game tonight bro',
      time: '1h',
      unread: 1,
      online: false,
    },
    {
      id: '4',
      name: 'Sophie L',
      avatar: '🎵',
      lastMessage: 'sent you that playlist',
      time: '3h',
      unread: 0,
      online: false,
    },
    {
      id: '5',
      name: 'Nathan B',
      avatar: '📸',
      lastMessage: 'screenshot alert 👀',
      time: '5h',
      unread: 0,
      online: true,
    },
  ],
  activeConversation: null,
  messages: {
    '1': [
      { id: 'm1', text: 'Hey! 👋', sender: 'them', time: '10:30 AM' },
      { id: 'm2', text: 'Sup Alex, what\'s good?', sender: 'me', time: '10:31 AM' },
      { id: 'm3', text: 'Check out this new spot downtown', sender: 'them', time: '10:32 AM' },
      { id: 'm4', text: 'It\'s giving sovereign vibes fr', sender: 'them', time: '10:32 AM' },
      { id: 'm5', text: 'omw 🏃‍♂️', sender: 'me', time: '10:33 AM' },
      { id: 'm6', text: 'yo check this out 🔥', sender: 'them', time: '10:35 AM' },
    ],
    '2': [
      { id: 'm1', text: 'Salut! Ça va?', sender: 'them', time: '9:00 AM' },
      { id: 'm2', text: 'Oui toi? 😊', sender: 'me', time: '9:05 AM' },
      { id: 'm3', text: 'On se voit tantôt?', sender: 'them', time: '9:10 AM' },
    ],
    '3': [
      { id: 'm1', text: 'game tonight bro', sender: 'them', time: '8:00 AM' },
    ],
  },

  setActiveConversation: (convo) => set({ activeConversation: convo }),

  addMessage: (convoId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [convoId]: [...(state.messages[convoId] || []), message],
      },
    })),
}));

// Cliques store
export const useCliquesStore = create((set) => ({
  cliques: [
    { id: '1', name: 'Vieux-Québec Squad', emoji: '🏰', members: 24, distance: '0.5 km', tag: 'NEARBY' },
    { id: '2', name: 'MTL Underground', emoji: '🚇', members: 156, distance: '2.1 km', tag: 'TRENDING' },
    { id: '3', name: 'Campus Vibes', emoji: '📚', members: 89, distance: '0.8 km', tag: 'POPULAR' },
    { id: '4', name: 'Late Night Crew', emoji: '🌙', members: 43, distance: '1.2 km', tag: 'ACTIVE' },
    { id: '5', name: 'Foodie Collective', emoji: '🍕', members: 67, distance: '0.3 km', tag: 'NEARBY' },
    { id: '6', name: 'Skate Park Rats', emoji: '🛹', members: 31, distance: '3.4 km', tag: 'NEW' },
  ],
}));

// UI store
export const useUIStore = create((set) => ({
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
