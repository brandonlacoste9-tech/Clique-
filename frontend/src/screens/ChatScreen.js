import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import { useMessagesStore } from "../store/chatsnapStore";
import { messagesAPI } from "../api/chatsnapApi";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  chatsnapPhrases,
} from "../theme/chatsnapTheme";

export default function ChatScreen({ navigation }) {
  const { conversations, setConversations } = useMessagesStore();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(res.data.conversations);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const renderConversation = ({ item }) => {
    const hasUnread = item.unreadCount > 0;
    const isStreakActive =
      item.streak.count > 0 && new Date(item.streak.expiresAt) > new Date();

    return (
      <TouchableOpacity
        style={styles.conversation}
        onPress={() =>
          navigation.navigate("ChatDetail", {
            userId: item.user.username,
            userName: item.user.displayName || item.user.username,
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: item.user.avatarUrl || "https://via.placeholder.com/100",
            }}
            style={[styles.avatar, item.user.isOnline && styles.avatarOnline]}
          />
          {item.user.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.name, hasUnread && styles.nameUnread]}>
              {item.user.displayName || item.user.username}
            </Text>

            {isStreakActive && (
              <View style={styles.streak}>
                <Text style={styles.streakText}>🔥 {item.streak.count}</Text>
              </View>
            )}
          </View>

          {item.lastMessage && (
            <Text
              style={[
                styles.lastMessage,
                hasUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.type === "image"
                ? "📷 Photo"
                : item.lastMessage.type === "video"
                  ? "🎥 Vidéo"
                  : item.lastMessage.text}
            </Text>
          )}
        </View>

        {hasUnread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with LV gold trim */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>MESSAGES</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Text style={styles.newMessageButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {conversations.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{chatsnapPhrases.error[2]}</Text>
          <Text style={styles.emptyText}>
            Ajoute tes amis à l'Élite pour commencer à jaser!
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "900",
    color: colors.text.primary,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  newMessageButtonText: {
    fontSize: 18,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  conversation: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(197, 160, 89, 0.2)",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    backgroundColor: colors.leather.black,
  },
  avatarOnline: {
    borderColor: colors.accent.green,
    ...shadows.gold,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent.green,
    borderWidth: 2,
    borderColor: colors.leather.black,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  nameUnread: {
    color: colors.gold.DEFAULT,
    fontWeight: "bold",
  },
  streak: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakText: {
    color: colors.accent.orange,
    fontSize: typography.sizes.sm,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  lastMessageUnread: {
    color: colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    ...shadows.gold,
  },
  unreadText: {
    color: colors.leather.black,
    fontSize: typography.sizes.xs,
    fontWeight: "bold",
  },
  empty: {
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
});
