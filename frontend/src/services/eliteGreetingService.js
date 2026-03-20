// src/services/eliteGreetingService.js
// Imperial Greeting Orchestration for CHATSNAP (2026 Protocol)
// Bilingual FR-CA / EN — Randomized Luxury Greeting Engine

import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useMessagesStore } from "../store/cliqueStore";

// ─── BILINGUAL GREETING POOLS ──────────────────────────────────────
const WELCOME_MESSAGES = {
  fr: [
    (name) => `BIENVENUE, ${name}. TU FAIS MAINTENANT PARTIE DE L'ÉLITE DE L'INSTANT.`,
    (name) => `${name}, L'EMPIRE T'ACCUEILLE. TON RÈGNE COMMENCE ICI.`,
    (name) => `SALUT ${name}! LA SOUVERAINETÉ EST MAINTENANT À TOI.`,
    (name) => `${name} — L'OR IMPÉRIAL COULE DANS TES VEINES. BIENVENUE.`,
    (name) => `L'ÉLITE RECONNAÎT ${name}. PRENDS TA PLACE.`,
    (name) => `HEY ${name}! LE TERRITOIRE EST PRÊT. C'EST À TOI.`,
  ],
  en: [
    (name) => `WELCOME, ${name}. YOU ARE NOW PART OF THE INSTANT ELITE.`,
    (name) => `${name}, THE EMPIRE WELCOMES YOU. YOUR REIGN BEGINS.`,
    (name) => `HEY ${name}! SOVEREIGNTY IS NOW YOURS.`,
    (name) => `${name} — IMPERIAL GOLD FLOWS IN YOUR VEINS. WELCOME.`,
    (name) => `THE ELITE RECOGNIZES ${name}. TAKE YOUR PLACE.`,
    (name) => `${name}! THE TERRITORY IS READY. IT'S YOURS.`,
  ],
};

const DAILY_GREETINGS = {
  morning: {
    fr: [
      (name) => `Bonjour ${name}. L'Empire se réveille avec toi. ☀️`,
      (name) => `Bon matin ${name}! Prêt à conquérir? ⚜️`,
      (name) => `Salut ${name}. Le territoire t'attend. 🌅`,
    ],
    en: [
      (name) => `Good morning ${name}. The Empire wakes with you. ☀️`,
      (name) => `Morning ${name}! Ready to conquer? ⚜️`,
      (name) => `Hey ${name}. The territory awaits. 🌅`,
    ],
  },
  afternoon: {
    fr: [
      (name) => `Bon après-midi ${name}. L'Élite est active. 🔥`,
      (name) => `${name}, ton empire t'attend. 👑`,
      (name) => `Salut ${name}! Qu'est-ce qui se passe dans le territoire? 📍`,
    ],
    en: [
      (name) => `Good afternoon ${name}. The Elite is active. 🔥`,
      (name) => `${name}, your empire awaits. 👑`,
      (name) => `Hey ${name}! What's happening in the territory? 📍`,
    ],
  },
  evening: {
    fr: [
      (name) => `Bonsoir ${name}. L'Élite brille dans la nuit. 🌙`,
      (name) => `${name}, soirée impériale activée. ✨`,
      (name) => `Hey ${name}! Les souverains sont actifs ce soir. 🥂`,
    ],
    en: [
      (name) => `Good evening ${name}. The Elite shines at night. 🌙`,
      (name) => `${name}, imperial evening activated. ✨`,
      (name) => `Hey ${name}! The sovereigns are online tonight. 🥂`,
    ],
  },
  night: {
    fr: [
      (name) => `${name}. Mode nuit impérial. Fantôme activé. 👻`,
      (name) => `Bonne nuit ${name}. L'Empire veille. 🌃`,
      (name) => `Encore debout ${name}? L'Élite ne dort jamais. 💫`,
    ],
    en: [
      (name) => `${name}. Imperial night mode. Ghost activated. 👻`,
      (name) => `Good night ${name}. The Empire watches. 🌃`,
      (name) => `Still up ${name}? The Elite never sleeps. 💫`,
    ],
  },
};

// ─── STREAK MILESTONES ─────────────────────────────────────────────
const STREAK_CELEBRATIONS = {
  fr: [
    (count) => `🔥 STREAK DE ${count} JOURS! L'engagement impérial est réel.`,
    (count) => `${count} jours de feu! 🔥 Tu es un vrai souverain.`,
    (count) => `INCROYABLE. ${count} jours sans arrêter. L'Élite te salue.`,
  ],
  en: [
    (count) => `🔥 ${count} DAY STREAK! Imperial commitment is real.`,
    (count) => `${count} days of fire! 🔥 You're a true sovereign.`,
    (count) => `INCREDIBLE. ${count} days without stopping. The Elite salutes you.`,
  ],
};

// ─── UTILITY ───────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
};

const getBilingualMessage = (frPool, enPool, ...args) => {
  const fr = pick(frPool)(...args);
  const en = pick(enPool)(...args);
  return `${fr}\n\n${en}`;
};

// ─── HAPTIC PATTERNS ───────────────────────────────────────────────
const playImperialPulse = async () => {
  // Double-tap heartbeat pattern
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await new Promise((r) => setTimeout(r, 100));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await new Promise((r) => setTimeout(r, 300));
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

const playStreakPulse = async () => {
  // Triple fire pulse
  for (let i = 0; i < 3; i++) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 80));
  }
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// ─── PUBLIC GREETING TRIGGERS ──────────────────────────────────────

/**
 * triggerEliteWelcome — Called on first login/signup.
 * Plays Empire Chime + Imperial Haptic + Bilingual Welcome Message.
 */
export const triggerEliteWelcome = async (userName) => {
  const addMessage = useMessagesStore.getState().addMessage;
  const name = (userName || "Souverain").toUpperCase();

  setTimeout(async () => {
    try {
      // 1. Play the Empire Chime
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/empire_chime.wav"),
        );
        await sound.playAsync();
      } catch (soundErr) {
        console.log("Sound not available, skipping chime");
      }

      // 2. Imperial Haptic Pulse
      await playImperialPulse();

      // 3. Bilingual Welcome Message
      const text = getBilingualMessage(
        WELCOME_MESSAGES.fr,
        WELCOME_MESSAGES.en,
        name,
      );

      addMessage("CHATSNAP", {
        id: `system_welcome_${Date.now()}`,
        sender: "CHATSNAP",
        text,
        timestamp: new Date().toISOString(),
        isSystem: true,
      });
    } catch (error) {
      console.error("Failed to trigger Elite Welcome:", error);
    }
  }, 1500);
};

/**
 * triggerDailyGreeting — Called when user opens app (once per session).
 * Time-aware bilingual greeting.
 */
export const triggerDailyGreeting = async (userName) => {
  const addMessage = useMessagesStore.getState().addMessage;
  const name = userName || "Souverain";
  const timeOfDay = getTimeOfDay();

  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const greetingPool = DAILY_GREETINGS[timeOfDay];
    const text = getBilingualMessage(
      greetingPool.fr,
      greetingPool.en,
      name,
    );

    addMessage("CHATSNAP", {
      id: `system_daily_${Date.now()}`,
      sender: "CHATSNAP",
      text,
      timestamp: new Date().toISOString(),
      isSystem: true,
    });
  } catch (error) {
    console.error("Failed to trigger Daily Greeting:", error);
  }
};

/**
 * triggerStreakCelebration — Called when user hits streak milestones.
 */
export const triggerStreakCelebration = async (streakCount) => {
  const addMessage = useMessagesStore.getState().addMessage;

  try {
    await playStreakPulse();

    const text = getBilingualMessage(
      STREAK_CELEBRATIONS.fr,
      STREAK_CELEBRATIONS.en,
      streakCount,
    );

    addMessage("CHATSNAP", {
      id: `system_streak_${Date.now()}`,
      sender: "CHATSNAP",
      text,
      timestamp: new Date().toISOString(),
      isSystem: true,
    });
  } catch (error) {
    console.error("Failed to trigger Streak Celebration:", error);
  }
};

/**
 * triggerCliqueJoined — Called when user joins a new clique.
 */
export const triggerCliqueJoined = async (cliqueName) => {
  const addMessage = useMessagesStore.getState().addMessage;

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const fr = `Tu as rejoint la clique "${cliqueName}". Le territoire s'agrandit. 📍`;
    const en = `You've joined the clique "${cliqueName}". The territory expands. 📍`;

    addMessage("CHATSNAP", {
      id: `system_clique_${Date.now()}`,
      sender: "CHATSNAP",
      text: `${fr}\n\n${en}`,
      timestamp: new Date().toISOString(),
      isSystem: true,
    });
  } catch (error) {
    console.error("Failed to trigger Clique Joined:", error);
  }
};
/**
 * triggerYoloModeActivated — Called when user selects YOLO lens.
 */
export const triggerYoloModeActivated = async () => {
  const addMessage = useMessagesStore.getState().addMessage;

  try {
    // 1. Heavy Pulse
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((r) => setTimeout(r, 200));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 2. Bilingual Message
    const fr = "👁️ MODE YOLO ACTIVÉ. VISION SOUVERAINE EN TEMPS RÉEL.";
    const en = "👁️ YOLO MODE ACTIVATED. REAL-TIME SOVEREIGN VISION.";

    addMessage("CHATSNAP", {
      id: `system_yolo_${Date.now()}`,
      sender: "CHATSNAP",
      text: `${fr}\n\n${en}`,
      timestamp: new Date().toISOString(),
      isSystem: true,
    });
  } catch (error) {
    console.error("Failed to trigger YOLO Activation:", error);
  }
};
