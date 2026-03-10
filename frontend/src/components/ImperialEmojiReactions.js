import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/cliqueTheme';

const emojis = ['❤️', '🔥', '😂', '😍', '😎', '🤔', '👏', '💯'];

export default function ImperialEmojiReactions({
  onReact,
}) {
  const [showPicker, setShowPicker] = React.useState(false);

  const handleReact = (emoji) => {
    onReact?.(emoji);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPicker(!showPicker)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>😊</Text>
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.picker}>
          {emojis.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiItem}
              onPress={() => handleReact(emoji)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  buttonText: {
    fontSize: 20,
  },
  picker: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    ...shadows.card,
  },
  emojiItem: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
});
