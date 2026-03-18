// Zustand store for Clique state management
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

      // Getters
      getAuthHeader: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    {
      name: "clique-auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useStoriesStore = create((set, get) => ({
  // State
  stories: [],
  myStories: [],
  currentStoryIndex: 0,
  isLoading: false,
  hasMore: true,

  // Actions
  setStories: (stories) => set({ stories }),
  setMyStories: (myStories) => set({ myStories }),
  addStory: (story) =>
    set((state) => ({
      myStories: [story, ...state.myStories],
    })),
  removeStory: (storyId) =>
    set((state) => ({
      myStories: state.myStories.filter((s) => s.id !== storyId),
    })),
  markStoryViewed: (storyId) =>
    set((state) => ({
      stories: state.stories.map((group) => ({
        ...group,
        stories: group.stories.map((s) =>
          s.id === storyId ? { ...s, hasViewed: true } : s,
        ),
      })),
    })),
  setCurrentIndex: (index) => set({ currentStoryIndex: index }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useMessagesStore = create((set, get) => ({
  // State
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,

  // Actions
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.conversationId === conversationId ? { ...c, ...updates } : c,
      ),
    })),

  setActiveConversation: (conversation) =>
    set({ activeConversation: conversation }),

  setMessages: (userId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [userId]: messages },
    })),
  addMessage: (userId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: [
          ...(state.messages[userId] || []),
          { ...message, status: message.status || "sent" },
        ],
      },
    })),

  // Mark a single message as delivered or read
  updateMessageStatus: (userId, messageId, status) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: (state.messages[userId] || []).map((m) =>
          m.id === messageId ? { ...m, status } : m,
        ),
      },
    })),

  // Mark all outgoing messages in a conversation as read
  markAllRead: (userId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: (state.messages[userId] || []).map((m) =>
          m.sender === "me" && m.status !== "read"
            ? { ...m, status: "read" }
            : m,
        ),
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

export const useCliquesStore = create((set, get) => ({
  // State
  nearbyCliques: [],
  myCliques: [], // Cliques the user is a member of
  cliqueMessages: {}, // Map cliqueId → Array of messages
  isLoading: false,

  // Actions
  setNearbyCliques: (cliques) => set({ nearbyCliques: cliques }),
  setMyCliques: (cliques) => set({ myCliques: cliques }),

  setCliqueMessages: (cliqueId, messages) =>
    set((state) => ({
      cliqueMessages: { ...state.cliqueMessages, [cliqueId]: messages },
    })),

  addCliqueMessage: (cliqueId, message) =>
    set((state) => ({
      cliqueMessages: {
        ...state.cliqueMessages,
        [cliqueId]: [...(state.cliqueMessages[cliqueId] || []), message],
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

export const useUIStore = create((set) => ({
  // State
  activeTab: "camera",
  isCameraOpen: true,
  showStoryViewer: false,
  currentStoryGroup: null,
  aurumWhisper: null,
  lastAurumChime: 0,

  // Actions
  setActiveTab: (tab) => set ({ activeTab: tab }),
  setCameraOpen: (isOpen) => set({ isCameraOpen: isOpen }),
  setAurumWhisper: (whisper) => set({ aurumWhisper: whisper }),
  triggerAurumChime: () => set({ lastAurumChime: Date.now() }),
  openStoryViewer: (storyGroup) =>
    set({
      showStoryViewer: true,
      currentStoryGroup: storyGroup,
    }),
  closeStoryViewer: () =>
    set({
      showStoryViewer: false,
      currentStoryGroup: null,
    }),
}));
