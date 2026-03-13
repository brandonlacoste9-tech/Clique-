import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialStoryCard({
  story,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: story.thumbnailUrl || story.mediaUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Duration badge */}
        {story.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{story.duration}s</Text>
          </View>
        )}
        
        {/* View count */}
        {story.viewCount > 0 && (
          <View style={styles.viewBadge}>
            <Text style={styles.viewText}>{story.viewCount}👁</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: story.userAvatar }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username} numberOfLines={1}>
              {story.username}
            </Text>
            <Text style={styles.timestamp}>
              {story.timeAgo || 'À l\'instant'}
            </Text>
          </View>
        </View>
        
        {story.caption && (
          <Text style={styles.caption} numberOfLines={2}>
            {story.caption}
          </Text>
        )}
        
        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{story.replyCount || 0}</Text>
            <Text style={styles.statLabel}>Réponses</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{story.viewCount || 0}</Text>
            <Text style={styles.statLabel}>Vues</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  mediaContainer: {
    position: 'relative',
    aspectRatio: 9 / 16,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  viewBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  viewText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  caption: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceHighlight,
    paddingTop: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.base,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
});
