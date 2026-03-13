import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialThemeToggle({
  isDarkMode,
  onToggle,
}) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={styles.toggle}>
        <View
          style={[
            styles.toggleCircle,
            { 
              backgroundColor: isDarkMode ? colors.gold.DEFAULT : colors.leather.black,
              transform: [{ translateX: isDarkMode ? 20 : 0 }],
            },
          ]}
        />
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {isDarkMode ? 'Mode Sombre' : 'Mode Clair'}
        </Text>
        <Text style={styles.subtitle}>
          {isDarkMode ? 'Obsidian & Or' : 'Suede & Or'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    marginHorizontal: spacing.lg,
    gap: spacing.md,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.leather.black,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: colors.gold.DEFAULT,
    ...shadows.gold,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
});
