import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import {
  useStoriesStore,
  useUIStore,
  useCliquesStore,
} from "../store/cliqueStore";
import { storiesAPI, cliquesAPI } from "../api/cliqueApi";
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from "../theme/cliqueTheme";

export default function StoriesScreen({ navigation }) {
  const { stories, myStories, setStories, setMyStories } = useStoriesStore();
  const { nearbyCliques, setNearbyCliques } = useCliquesStore();
  const { openStoryViewer } = useUIStore();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const [feedRes, myRes, cliqueRes] = await Promise.all([
        storiesAPI.getFeed(),
        storiesAPI.getMyStories(),
        cliquesAPI.getNearby(45.5122, -73.57, 5000),
      ]);

      setStories(feedRes.data.stories);
      setMyStories(myRes.data.stories);
      setNearbyCliques(cliqueRes.data.cliques);
    } catch (err) {
      console.error("Failed to load stories:", err);
    }
  };

  const renderStoryRing = ({ item }) => {
    const hasUnviewed = item.hasUnviewed;

    return (
      <TouchableOpacity
        style={styles.storyRingContainer}
        onPress={() => openStoryViewer(item)}
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>L'ÉLITE / THE ELITE</Text>
        <Text style={styles.subHeader}>STORIES EXCLUSIVES / EXCLUSIVE MOMENTS</Text>
      </View>

      <FlatList
        data={stories}
        renderItem={renderStoryRing}
        keyExtractor={(item) => item.user.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={renderMyStory}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>COMMUNAUTÉS PROCHES / NEARBY CLIQUES</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SearchCliques")}>
          <Text style={styles.seeAll}>VOIR TOUT / SEE ALL ›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={nearbyCliques}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cliqueCard}
            onPress={() =>
              navigation.navigate("CliqueChat", {
                cliqueId: item.id,
                cliqueName: item.name,
              })
            }
          >
            <View style={styles.cliqueIcon}>
              <Text style={styles.cliqueIconText}>{item.name.charAt(0)}</Text>
            </View>
            <Text style={styles.cliqueName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cliqueMeta}>{item.memberCount} membres / members</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Empty state */}
      {stories.length === 0 && nearbyCliques.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>L'Élite t'attend / The Elite Awaits</Text>
          <Text style={styles.emptyText}>
            Explore les cliques autour de toi pour commencer l'expérience. / 
            Explore cliques around you to start the experience.
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
    paddingTop: spacing.xl,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  header: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "900",
    color: colors.gold.DEFAULT,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  subHeader: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    letterSpacing: 2,
    marginTop: spacing.xs,
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
  },
  storyRingUnviewed: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 3,
  },
  storyRingActive: {
    borderColor: colors.gold.DEFAULT,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.gold.DEFAULT,
    letterSpacing: 2,
  },
  seeAll: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: "bold",
  },
  cliqueCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    alignItems: "center",
  },
  cliqueIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.leather.black,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    marginBottom: spacing.sm,
  },
  cliqueIconText: {
    color: colors.gold.DEFAULT,
    fontSize: 20,
    fontWeight: "bold",
  },
  cliqueName: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: "bold",
    textAlign: "center",
  },
  cliqueMeta: {
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 2,
  },
});
