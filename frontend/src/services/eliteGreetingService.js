// src/services/eliteGreetingService.js
// Imperial Greeting Orchestration for Zyeuté (2026 Protocol)

import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useMessagesStore } from "../store/chatsnapStore";

export const triggerEliteWelcome = async (userName) => {
  const addMessage = useMessagesStore.getState().addMessage;

  // 1. Wait for the UI to settle after Suede Slide transition
  setTimeout(async () => {
    try {
      // 2. Play the Empire Chime (placeholder for now)
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/empire_chime.js"),
        );
        await sound.playAsync();
      } catch (soundErr) {
        console.log("Sound file not found, using haptic only");
      }

      // 3. Heartbeat Haptic Pulse
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 4. Inject the System Message into the Elite (Chat) State
      const welcomeMessage = {
        id: "system_welcome",
        sender: "ZYEYTÉ",
        text: `BIENVENUE, ${userName.toUpperCase()}. VOUS FAITES MAINTENANT PARTIE DE L'ÉLITE DE L'INSTANT.`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      };

      // Injecting into the 'ZYEYTÉ' system chat thread
      addMessage("ZYEYTÉ", welcomeMessage);
    } catch (error) {
      console.error("Failed to trigger Elite Welcome:", error);
    }
  }, 1500);
};
