import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from "react-native";

import { useStoriesStore, useUIStore } from "../store/chatsnapStore";
import { storiesAPI } from "../api/chatsnapApi";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/chatsnapTheme";
import StoryFilters from "../components/StoryFilters";
import StoryReplyPreview from "../components/StoryReplyPreview";

export default function StoriesScreen() {
  const { stories, myStories, setStories, setMyStories } = useStoriesStore();
  const { openStoryViewer } = useUIStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedMood, setSelectedMood] = React.useState('all');
  const [selectedSort, setSelectedSort] = React.useState('newest');

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    
    try {
      const [feedRes, myRes] = await Promise.all([
        storiesAPI.getFiltered({
          mood: selectedMood === 'all' ? undefined : selectedMood,
          sort: selectedSort
        }),
        storiesAPI.getMyStories(),
      ]);

      setStories(feedRes.data.stories);
      setMyStories(myRes.data.stories);
    } catch (err) {
      console.error("Failed to load stories:", err);
    } finally {
      if (refresh) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadStories(true);
  };

  const handleStoryPress = (item) => {
    openStoryViewer(item);
  };

  const renderStoryRing = ({ item }) => {
    const hasUnviewed = item.hasUnviewed;

    return (
      <TouchableOpacity
        style={styles.storyRingContainer}
        onPress={() => handleStoryPress(item)}
      >
        <View
          style={[styles.storyRing, hasUnviewed && styles.storyRingUnviewed]}
        >
          <Image
            source={{
              uri: item.user.avatarUrl || "https://via.placeholder.com/100",
            }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.username} numberOfLines={1}>
          {item.user.displayName || item.user.username}
        </Text>
        {item.stories[0]?.replyCount > 0 && (
          <StoryReplyPreview 
            reply={item.stories[0]} 
            onReplyPress={() => console.log('Reply pressed')}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderMyStory = () => {
    const hasActiveStory = myStories.length > 0;

    return (
      <TouchableOpacity style={styles.myStoryContainer}>
        <View
          style={[styles.storyRing, hasActiveStory && styles.storyRingActive]}
        >
          <View style={styles.addStoryButton}>
            <Text style={styles.addStoryPlus}>+</Text>
          </View>
        </View>

        <Text style={styles.username}>Ma story</Text>

        {hasActiveStory && (
          <View style={styles.viewCount}>
            <Text style={styles.viewCountText}>
              {myStories[0]?.viewCount || 0} 👁
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with LV gold trim */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>STORIES</Text>
        <TouchableOpacity style={styles.cameraButton}>
          <Text style={styles.cameraButtonText}>📷</Text>
        </TouchableOpacity>
      </View>

      <StoryFilters 
        selectedMood={selectedMood}
        selectedSort={selectedSort}
        onMoodChange={setSelectedMood}
        onSortChange={setSelectedSort}
      />

      <FlatList
        data={stories}
        renderItem={renderStoryRing}
        keyExtractor={(item) => item.user.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={renderMyStory}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.gold.DEFAULT]}
            tintColor={colors.gold.DEFAULT}
          />
        }
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

      {/* Story viewer: global <StoryViewer /> in App.js uses openStoryViewer(item) → currentStoryGroup */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    fontSize: typography.sizes["xl"],
    fontWeight: "900",
    color: colors.text.primary,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  cameraButtonText: {
    fontSize: 18,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  myStoryContainer: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  storyRingContainer: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  storyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.leather.black,
  },
  storyRingUnviewed: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 3,
    ...shadows.gold,
  },
  storyRingActive: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 3,
    ...shadows.gold,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addStoryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  addStoryPlus: {
    fontSize: 32,
    color: colors.gold.DEFAULT,
    fontWeight: "300",
  },
  username: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    maxWidth: 72,
    textAlign: "center",
  },
  viewCount: {
    marginTop: spacing.xs,
  },
  viewCountText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    fontWeight: "bold",
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: "center",
  },
  storyViewerContainer: {
    flex: 1,
    backgroundColor: colors.leather.black,
    alignItems: "center",
    justifyContent: "center",
  },
  storyViewerClose: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  storyViewerCloseText: {
    color: colors.gold.DEFAULT,
    fontSize: 28,
    fontWeight: "300",
  },
  storyContent: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  storyImage: {
    width: "100%",
    height: "100%",
  },
  storyCaption: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  storyCaptionText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    textAlign: "center",
  },
});
