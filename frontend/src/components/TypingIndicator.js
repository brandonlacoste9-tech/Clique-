// Typing Indicator Component
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, typography, spacing } from '../theme/chatsnapTheme';

export default function TypingIndicator({ userId, isActive, onTypingChange }) {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isActive !== undefined) {
      setIsTyping(isActive);
    }
  }, [isActive]);

  useEffect(() => {
    if (isTyping && onTypingChange) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        onTypingChange(false);
      }, 3000); // Stop showing after 3 seconds of inactivity
      
      return () => clearTimeout(timeout);
    }
  }, [isTyping, onTypingChange]);

  if (!isTyping) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
        <Text style={styles.text}>En train d'écrire...</Text>
      </View>
    </View>
  );
}

export function TypingIndicatorWithStatus({ userId, isActive, onTypingChange }) {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isActive !== undefined) {
      setIsTyping(isActive);
    }
  }, [isActive]);

  useEffect(() => {
    if (isTyping && onTypingChange) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        onTypingChange(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [isTyping, onTypingChange]);

  if (!isTyping) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
        <Text style={styles.text}>En train d'écrire...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  bubble: {
    backgroundColor: colors.gold.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
  dot1: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationIterationCount: 'infinite',
  },
  dot2: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationDelay: '0.1s',
    animationIterationCount: 'infinite',
  },
  dot3: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationDelay: '0.2s',
    animationIterationCount: 'infinite',
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
});
