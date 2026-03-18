
import { Audio } from 'expo-av';

let chimeSound = null;

export const audioService = {
  loadSounds: async () => {
    try {
      // In production, this would be a local asset: require('../../assets/sounds/empire_chime.mp3')
      // For now, using a premium sounding remote placeholder
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ring-01.mp3' } 
      );
      chimeSound = sound;
    } catch (e) {
      console.log('Failed to load sounds:', e);
    }
  },

  playEmpireChime: async () => {
    try {
      if (!chimeSound) await audioService.loadSounds();
      if (chimeSound) {
        await chimeSound.replayAsync();
      }
    } catch (e) {
      console.log('Error playing chime:', e);
    }
  }
};
