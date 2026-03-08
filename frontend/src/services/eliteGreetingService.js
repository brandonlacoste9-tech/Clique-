// src/services/eliteGreetingService.js
// Imperial Greeting Orchestration for CLIQUE (2026 Protocol)

import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useMessagesStore } from "../store/cliqueStore";

export const triggerEliteWelcome = async (userName) => {
  const addMessage = useMessagesStore.getState().addMessage;

  // 1. Wait for the UI to settle after Suede Slide transition
  setTimeout(async () => {
    try {
      // 2. Play the Empire Chime
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/empire_chime.wav"),
      );
      await sound.playAsync();

      // 3. Heartbeat Haptic Pulse
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 4. Inject the System Message into the Elite (Chat) State
      const welcomeMessage = {
        id: "system_welcome",
        sender: "CLIQUE",
        text: `BIENVENUE, ${userName.toUpperCase()}. VOUS FAITES MAINTENANT PARTIE DE L'ÉLITE DE L'INSTANT.`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      };

      // Injecting into the 'CLIQUE' system chat thread
      addMessage("CLIQUE", welcomeMessage);
    } catch (error) {
      console.error("Failed to trigger Elite Welcome:", error);
    }
  }, 1500);
};
