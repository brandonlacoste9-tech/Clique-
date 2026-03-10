import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../theme/cliqueTheme';

export default function ImperialHeader({
  title,
  subtitle,
  leftElement,
  rightElement,
  style,
  ...props
}) {
  return (
    <View style={[styles.container, style]} {...props}>
      {leftElement && (
        <View style={styles.leftSection}>
          {leftElement}
        </View>
      )}
      
      <View style={styles.centerSection}>
        <Text style={styles.title}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {rightElement && (
        <View style={styles.rightSection}>
          {rightElement}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.2)',
  },
  leftSection: {
    width: 40,
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.gold.DEFAULT,
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
