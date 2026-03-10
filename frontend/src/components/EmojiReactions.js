// Emoji Reactions Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';

import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';
import { reactionsAPI } from '../api/cliqueApi';

const EMOJIS = [
  '❤️', '🔥', '😂', '😍', '😮', '😢', '😡', '👍', '👎', '👏', '🎉', '💯',
  '🚀', '✨', '💯', '🔥', '💯', '💯', '💯', '💯', '💯', '💯', '💯', '💯'
];

export default function EmojiReactions({ 
  storyId, 
  currentReaction, 
  onReactionChange 
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadReactions = async () => {
    try {
      const response = await reactionsAPI.getReactions(storyId);
      setReactions(response.data.reactions || []);
    } catch (err) {
      console.error('Failed to load reactions:', err);
    }
  };

  const handleReaction = async (emoji) => {
    setIsProcessing(true);
    
    try {
      if (currentReaction === emoji) {
        // Remove reaction
        await reactionsAPI.removeReaction(storyId);
        onReactionChange?.(null);
      } else {
        // Add reaction
        await reactionsAPI.addReaction(storyId, emoji);
        onReactionChange?.(emoji);
      }
      
      loadReactions();
    } catch (err) {
      console.error('Failed to update reaction:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            setShowPicker(!showPicker);
            if (!showPicker) loadReactions();
          }}
        >
          <Text style={styles.buttonText}>😊</Text>
          {reactions.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{reactions.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {showPicker && (
          <View style={styles.picker}>
            <FlatList
              data={EMOJIS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(emoji) => emoji}
              contentContainerStyle={styles.emojiList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.emojiButton,
                    currentReaction === item && styles.emojiButtonActive
                  ]}
                  onPress={() => handleReaction(item)}
                >
                  <Text style={styles.emoji}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Reactions list */}
      {reactions.length > 0 && (
        <View style={styles.reactionList}>
          {reactions.slice(0, 5).map((reaction) => (
            <View key={reaction.emoji} style={styles.reactionItem}>
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={styles.reactionCount}>{reaction.count}</Text>
            </View>
          ))}
          {reactions.length > 5 && (
            <Text style={styles.moreReactions}>
              +{reactions.length - 5} autres
            </Text>
          )}
        </View>
      )}
    </>
  );
}

export function QuickReactionBar({ onReaction }) {
  const quickEmojis = ['❤️', '🔥', '😂', '😍', '👍'];

  return (
    <View style={styles.container}>
      {quickEmojis.map((emoji) => (
        <TouchableOpacity 
          key={emoji}
          style={styles.quickButton}
          onPress={() => onReaction?.(emoji)}
        >
          <Text style={styles.quickEmoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function ReactionCount({ count }) {
  if (!count || count === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.leather.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  buttonText: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
  },
  picker: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.leather.black,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    borderTopWidth: 0,
  },
  emojiList: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonActive: {
    backgroundColor: colors.gold.DEFAULT,
  },
  emoji: {
    fontSize: 24,
  },
  reactionList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.leather.black,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  reactionCount: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
  },
  moreReactions: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
  quickButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.leather.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  quickEmoji: {
    fontSize: 18,
  },
  count: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
});
