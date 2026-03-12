// src/services/pushNotificationService.js
// Imperial Push Notification Engine for CLIQUE (2026 Protocol)
// Bilingual FR-CA / EN — Expo Push API Integration

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useAuthStore } from "../store/cliqueStore";
import { colors } from "../theme/cliqueTheme";

// ─── NOTIFICATION HANDLER CONFIG ───────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── BILINGUAL NOTIFICATION TEMPLATES ──────────────────────────────
const NOTIFICATION_TEMPLATES = {
  new_message: (senderName) => ({
    title: `💬 ${senderName}`,
    body: `T'a envoyé un message / Sent you a message`,
    categoryIdentifier: "message",
  }),
  voice_note: (senderName) => ({
    title: `🎤 ${senderName}`,
    body: `Note vocale reçue / Voice note received`,
    categoryIdentifier: "message",
  }),
  sticker: (senderName) => ({
    title: `😎 ${senderName}`,
    body: `T'a envoyé un sticker / Sent a sticker`,
    categoryIdentifier: "message",
  }),
  media: (senderName, mediaType) => ({
    title: `${mediaType === "video" ? "🎥" : "📷"} ${senderName}`,
    body: mediaType === "video"
      ? `T'a envoyé une vidéo / Sent you a video`
      : `T'a envoyé une photo / Sent you a photo`,
    categoryIdentifier: "message",
  }),
  friend_request: (senderName) => ({
    title: `👑 Demande d'ami / Friend Request`,
    body: `${senderName} veut rejoindre ton Élite / wants to join your Elite`,
    categoryIdentifier: "social",
  }),
  friend_accepted: (senderName) => ({
    title: `⚜️ L'Élite grandit / Elite Growing`,
    body: `${senderName} est maintenant dans ton Élite / is now in your Elite`,
    categoryIdentifier: "social",
  }),
  clique_message: (cliqueName, senderName) => ({
    title: `🏰 ${cliqueName}`,
    body: `${senderName}: Nouveau message / New message`,
    categoryIdentifier: "clique",
  }),
  clique_joined: (cliqueName) => ({
    title: `📍 Territoire / Territory`,
    body: `Tu as rejoint ${cliqueName}! / You joined ${cliqueName}!`,
    categoryIdentifier: "clique",
  }),
  streak_warning: (friendName, hoursLeft) => ({
    title: `🔥 Streak en danger / Streak at Risk!`,
    body: `${hoursLeft}h restantes avec ${friendName} / ${hoursLeft}h left with ${friendName}`,
    categoryIdentifier: "streak",
  }),
  streak_lost: (friendName) => ({
    title: `💔 Streak perdu / Streak Lost`,
    body: `Ton streak avec ${friendName} est terminé / Your streak with ${friendName} ended`,
    categoryIdentifier: "streak",
  }),
  streak_milestone: (friendName, count) => ({
    title: `🔥 ${count} jours / days!`,
    body: `Streak légendaire avec ${friendName} / Legendary streak with ${friendName}`,
    categoryIdentifier: "streak",
  }),
  story_reply: (senderName) => ({
    title: `✨ Réponse à ta story / Story Reply`,
    body: `${senderName} a répondu à ta story / replied to your story`,
    categoryIdentifier: "story",
  }),
  daily_reminder: () => ({
    title: `👑 L'Élite t'attend / The Elite Awaits`,
    body: `Tes amis sont actifs. Reviens! / Your friends are online. Come back!`,
    categoryIdentifier: "engagement",
  }),
};

// ─── PUSH TOKEN REGISTRATION ───────────────────────────────────────

/**
 * Register for push notifications and return the Expo push token.
 * Token should be sent to the backend for server-side push delivery.
 */
export const registerForPushNotifications = async () => {
  let token = null;

  // Must be a physical device
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not determined
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  // Get Expo push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "clique-2026-elite", // Replace with real Expo project ID
    });
    token = tokenData.data;
    console.log("Expo Push Token:", token);
  } catch (err) {
    console.error("Failed to get push token:", err);
    return null;
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("elite_messages", {
      name: "L'Élite Messages / Elite Messages",
      importance: Notifications.AndroidImportance.MAX,
      sound: "empire_chime.wav",
      vibrationPattern: [0, 100, 50, 100],
      lightColor: colors.gold.DEFAULT,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync("elite_social", {
      name: "Social / Amis",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 50, 50, 50],
      lightColor: colors.gold.DEFAULT,
      enableLights: true,
    });

    await Notifications.setNotificationChannelAsync("elite_streaks", {
      name: "Streaks 🔥",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "empire_chime.wav",
      vibrationPattern: [0, 100, 100, 100],
      lightColor: "#FF6B00",
    });
  }

  return token;
};

// ─── LOCAL NOTIFICATION TRIGGERS ───────────────────────────────────

/**
 * Send a local notification immediately (used for testing / fallback).
 */
export const sendLocalNotification = async (type, data = {}) => {
  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) {
    console.warn(`Unknown notification type: ${type}`);
    return;
  }

  let notifContent;
  switch (type) {
    case "new_message":
    case "voice_note":
    case "sticker":
    case "story_reply":
    case "friend_request":
    case "friend_accepted":
      notifContent = template(data.senderName || "Quelqu'un");
      break;
    case "media":
      notifContent = template(data.senderName || "Quelqu'un", data.mediaType || "image");
      break;
    case "clique_message":
      notifContent = template(data.cliqueName || "La Clique", data.senderName || "Quelqu'un");
      break;
    case "clique_joined":
      notifContent = template(data.cliqueName || "La Clique");
      break;
    case "streak_warning":
      notifContent = template(data.friendName || "Un ami", data.hoursLeft || 4);
      break;
    case "streak_lost":
      notifContent = template(data.friendName || "Un ami");
      break;
    case "streak_milestone":
      notifContent = template(data.friendName || "Un ami", data.count || 7);
      break;
    case "daily_reminder":
      notifContent = template();
      break;
    default:
      notifContent = { title: "CLIQUE", body: "Nouvelle notification / New notification" };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      ...notifContent,
      sound: "empire_chime.wav",
      data: { type, ...data },
      badge: 1,
    },
    trigger: null, // Immediately
  });
};

// ─── SCHEDULED NOTIFICATIONS ───────────────────────────────────────

/**
 * Schedule a streak warning notification.
 * Fires X hours before streak expires.
 */
export const scheduleStreakWarning = async (friendName, hoursUntilExpiry) => {
  const triggerHours = Math.max(0, hoursUntilExpiry - 4); // Warn 4h before

  await Notifications.scheduleNotificationAsync({
    content: {
      ...NOTIFICATION_TEMPLATES.streak_warning(friendName, 4),
      sound: "empire_chime.wav",
      data: { type: "streak_warning", friendName },
    },
    trigger: {
      seconds: triggerHours * 3600,
      channelId: "elite_streaks",
    },
  });
};

/**
 * Schedule a daily engagement reminder.
 * Fires at 7 PM local time if user hasn't opened the app.
 */
export const scheduleDailyReminder = async () => {
  // Cancel any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      ...NOTIFICATION_TEMPLATES.daily_reminder(),
      sound: "empire_chime.wav",
      data: { type: "daily_reminder" },
    },
    trigger: {
      hour: 19,
      minute: 0,
      repeats: true,
      channelId: "elite_social",
    },
  });
};

// ─── NOTIFICATION LISTENERS ────────────────────────────────────────

/**
 * Set up notification response listener (when user taps a notification).
 * Returns an unsubscribe function.
 */
export const setupNotificationListeners = (navigationRef) => {
  // When user taps a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;

      if (!navigationRef?.current) return;

      switch (data.type) {
        case "new_message":
        case "voice_note":
        case "sticker":
        case "media":
          navigationRef.current.navigate("ChatDetail", {
            userId: data.senderId,
            userName: data.senderName,
          });
          break;

        case "clique_message":
          navigationRef.current.navigate("CliqueChat", {
            cliqueId: data.cliqueId,
            cliqueName: data.cliqueName,
          });
          break;

        case "friend_request":
        case "friend_accepted":
          navigationRef.current.navigate("AddFriends");
          break;

        case "story_reply":
          navigationRef.current.navigate("ChatDetail", {
            userId: data.senderId,
            userName: data.senderName,
          });
          break;

        case "streak_warning":
        case "streak_lost":
        case "streak_milestone":
          navigationRef.current.navigate("Chat");
          break;

        default:
          break;
      }
    }
  );

  // When notification is received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      const data = notification.request.content.data;
      console.log("Notification received in foreground:", data.type);
      // Could update badge count, show in-app toast, etc.
    }
  );

  return () => {
    responseSubscription.remove();
    receivedSubscription.remove();
  };
};

/**
 * Clear all notifications and reset badge count.
 */
export const clearAllNotifications = async () => {
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.setBadgeCountAsync(0);
};

export default {
  registerForPushNotifications,
  sendLocalNotification,
  scheduleStreakWarning,
  scheduleDailyReminder,
  setupNotificationListeners,
  clearAllNotifications,
  NOTIFICATION_TEMPLATES,
};
