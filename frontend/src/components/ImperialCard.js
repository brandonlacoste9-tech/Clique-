import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/cliqueTheme';

export default function ImperialCard({
  children,
  variant = 'default',
  onPress,
  style,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return styles.goldCard;
      case 'leather':
        return styles.leatherCard;
      case 'glass':
        return styles.glassCard;
      case 'bordered':
        return styles.borderedCard;
      default:
        return styles.defaultCard;
    }
  };

  const cardContent = (
    <View style={[styles.container, getVariantStyles(), style]} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  defaultCard: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  goldCard: {
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    ...shadows.gold,
  },
  leatherCard: {
    backgroundColor: colors.leather.dark,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  glassCard: {
    backgroundColor: 'rgba(20, 18, 16, 0.8)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
  },
  borderedCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
  },
});
