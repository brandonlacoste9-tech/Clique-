// Story Reply Preview Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';

export default function StoryReplyPreview({ reply, onReplyPress }) {
  const { sender, text, sentAt, contentType } = reply;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    return date.toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onReplyPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: sender.avatarUrl }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>{sender.displayName || sender.username}</Text>
          <Text style={styles.time}>{formatTime(sentAt)}</Text>
        </View>
        <Text style={styles.text} numberOfLines={2}>
          {contentType === 'image' ? '📷 Image' : text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function StoryReplyBadge({ replyCount, onPress }) {
  if (!replyCount || replyCount === 0) return null;

  return (
    <TouchableOpacity style={styles.badge} onPress={onPress}>
      <Text style={styles.badgeText}>{replyCount}</Text>
    </TouchableOpacity>
  );
}

export function StoryReplyList({ replies, onReplyPress }) {
  if (!replies || replies.length === 0) return null;

  return (
    <View style={styles.list}>
      {replies.slice(0, 3).map((reply) => (
        <StoryReplyPreview 
          key={reply.messageId} 
          reply={reply} 
          onReplyPress={() => onReplyPress?.(reply)} 
        />
      ))}
      {replies.length > 3 && (
        <Text style={styles.moreText}>
          +{replies.length - 3} autre{replies.length > 4 ? 's' : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
  },
  time: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  text: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    lineHeight: 16,
  },
  badge: {
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
  },
  list: {
    marginTop: spacing.md,
  },
  moreText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
