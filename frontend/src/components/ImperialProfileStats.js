import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialProfileStats({
  stats,
}) {
  if (!stats) return null;

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalStories || 0}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalViews || 0}</Text>
          <Text style={styles.statLabel}>Vues</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.avgEngagement || 0}%</Text>
          <Text style={styles.statLabel}>Engagement</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.topStory || 0}</Text>
          <Text style={styles.statLabel}>Meilleure</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '900',
    color: colors.gold.DEFAULT,
    ...shadows.gold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
