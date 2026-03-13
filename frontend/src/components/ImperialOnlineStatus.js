import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/chatsnapTheme';

export default function ImperialOnlineStatus({
  isOnline,
  lastSeen,
}) {
  if (!isOnline && !lastSeen) return null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.statusDot,
          isOnline ? styles.statusOnline : styles.statusOffline,
        ]}
      />
      <Text style={styles.statusText}>
        {isOnline ? 'En ligne' : `Vu ${lastSeen}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: colors.accent.green,
    ...shadows.gold,
  },
  statusOffline: {
    backgroundColor: colors.text.muted,
  },
  statusText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
});
