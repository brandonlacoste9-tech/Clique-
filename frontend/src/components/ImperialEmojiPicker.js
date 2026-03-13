import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/chatsnapTheme';

const emojis = [
  '❤️', '🔥', '😂', '😍', '😎', '🤔', '👏', '💯',
  '🎉', '✨', '💯', '🔥', '💯', '🔥', '💯', '🔥',
];

export default function ImperialEmojiPicker({
  onSelect,
  style,
}) {
  const handleEmojiPress = (emoji) => {
    onSelect?.(emoji);
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={emojis}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.emojiItem}
            onPress={() => handleEmojiPress(item)}
          >
            <Text style={styles.emoji}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={8}
        contentContainerStyle={styles.emojiList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    ...shadows.card,
  },
  emojiList: {
    gap: spacing.sm,
  },
  emojiItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});
