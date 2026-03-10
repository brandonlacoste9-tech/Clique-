import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/cliqueTheme';

export default function ImperialSnapScore({
  score,
  level = 'bronze',
  onPress,
}) {
  const getLevelColor = () => {
    switch (level) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return colors.gold.DEFAULT;
      case 'platinum':
        return '#E5E4E2';
      case 'diamond':
        return '#B9F2FF';
      default:
        return colors.gold.DEFAULT;
    }
  };

  const getLevelName = () => {
    switch (level) {
      case 'bronze':
        return 'Bronze';
      case 'silver':
        return 'Argent';
      case 'gold':
        return 'Or';
      case 'platinum':
        return 'Platine';
      case 'diamond':
        return 'Diamant';
      default:
        return 'Or';
    }
  };

  const containerStyles = {
    backgroundColor: getLevelColor(),
    ...shadows.gold,
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyles]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.level}>{getLevelName()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    color: colors.leather.black,
    fontSize: typography.sizes['2xl'],
    fontWeight: '900',
  },
  level: {
    color: colors.leather.black,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
