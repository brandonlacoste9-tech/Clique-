import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/chatsnapTheme';

export default function ImperialBadge({
  children,
  variant = 'default',
  size = 'md',
  style,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return styles.goldBadge;
      case 'red':
        return styles.redBadge;
      case 'green':
        return styles.greenBadge;
      case 'orange':
        return styles.orangeBadge;
      case 'purple':
        return styles.purpleBadge;
      case 'outline':
        return styles.outlineBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 2, paddingHorizontal: spacing.xs };
      case 'md':
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm };
      case 'lg':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      default:
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm };
    }
  };

  return (
    <View
      style={[
        styles.container,
        getVariantStyles(),
        getSizeStyles(),
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, size === 'sm' && styles.textSm, size === 'lg' && styles.textLg]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: typography.sizes.xs,
  },
  textLg: {
    fontSize: typography.sizes.sm,
  },
  defaultBadge: {
    backgroundColor: colors.surfaceHighlight,
  },
  goldBadge: {
    backgroundColor: colors.gold.DEFAULT,
  },
  redBadge: {
    backgroundColor: colors.accent.red,
  },
  greenBadge: {
    backgroundColor: colors.accent.green,
  },
  orangeBadge: {
    backgroundColor: colors.accent.orange,
  },
  purpleBadge: {
    backgroundColor: colors.accent.purple,
  },
  outlineBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
});
