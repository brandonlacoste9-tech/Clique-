import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';

export default function ImperialStoryReplyPreview({
  reply,
  onReplyPress,
}) {
  if (!reply) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onReplyPress}
      activeOpacity={0.8}
    >
      <View style={styles.replyBubble}>
        <Text style={styles.replyText} numberOfLines={1}>
          {reply.text}
        </Text>
      </View>
      <Text style={styles.replyCount}>
        {reply.count || 1} réponse{reply.count > 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  replyBubble: {
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    maxWidth: 120,
  },
  replyText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  replyCount: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
