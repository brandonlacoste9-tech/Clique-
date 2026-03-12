/**
 * conversationManagerService.js — Mute, Archive & Pin for Clique
 *
 * Manage conversation states:
 *   - Mute (silence notifications for a conversation)
 *   - Archive (hide from main list, accessible in archive folder)
 *   - Pin (stick to top of chat list)
 *
 * All state persisted via AsyncStorage. Trilingual labels.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const MUTED_KEY = "clique_muted_convos";
const ARCHIVED_KEY = "clique_archived_convos";
const PINNED_KEY = "clique_pinned_convos";

// ─── Mute Options ───────────────────────────────────────────
export const MUTE_OPTIONS = [
  {
    key: "off",
    duration: 0,
    fr: "Notifications activées",
    en: "Notifications on",
    es: "Notificaciones activadas",
    icon: "🔔",
  },
  {
    key: "1h",
    duration: 3600,
    fr: "1 heure",
    en: "1 hour",
    es: "1 hora",
    icon: "🔕",
  },
  {
    key: "8h",
    duration: 28800,
    fr: "8 heures",
    en: "8 hours",
    es: "8 horas",
    icon: "🔕",
  },
  {
    key: "24h",
    duration: 86400,
    fr: "24 heures",
    en: "24 hours",
    es: "24 horas",
    icon: "🔕",
  },
  {
    key: "7d",
    duration: 604800,
    fr: "7 jours",
    en: "7 days",
    es: "7 días",
    icon: "🔕",
  },
  {
    key: "forever",
    duration: -1,
    fr: "Toujours",
    en: "Always",
    es: "Siempre",
    icon: "🔇",
  },
];

// ─── Helper: Load Set ───────────────────────────────────────
async function loadSet(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveSet(key, data) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// ─── MUTE ───────────────────────────────────────────────────

export async function muteConversation(conversationId, muteKey) {
  const option = MUTE_OPTIONS.find((o) => o.key === muteKey);
  if (!option) return;

  const muted = await loadSet(MUTED_KEY);

  if (muteKey === "off") {
    delete muted[conversationId];
  } else {
    muted[conversationId] = {
      key: option.key,
      duration: option.duration,
      mutedAt: new Date().toISOString(),
    };
  }

  await saveSet(MUTED_KEY, muted);
  console.log(`[ConvoManager] 🔕 ${conversationId} muted: ${muteKey}`);
}

export async function isConversationMuted(conversationId) {
  const muted = await loadSet(MUTED_KEY);
  const entry = muted[conversationId];
  if (!entry) return false;

  // "forever" never expires
  if (entry.duration === -1) return true;

  // Check if mute has expired
  const mutedAt = new Date(entry.mutedAt).getTime();
  const expiresAt = mutedAt + entry.duration * 1000;
  if (Date.now() > expiresAt) {
    // Auto-unmute
    delete muted[conversationId];
    await saveSet(MUTED_KEY, muted);
    return false;
  }

  return true;
}

export async function getMuteStatus(conversationId) {
  const muted = await loadSet(MUTED_KEY);
  return muted[conversationId] || null;
}

// ─── ARCHIVE ────────────────────────────────────────────────

export async function archiveConversation(conversationId) {
  const archived = await loadSet(ARCHIVED_KEY);
  archived[conversationId] = {
    archivedAt: new Date().toISOString(),
  };
  await saveSet(ARCHIVED_KEY, archived);
  console.log(`[ConvoManager] 📦 ${conversationId} archived`);
}

export async function unarchiveConversation(conversationId) {
  const archived = await loadSet(ARCHIVED_KEY);
  delete archived[conversationId];
  await saveSet(ARCHIVED_KEY, archived);
  console.log(`[ConvoManager] 📤 ${conversationId} unarchived`);
}

export async function isConversationArchived(conversationId) {
  const archived = await loadSet(ARCHIVED_KEY);
  return !!archived[conversationId];
}

export async function getArchivedConversations() {
  return loadSet(ARCHIVED_KEY);
}

// ─── PIN ────────────────────────────────────────────────────

export async function pinConversation(conversationId) {
  const pinned = await loadSet(PINNED_KEY);
  pinned[conversationId] = {
    pinnedAt: new Date().toISOString(),
  };
  await saveSet(PINNED_KEY, pinned);
  console.log(`[ConvoManager] 📌 ${conversationId} pinned`);
}

export async function unpinConversation(conversationId) {
  const pinned = await loadSet(PINNED_KEY);
  delete pinned[conversationId];
  await saveSet(PINNED_KEY, pinned);
  console.log(`[ConvoManager] 📌 ${conversationId} unpinned`);
}

export async function isConversationPinned(conversationId) {
  const pinned = await loadSet(PINNED_KEY);
  return !!pinned[conversationId];
}

export async function getPinnedConversations() {
  return loadSet(PINNED_KEY);
}

// ─── Sort Conversations ─────────────────────────────────────
/**
 * Sort conversations: pinned first, then by last message time.
 * Archived conversations are filtered out.
 */
export async function sortConversations(conversations) {
  const pinned = await loadSet(PINNED_KEY);
  const archived = await loadSet(ARCHIVED_KEY);

  return conversations
    .filter((c) => !archived[c.id])
    .sort((a, b) => {
      const aPinned = !!pinned[a.id];
      const bPinned = !!pinned[b.id];
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      // Then by timestamp
      return (
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
      );
    });
}
