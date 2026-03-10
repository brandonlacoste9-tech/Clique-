// Story Filters Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';

const MOODS = [
  { id: 'all', label: 'Tout' },
  { id: 'happy', label: 'Heureux' },
  { id: 'party', label: 'Fête' },
  { id: 'relax', label: 'Détente' },
  { id: 'food', label: 'Nourriture' },
  { id: 'travel', label: 'Voyage' },
  { id: 'work', label: 'Travail' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Plus récent' },
  { id: 'oldest', label: 'Plus ancien' },
];

export default function StoryFilters({ 
  selectedMood, 
  selectedSort, 
  onMoodChange, 
  onSortChange 
}) {
  const [showSortOptions, setShowSortOptions] = useState(false);

  return (
    <View style={styles.container}>
      {/* Mood Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Humeur</Text>
        <FlatList
          data={MOODS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.moodList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.moodButton,
                selectedMood === item.id && styles.moodButtonActive
              ]}
              onPress={() => onMoodChange?.(item.id)}
            >
              <Text
                style={[
                  styles.moodButtonText,
                  selectedMood === item.id && styles.moodButtonTextActive
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Sort Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Tri</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={styles.sortButtonText}>
            {SORT_OPTIONS.find(s => s.id === selectedSort)?.label || 'Plus récent'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>

        {showSortOptions && (
          <View style={styles.sortDropdown}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => {
                  onSortChange?.(option.id);
                  setShowSortOptions(false);
                }}
              >
                <Text style={styles.sortOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export function LocationFilter({ selectedLocation, onSelectLocation }) {
  const locations = [
    { id: 'all', label: 'Tout Québec' },
    { id: 'montreal', label: 'Montréal' },
    { id: 'quebec', label: 'Québec City' },
    { id: 'gatineau', label: 'Gatineau' },
    { id: 'laval', label: 'Laval' },
    { id: 'saguenay', label: 'Saguenay' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.filterLabel}>Localisation</Text>
      <FlatList
        data={locations}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.locationList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.locationButton,
              selectedLocation === item.id && styles.locationButtonActive
            ]}
            onPress={() => onSelectLocation?.(item.id)}
          >
            <Text
              style={[
                styles.locationButtonText,
                selectedLocation === item.id && styles.locationButtonTextActive
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.leather.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHighlight,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moodList: {
    gap: spacing.xs,
  },
  moodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  moodButtonActive: {
    backgroundColor: colors.gold.DEFAULT,
    borderColor: colors.gold.DEFAULT,
  },
  moodButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
  },
  moodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  sortButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    marginRight: spacing.xs,
  },
  chevron: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  sortDropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: colors.leather.black,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    borderRadius: borderRadius.md,
    zIndex: 100,
  },
  sortOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHighlight,
  },
  sortOptionText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  locationList: {
    gap: spacing.xs,
  },
  locationButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  locationButtonActive: {
    backgroundColor: colors.gold.DEFAULT,
    borderColor: colors.gold.DEFAULT,
  },
  locationButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
  },
  locationButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
