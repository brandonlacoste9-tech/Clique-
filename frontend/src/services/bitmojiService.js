// src/services/bitmojiService.js
// Bitmoji & Avatar Rendering Service for CLIQUE (2026 Protocol)
// Snap Kit Bitmoji integration layer with fallback avatar generation

import { colors } from "../theme/cliqueTheme";

// Bitmoji sticker IDs for common expressions
const BITMOJI_EXPRESSIONS = {
  wave: "wave_hello",
  fire: "fire_excited",
  crown: "crown_royalty",
  ghost: "ghost_stealth",
  party: "party_celebration",
  flex: "flex_strong",
  think: "think_hmm",
  laugh: "laugh_lol",
  cool: "cool_sunglasses",
  cry: "cry_sad",
};

// Generate a deterministic color from a user ID for fallback avatars
const hashColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 45%)`;
};

// Generate initials from display name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Build the avatar URL for a user.
 * Priority:
 * 1. Bitmoji URL from Snap Kit (if linked)
 * 2. Custom uploaded avatar
 * 3. Pravatar fallback (deterministic by user ID)
 */
export const getAvatarUrl = (user) => {
  if (!user) return "https://i.pravatar.cc/150?u=unknown";

  // 1. Snap Bitmoji (highest priority)
  if (user.bitmojiAvatarUrl) {
    return user.bitmojiAvatarUrl;
  }

  // 2. Custom uploaded avatar
  if (user.avatarUrl && !user.avatarUrl.includes("placeholder")) {
    return user.avatarUrl;
  }

  // 3. Deterministic fallback
  const seed = user.id || user.username || "clique";
  return `https://i.pravatar.cc/150?u=${seed}`;
};

/**
 * Get a Bitmoji sticker URL for a specific expression.
 * Uses Snap Kit Bitmoji API if available, otherwise returns emoji fallback.
 */
export const getBitmojiSticker = (user, expression = "wave") => {
  if (user?.snapKitLinked && user?.bitmojiSelfieId) {
    // Real Snap Kit Bitmoji sticker URL
    const stickerId = BITMOJI_EXPRESSIONS[expression] || BITMOJI_EXPRESSIONS.wave;
    return `https://sdk.bitmoji.com/render/panel/${stickerId}-${user.bitmojiSelfieId}-v1.png?transparent=1&width=300`;
  }

  // Emoji fallback map
  const emojiMap = {
    wave: "👋",
    fire: "🔥",
    crown: "👑",
    ghost: "👻",
    party: "🎉",
    flex: "💪",
    think: "🤔",
    laugh: "😂",
    cool: "😎",
    cry: "😢",
  };

  return emojiMap[expression] || "👋";
};

/**
 * Generate a "Profile Card" config for rendering rich user cards.
 * Used on Map markers, chat headers, and profile overlays.
 */
export const buildProfileCard = (user) => {
  const avatarUrl = getAvatarUrl(user);
  const initials = getInitials(user?.displayName || user?.username);
  const accentColor = hashColor(user?.id || "default");

  return {
    avatarUrl,
    initials,
    accentColor,
    displayName: user?.displayName || user?.username || "Anonyme / Anonymous",
    username: user?.username ? `@${user.username}` : "@clique",
    isOnline: user?.isOnline || false,
    isSnapLinked: !!user?.bitmojiAvatarUrl,
    eliteRank: user?.eliteRank || "INITIÉ / INITIATE",
    influence: user?.influence || 0,
    streakCount: user?.streakCount || 0,
  };
};

/**
 * Available Bitmoji expressions for the sticker picker in chat.
 */
export const STICKER_PICKER_OPTIONS = [
  { key: "wave", emoji: "👋", label: "Salut / Hey" },
  { key: "fire", emoji: "🔥", label: "C'est chaud / Fire" },
  { key: "crown", emoji: "👑", label: "Royauté / Royalty" },
  { key: "ghost", emoji: "👻", label: "Fantôme / Ghost" },
  { key: "party", emoji: "🎉", label: "Fête / Party" },
  { key: "flex", emoji: "💪", label: "Fort / Strong" },
  { key: "think", emoji: "🤔", label: "Hmm..." },
  { key: "laugh", emoji: "😂", label: "MDR / LOL" },
  { key: "cool", emoji: "😎", label: "Cool" },
  { key: "cry", emoji: "😢", label: "Triste / Sad" },
];

export default {
  getAvatarUrl,
  getBitmojiSticker,
  buildProfileCard,
  STICKER_PICKER_OPTIONS,
  BITMOJI_EXPRESSIONS,
};
