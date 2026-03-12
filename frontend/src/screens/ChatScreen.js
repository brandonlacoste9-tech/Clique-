import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import { useMessagesStore } from "../store/cliqueStore";
import { messagesAPI } from "../api/cliqueApi";
import { getAvatarUrl } from "../services/bitmojiService";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  cliquePhrases,
} from "../theme/cliqueTheme";
import ChatOptionsSheet from "../components/ChatOptionsSheet";
import CallOverlay from "../components/CallOverlay";
import { callService, CALL_TYPES } from "../services/callService";

export default function ChatScreen({ navigation }) {
  const { conversations, setConversations } = useMessagesStore();
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const startCallFromOverlay = async (userId, type) => {
    const call = await callService.startCall(userId, type);
    setActiveCall(call);
  };

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
        onLongPress={() => {
          setSelectedConvo({
            id: item.user.username,
            name: item.user.displayName || item.user.username,
          });
        }}
        delayLongPress={500}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: getAvatarUrl(item.user) || "https://via.placeholder.com/100",
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Messages</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddFriends")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={styles.list}
      />

      {conversations.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>L'Élite t'attend / The Elite Awaits</Text>
          <Text style={styles.emptyText}>
            Ajoute tes amis pour commencer à jaser! / Add friends to start chatting!
          </Text>
        </View>
      )}

      {/* Call Overlay */}
      <CallOverlay 
        visible={!!activeCall} 
        call={activeCall} 
        onClose={() => setActiveCall(null)} 
      />

      {/* Chat Options Bottom Sheet */}
      <ChatOptionsSheet
        visible={!!selectedConvo}
        conversationId={selectedConvo?.id}
        conversationName={selectedConvo?.name}
        onClose={() => setSelectedConvo(null)}
        onDelete={(id) => {
          const updated = conversations.filter(
            (c) => c.user.username !== id
          );
          setConversations(updated);
        }}
        onStartVoiceCall={(id) => startCallFromOverlay(id, CALL_TYPES.VOICE)}
        onStartVideoCall={(id) => startCallFromOverlay(id, CALL_TYPES.VIDEO)}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "bold",
    color: colors.gold.DEFAULT,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  addButtonText: {
    color: colors.gold.DEFAULT,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "300",
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  conversation: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.05)",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarOnline: {
    borderColor: colors.gold.DEFAULT,
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
    fontWeight: "900",
    letterSpacing: 0.8,
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
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    ...shadows.gold,
    shadowOpacity: 0.6,
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
