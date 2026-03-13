import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: [styles.primaryContainer, disabled && styles.disabled],
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: [styles.secondaryContainer, disabled && styles.disabled],
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: [styles.outlineContainer, disabled && styles.disabled],
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: [styles.ghostContainer, disabled && styles.disabled],
          text: styles.ghostText,
        };
      case 'danger':
        return {
          container: [styles.dangerContainer, disabled && styles.disabled],
          text: styles.dangerText,
        };
      default:
        return {
          container: [styles.primaryContainer, disabled && styles.disabled],
          text: styles.primaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md };
      case 'md':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
      case 'lg':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? colors.leather.black : colors.gold.DEFAULT}
          size="small"
        />
      ) : (
        <Text style={[styles.text, variantStyles.text, size === 'sm' && styles.textSm, size === 'lg' && styles.textLg]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  primaryContainer: {
    backgroundColor: colors.gold.DEFAULT,
    ...shadows.gold,
  },
  secondaryContainer: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: colors.accent.red,
    ...shadows.gold,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: typography.sizes.sm,
  },
  textLg: {
    fontSize: typography.sizes.lg,
  },
  primaryText: {
    color: colors.leather.black,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  outlineText: {
    color: colors.gold.DEFAULT,
  },
  ghostText: {
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.text.primary,
  },
});
