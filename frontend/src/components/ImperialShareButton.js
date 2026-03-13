import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialShareButton({
  title,
  message,
  url,
  style,
}) {
  const onShare = async () => {
    try {
      const result = await Share.share(
        {
          message: message || `Voir ${title}`,
          url,
        },
        {
          dialogTitle: 'Partager avec L\'Élite',
          tintColor: colors.gold.DEFAULT,
        }
      );

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Dismissed');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onShare}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>📤</Text>
      <Text style={styles.text}>Partager</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
