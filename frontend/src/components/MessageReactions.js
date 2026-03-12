import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from "react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { colors, spacing, borderRadius } from "../theme/cliqueTheme";

const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "🔥", "⚜️", "💯", "👍", "👎"];

/**
 * MessageReactions — Long-press emoji reaction picker for individual messages.
 *
 * Usage: Wrap message bubble, handles long-press gesture.
 * Renders existing reactions below the bubble + reaction picker modal.
 */
export default function MessageReactions({
  children,
  messageId,
  messageText,
  reactions = [],
  onReact,
  onAction,
  isMe,
  language = "fr",
}) {
  const [showPicker, setShowPicker] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pickerAnim = useRef(new Animated.Value(0)).current;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Squeeze animation on bubble
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowPicker(true);

    // Animate picker in
    Animated.spring(pickerAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 180,
    }).start();
  };

  const handleReact = (emoji) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Close picker with animation
    Animated.timing(pickerAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowPicker(false);
      if (onReact) onReact(messageId, emoji);
    });
  };

  const handleCommand = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(pickerAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowPicker(false);
      if (onAction) onAction(action, { id: messageId, text: messageText });
    });
  };

  const closePicker = () => {
    Animated.timing(pickerAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowPicker(false));
  };

  const ACTIONS = {
    fr: [
      { key: "reply", label: "Répondre", icon: "↩️" },
      { key: "forward", label: "Transférer", icon: "➡️" },
      { key: "copy", label: "Copier", icon: "📝" },
      { key: "delete", label: "Supprimer", icon: "🗑️", danger: true },
    ],
    en: [
      { key: "reply", label: "Reply", icon: "↩️" },
      { key: "forward", label: "Forward", icon: "➡️" },
      { key: "copy", label: "Copy", icon: "📝" },
      { key: "delete", label: "Delete", icon: "🗑️", danger: true },
    ],
    es: [
      { key: "reply", label: "Responder", icon: "↩️" },
      { key: "forward", label: "Reenviar", icon: "➡️" },
      { key: "copy", label: "Copiar", icon: "📝" },
      { key: "delete", label: "Eliminar", icon: "🗑️", danger: true },
    ],
  };

  const currentActions = ACTIONS[language] || ACTIONS.fr;

  // Group reactions by emoji and count
  const groupedReactions = {};
  (reactions || []).forEach((r) => {
    if (!groupedReactions[r.emoji]) {
      groupedReactions[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
    }
    groupedReactions[r.emoji].count++;
    groupedReactions[r.emoji].users.push(r.userId);
  });
  const reactionList = Object.values(groupedReactions);

  return (
    <View>
      {/* Message bubble with long-press */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={400}
          activeOpacity={1}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>

      {/* Existing reactions display */}
      {reactionList.length > 0 && (
        <View
          style={[
            styles.reactionsRow,
            isMe ? styles.reactionsRowRight : styles.reactionsRowLeft,
          ]}
        >
          {reactionList.map((reaction) => (
            <TouchableOpacity
              key={reaction.emoji}
              style={styles.reactionBubble}
              onPress={() => handleReact(reaction.emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              {reaction.count > 1 && (
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Picker Modal */}
      <Modal visible={showPicker} transparent animationType="none">
        <View style={styles.pickerOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={styles.pickerOverlayInvis}
            activeOpacity={1}
            onPress={closePicker}
          />
          <Animated.View
            style={[
              styles.pickerWrapper,
              {
                opacity: pickerAnim,
                transform: [
                  {
                    scale: pickerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                  {
                    translateY: pickerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Emojis Row */}
            <View style={styles.pickerContainer}>
              {REACTION_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.pickerEmoji}
                  onPress={() => handleReact(emoji)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.pickerEmojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions List */}
            <View style={styles.actionsMenu}>
              {currentActions.map((action, idx) => (
                <TouchableOpacity
                  key={action.key}
                  style={[
                    styles.actionItem,
                    idx === currentActions.length - 1 && styles.actionItemLast,
                  ]}
                  onPress={() => handleCommand(action.key)}
                >
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── Reactions Display ───────────
  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  reactionsRowRight: {
    justifyContent: "flex-end",
    paddingRight: spacing.md,
  },
  reactionsRowLeft: {
    justifyContent: "flex-start",
    paddingLeft: spacing.md,
  },
  reactionBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    color: colors.gold.DEFAULT,
    fontSize: 10,
    fontWeight: "bold",
  },

  // ─── Picker Modal ────────────────
  pickerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerOverlayInvis: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerWrapper: {
    width: 280,
    backgroundColor: colors.leather.dark,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: spacing.md,
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.1)",
  },
  pickerEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  pickerEmojiText: {
    fontSize: 24,
  },
  // Actions Menu
  actionsMenu: {
    padding: 4,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  actionItemLast: {
    borderBottomWidth: 0,
  },
  actionLabel: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  actionIcon: {
    fontSize: 16,
    opacity: 0.8,
  },
});
