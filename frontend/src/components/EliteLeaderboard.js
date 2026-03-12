import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usersAPI } from "../api/cliqueApi";
import { colors, spacing, typography, borderRadius, shadows } from "../theme/cliqueTheme";

export default function EliteLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await usersAPI.getLeaderboard();
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMember = ({ item, index }) => {
    const isTop3 = index < 3;
    const rankColors = [
      ["#FFD700", "#B8860B"], // Gold
      ["#C0C0C0", "#808080"], // Silver
      ["#CD7F32", "#8B4513"], // Bronze
    ];

    return (
      <View style={styles.memberCard}>
        <View style={styles.rankContainer}>
          {isTop3 ? (
            <LinearGradient
              colors={rankColors[index]}
              style={styles.rankBadge}
            >
              <Text style={styles.rankText}>{index + 1}</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.rankNumber}>{index + 1}</Text>
          )}
        </View>

        <Image
          source={{ uri: item.avatarUrl || "https://via.placeholder.com/100" }}
          style={[styles.avatar, isTop3 && { borderColor: rankColors[index][0] }]}
        />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.displayName || item.username}
          </Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>

        <View style={styles.streakContainer}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{item.streakCount}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.gold.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOVERAIGNS OF THE REIGN</Text>
      <FlatList
        data={leaderboard}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.05)",
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "900",
  },
  rankNumber: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: "bold",
  },
  username: {
    color: colors.text.muted,
    fontSize: 10,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakEmoji: {
    fontSize: 12,
    marginRight: 2,
  },
  streakCount: {
    color: colors.accent.orange,
    fontSize: 12,
    fontWeight: "bold",
  },
  loader: {
    padding: spacing.xl,
    alignItems: "center",
  },
});
