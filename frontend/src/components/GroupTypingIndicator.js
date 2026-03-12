import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { colors, spacing } from "../theme/cliqueTheme";

/**
 * GroupTypingIndicator — Shows who's typing in a Clique group chat.
 *
 * Displays animated dots + user names:
 *   "Marie écrit... / typing..."
 *   "Marie, Jean écrivent... / are typing..."
 *   "3+ personnes écrivent... / people typing..."
 */
export default function GroupTypingIndicator({ typingUsers = [] }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (typingUsers.length > 0) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate dots
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
          if (typingUsers.length > 0) animateDots();
        });
      };
      animateDots();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [typingUsers.length]);

  if (typingUsers.length === 0) return null;

  const getLabel = () => {
    const names = typingUsers.map((u) => u.displayName || u.username);

    if (names.length === 1) {
      return `${names[0]} écrit... / typing...`;
    }
    if (names.length === 2) {
      return `${names[0]}, ${names[1]} écrivent... / are typing...`;
    }
    return `${names.length}+ personnes écrivent... / people typing...`;
  };

  const dotStyle = (anim) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }),
      },
    ],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, dotStyle(dot1)]} />
        <Animated.View style={[styles.dot, dotStyle(dot2)]} />
        <Animated.View style={[styles.dot, dotStyle(dot3)]} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {getLabel()}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    gap: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold.DEFAULT,
  },
  label: {
    color: colors.text.muted,
    fontSize: 11,
    fontStyle: "italic",
    flex: 1,
  },
});
