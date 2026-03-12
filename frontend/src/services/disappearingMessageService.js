/**
 * disappearingMessageService.js — Self-Destructing Messages for Clique
 *
 * Messages can be set to disappear after a configurable time:
 *   - 5 seconds (Snap-style)
 *   - 30 seconds
 *   - 5 minutes
 *   - 1 hour
 *   - 24 hours
 *
 * The timer starts when the recipient READS the message (not when sent).
 * Bilingual labels throughout.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Timer Options ──────────────────────────────────────────
export const DISAPPEAR_OPTIONS = [
  {
    key: "off",
    seconds: 0,
    icon: "💬",
    fr: "Permanent",
    en: "Permanent",
    short: "∞",
  },
  {
    key: "5s",
    seconds: 5,
    icon: "💨",
    fr: "5 secondes",
    en: "5 seconds",
    short: "5s",
  },
  {
    key: "30s",
    seconds: 30,
    icon: "⏱️",
    fr: "30 secondes",
    en: "30 seconds",
    short: "30s",
  },
  {
    key: "5m",
    seconds: 300,
    icon: "⏰",
    fr: "5 minutes",
    en: "5 minutes",
    short: "5m",
  },
  {
    key: "1h",
    seconds: 3600,
    icon: "🕐",
    fr: "1 heure",
    en: "1 hour",
    short: "1h",
  },
  {
    key: "24h",
    seconds: 86400,
    icon: "🌅",
    fr: "24 heures",
    en: "24 hours",
    short: "24h",
  },
];

const SETTINGS_PREFIX = "clique_disappear_";

// ─── Per-Conversation Settings ──────────────────────────────

/**
 * Set the disappearing timer for a conversation.
 * @param {string} conversationId - User or clique ID
 * @param {string} optionKey - One of the DISAPPEAR_OPTIONS keys
 */
export async function setDisappearTimer(conversationId, optionKey) {
  const option = DISAPPEAR_OPTIONS.find((o) => o.key === optionKey);
  if (!option) return;

  await AsyncStorage.setItem(
    `${SETTINGS_PREFIX}${conversationId}`,
    JSON.stringify({
      key: option.key,
      seconds: option.seconds,
      setAt: new Date().toISOString(),
    })
  );

  console.log(
    `[Disappear] ⏱️ Timer set to ${option.short} for ${conversationId}`
  );
}

/**
 * Get the current disappearing timer for a conversation.
 * @param {string} conversationId
 * @returns {Object|null} Timer config or null (permanent)
 */
export async function getDisappearTimer(conversationId) {
  const stored = await AsyncStorage.getItem(
    `${SETTINGS_PREFIX}${conversationId}`
  );
  if (!stored) return null;

  const config = JSON.parse(stored);
  if (config.key === "off" || config.seconds === 0) return null;

  return config;
}

/**
 * Check if a message should be deleted based on its read time.
 * @param {Object} message - Message object with readAt timestamp
 * @param {number} disappearSeconds - Seconds after read to disappear
 * @returns {{ shouldDisappear: boolean, remainingMs: number }}
 */
export function checkMessageExpiry(message, disappearSeconds) {
  if (!disappearSeconds || disappearSeconds === 0) {
    return { shouldDisappear: false, remainingMs: Infinity };
  }

  if (!message.readAt) {
    // Not read yet — don't disappear
    return { shouldDisappear: false, remainingMs: Infinity };
  }

  const readTime = new Date(message.readAt).getTime();
  const expiryTime = readTime + disappearSeconds * 1000;
  const now = Date.now();
  const remainingMs = expiryTime - now;

  return {
    shouldDisappear: remainingMs <= 0,
    remainingMs: Math.max(0, remainingMs),
  };
}

/**
 * Filter out expired messages from a conversation.
 * @param {Array} messages - Array of message objects
 * @param {number} disappearSeconds - Timer duration
 * @returns {Array} Filtered messages (non-expired only)
 */
export function filterExpiredMessages(messages, disappearSeconds) {
  if (!disappearSeconds || disappearSeconds === 0) return messages;

  return messages.filter((msg) => {
    const { shouldDisappear } = checkMessageExpiry(msg, disappearSeconds);
    return !shouldDisappear;
  });
}

/**
 * Get a human-readable countdown string.
 * @param {number} remainingMs - Milliseconds remaining
 * @returns {string} Bilingual countdown (e.g. "2m 30s")
 */
export function formatCountdown(remainingMs) {
  if (remainingMs <= 0) return "Expiré / Expired";
  if (remainingMs === Infinity) return "";

  const totalSec = Math.ceil(remainingMs / 1000);

  if (totalSec < 60) return `${totalSec}s`;
  if (totalSec < 3600) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }

  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Get the display label for the current timer setting.
 * @param {string} optionKey
 * @returns {{ icon: string, label: string }}
 */
export function getTimerLabel(optionKey) {
  const option = DISAPPEAR_OPTIONS.find((o) => o.key === optionKey);
  if (!option || option.key === "off") {
    return { icon: "💬", label: "Permanent" };
  }
  return { icon: option.icon, label: `${option.fr} / ${option.en}` };
}
