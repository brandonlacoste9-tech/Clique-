import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/chatsnapTheme';

export default function ImperialStoryDuration({
  duration = 15,
  elapsed = 0,
  showRemaining = true,
}) {
  const remaining = Math.max(0, duration - elapsed);
  const progress = (elapsed / duration) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>
          {showRemaining ? `${remaining}s` : `${elapsed}s`}
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${progress}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  timerContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  timer: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: '900',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold.DEFAULT,
  },
});
