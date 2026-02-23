import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';

import { useStoriesStore, useUIStore } from '../store/cliqueStore';
import { storiesAPI } from '../api/cliqueApi';
import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';

export default function StoriesScreen() {
  const { stories, myStories, setStories, setMyStories } = useStoriesStore();
  const { openStoryViewer } = useUIStore();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const [feedRes, myRes] = await Promise.all([
        storiesAPI.getFeed(),
        storiesAPI.getMyStories()
      ]);
      
      setStories(feedRes.data.stories);
      setMyStories(myRes.data.stories);
    } catch (err) {
      console.error('Failed to load stories:', err);
    }
  };

  const renderStoryRing = ({ item }) => {
    const hasUnviewed = item.hasUnviewed;
    
    return (
      <TouchableOpacity
        style={styles.storyRingContainer}
        onPress={() => openStoryViewer(item)}
      >
        <View style={[
          styles.storyRing,
          hasUnviewed && styles.storyRingUnviewed
        ]}>
          <Image
            source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.username} numberOfLines={1}>
          {item.user.displayName || item.user.username}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMyStory = () => {
    const hasActiveStory = myStories.length > 0;
    
    return (
      <TouchableOpacity style={styles.myStoryContainer}>
        <View style={[
          styles.storyRing,
          hasActiveStory && styles.storyRingActive
        ]}>
          <View style={styles.addStoryButton}>
            <Text style={styles.addStoryPlus}>+</Text>
          </View>
        </View>
        
        <Text style={styles.username}>Ma story</Text>
        
        {hasActiveStory && (
          <View style={styles.viewCount}>
            <Text style={styles.viewCountText}>{myStories[0]?.viewCount || 0} 👁</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Stories</Text>
      
      <FlatList
        data={stories}
        renderItem={renderStoryRing}
        keyExtractor={(item) => item.user.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={renderMyStory}
        contentContainerStyle={styles.listContent}
      />

      {/* Empty state */}
      {stories.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Pas de stories</Text>
          <Text style={styles.emptyText}>
            Ajoute des amis pour voir leurs stories!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl
  },
  header: {
    fontSize: typography.sizes['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md
  },
  myStoryContainer: {
    alignItems: 'center',
    marginRight: spacing.md
  },
  storyRingContainer: {
    alignItems: 'center',
    marginRight: spacing.md
  },
  storyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  storyRingUnviewed: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 3
  },
  storyRingActive: {
    borderColor: colors.gold.DEFAULT
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  addStoryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addStoryPlus: {
    fontSize: 32,
    color: colors.gold.DEFAULT,
    fontWeight: '300'
  },
  username: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    maxWidth: 72,
    textAlign: 'center'
  },
  viewCount: {
    marginTop: spacing.xs
  },
  viewCountText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center'
  }
});
