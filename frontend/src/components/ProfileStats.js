// Profile Stats Component
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ProfileStats({ stats, onStoryPress }) {
  if (!stats) return null;

  const { totalStories, totalViews, topStories, recentActivity } = stats;

  return (
    <View style={styles.container}>
      {/* Total Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalStories || 0}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalViews || 0}</Text>
          <Text style={styles.statLabel}>Vues</Text>
        </View>
      </View>

      {/* Top Stories */}
      {topStories && topStories.length > 0 && (
        <View style={styles.topStoriesSection}>
          <Text style={styles.sectionTitle}>Top Stories</Text>
          <FlatList
            data={topStories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.topStoriesList}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.storyCard}
                onPress={() => onStoryPress?.(item)}
              >
                <View style={styles.storyImage}>
                  <Text style={styles.storyIcon}>📷</Text>
                </View>
                <View style={styles.storyInfo}>
                  <Text style={styles.storyViews}>{item.viewCount} vues</Text>
                  <Text style={styles.storyDate}>
                    {new Date(item.createdAt).toLocaleDateString('fr-CA', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <FlatList
            data={recentActivity}
            keyExtractor={(item) => item.date}
            contentContainerStyle={styles.activityList}
            renderItem={({ item }) => (
              <View style={styles.activityItem}>
                <Text style={styles.activityDate}>
                  {new Date(item.date).toLocaleDateString('fr-CA', { 
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
                <View style={styles.activityStats}>
                  <View style={styles.activityStat}>
                    <Text style={styles.activityStatValue}>{item.story_count}</Text>
                    <Text style={styles.activityStatLabel}>Stories</Text>
                  </View>
                  <View style={styles.activityStat}>
                    <Text style={styles.activityStatValue}>{item.view_count}</Text>
                    <Text style={styles.activityStatLabel}>Vues</Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

export function QuickStats({ stories, views }) {
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stories || 0}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{views || 0}</Text>
          <Text style={styles.statLabel}>Vues</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: 'bold',
    color: colors.gold.DEFAULT,
    ...shadows.gold,
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surfaceHighlight,
  },
  topStoriesSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topStoriesList: {
    gap: spacing.md,
  },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.leather.black,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  storyImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  storyIcon: {
    fontSize: 24,
  },
  storyInfo: {
    flex: 1,
  },
  storyViews: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
  },
  storyDate: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  activitySection: {
    marginTop: spacing.lg,
  },
  activityList: {
    gap: spacing.md,
  },
  activityItem: {
    backgroundColor: colors.leather.black,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  activityDate: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityStat: {
    alignItems: 'center',
  },
  activityStatValue: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
  },
  activityStatLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
});
