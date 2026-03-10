import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';

const moods = [
  { id: 'all', label: 'Tout', icon: '✨' },
  { id: 'happy', label: 'Heureux', icon: '😊' },
  { id: 'party', label: 'Fête', icon: '🎉' },
  { id: 'chill', label: 'Détente', icon: '🧘' },
  { id: 'night', label: 'Nuit', icon: '🌙' },
];

const sorts = [
  { id: 'newest', label: 'Plus récent' },
  { id: 'oldest', label: 'Plus ancien' },
  { id: 'popular', label: 'Populaire' },
];

export default function ImperialStoryFilters({
  selectedMood,
  selectedSort,
  onMoodChange,
  onSortChange,
}) {
  return (
    <View style={styles.container}>
      {/* Mood Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Humeur</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodList}
        >
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodItem,
                selectedMood === mood.id && styles.moodItemActive,
              ]}
              onPress={() => onMoodChange(mood.id)}
            >
              <Text style={styles.moodIcon}>{mood.icon}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Trier</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortList}
        >
          {sorts.map((sort) => (
            <TouchableOpacity
              key={sort.id}
              style={[
                styles.sortItem,
                selectedSort === sort.id && styles.sortItemActive,
              ]}
              onPress={() => onSortChange(sort.id)}
            >
              <Text style={styles.sortLabel}>{sort.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    backgroundColor: colors.leather.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold.DEFAULT,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  moodList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.full,
  },
  moodItemActive: {
    backgroundColor: colors.gold.DEFAULT,
  },
  moodIcon: {
    fontSize: 16,
  },
  moodLabel: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  sortList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sortItem: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  sortLabel: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  sortItemActive: {
    color: colors.gold.DEFAULT,
    fontWeight: '900',
  },
});
