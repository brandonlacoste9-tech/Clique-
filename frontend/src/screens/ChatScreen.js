import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';

import { useMessagesStore } from '../store/cliqueStore';
import { messagesAPI } from '../api/cliqueApi';
import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';

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
      console.error('Failed to load conversations:', err);
    }
  };

  const renderConversation = ({ item }) => {
    const hasUnread = item.unreadCount > 0;
    const isStreakActive = item.streak.count > 0 && 
      new Date(item.streak.expiresAt) > new Date();

    return (
      <TouchableOpacity style={styles.conversation}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          {item.user.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[
              styles.name,
              hasUnread && styles.nameUnread
            ]}>
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
                hasUnread && styles.lastMessageUnread
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.type === 'image' ? '📷 Photo' 
                : item.lastMessage.type === 'video' ? '🎥 Vidéo'
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
      <Text style={styles.header}>Messages</Text>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={styles.list}
      />

      {conversations.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Pas de messages</Text>
          <Text style={styles.emptyText}>
            Commence une conversation avec tes amis!
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
  list: {
    paddingHorizontal: spacing.lg
  },
  conversation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent.green,
    borderWidth: 2,
    borderColor: colors.background
  },
  content: {
    flex: 1,
    marginLeft: spacing.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  name: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: '500'
  },
  nameUnread: {
    fontWeight: 'bold'
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  streakText: {
    color: colors.accent.orange,
    fontSize: typography.sizes.sm,
    fontWeight: 'bold'
  },
  lastMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs
  },
  lastMessageUnread: {
    color: colors.text.primary
  },
  unreadBadge: {
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  unreadText: {
    color: colors.leather.black,
    fontSize: typography.sizes.xs,
    fontWeight: 'bold'
  },
  empty: {
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
