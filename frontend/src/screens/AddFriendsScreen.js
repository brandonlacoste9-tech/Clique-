import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { userAPI, notificationsAPI } from "../api/cliqueApi";
import { getAvatarUrl } from "../services/bitmojiService";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";

export default function AddFriendsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // search, requests

  useEffect(() => {
    loadPendingRequests();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPendingRequests = async () => {
    try {
      const res = await notificationsAPI.getPendingRequests();
      setPendingRequests(res.data.pendingRequests || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  const searchUsers = async () => {
    setSearching(true);
    try {
      const res = await userAPI.searchUsers(searchQuery);
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const addFriend = async (username) => {
    try {
      await userAPI.addFriend(username);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Update UI
      setSearchResults((prev) =>
        prev.map((u) =>
          u.username === username ? { ...u, requestSent: true } : u,
        ),
      );
    } catch (err) {
      const msg = err.response?.data?.error || "Erreur";
      console.error("Add friend error:", msg);
    }
  };

  const acceptRequest = async (userId) => {
    try {
      await userAPI.acceptFriend(userId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPendingRequests((prev) => prev.filter((r) => r.user.id !== userId));
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const renderSearchResult = ({ item }) => (
    <View style={styles.userRow}>
      <Image
        source={{
          uri: getAvatarUrl(item) || "https://i.pravatar.cc/100?u=" + item.id,
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>
          {item.displayName || item.username}
        </Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      {item.requestSent ? (
        <View style={styles.sentBadge}>
          <Text style={styles.sentText}>ENVOYÉ / SENT ✓</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addFriend(item.username)}
        >
          <Text style={styles.addButtonText}>AJOUTER / ADD</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPendingRequest = ({ item }) => (
    <View style={styles.userRow}>
      <Image
        source={{
          uri:
            item.user.avatarUrl ||
            "https://i.pravatar.cc/100?u=" + item.user.id,
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>
          {item.user.displayName || item.user.username}
        </Text>
        <Text style={styles.username}>@{item.user.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => acceptRequest(item.user.id)}
      >
        <Text style={styles.acceptButtonText}>ACCEPTER / ACCEPT</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>L'ÉLITE / THE ELITE</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "search" && styles.tabActive]}
          onPress={() => setActiveTab("search")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "search" && styles.tabTextActive,
            ]}
          >
            RECHERCHE / SEARCH
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.tabActive]}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.tabTextActive,
            ]}
          >
            DEMANDES / REQUESTS
            {pendingRequests.length > 0 && ` (${pendingRequests.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "search" ? (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Chercher un @username... / Search @username..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching && (
              <ActivityIndicator
                color={colors.gold.DEFAULT}
                style={styles.searchSpinner}
              />
            )}
          </View>

          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              searchQuery.length >= 2 && !searching ? (
                <Text style={styles.emptyText}>Aucun résultat / No results</Text>
              ) : (
                <View style={styles.emptyHint}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyText}>
                    Cherche tes amis par @username / Find friends by @username
                  </Text>
                </View>
              )
            }
          />
        </>
      ) : (
        <FlatList
          data={pendingRequests}
          renderItem={renderPendingRequest}
          keyExtractor={(item) => item.requestId}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyHint}>
              <Text style={styles.emptyEmoji}>👑</Text>
              <Text style={styles.emptyText}>Aucune demande en attente / No pending requests</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  headerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.base,
    fontWeight: "900",
    letterSpacing: 3,
  },
  backButton: {
    color: colors.gold.DEFAULT,
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceHighlight,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.gold.DEFAULT,
  },
  tabText: {
    color: colors.text.muted,
    fontSize: typography.sizes.sm,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  tabTextActive: {
    color: colors.gold.DEFAULT,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: "relative",
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  searchSpinner: {
    position: "absolute",
    right: spacing.lg + 16,
    top: spacing.md + 14,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceHighlight,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  displayName: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: "600",
  },
  username: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.gold.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.leather.black,
    fontSize: typography.sizes.xs,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  sentBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  sentText: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.xs,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  acceptButton: {
    backgroundColor: colors.accent.green,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: typography.sizes.xs,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  emptyHint: {
    alignItems: "center",
    paddingTop: 60,
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
    textAlign: "center",
  },
});
