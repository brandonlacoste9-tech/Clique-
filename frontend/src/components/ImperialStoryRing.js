import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialStoryRing({
  user,
  hasUnviewed = false,
  isActive = false,
  viewCount,
  onPress,
}) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (hasUnviewed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hasUnviewed]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.storyRing,
          hasUnviewed && styles.storyRingUnviewed,
          isActive && styles.storyRingActive,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Image
          source={{ uri: user.avatarUrl || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
          resizeMode="cover"
        />
      </Animated.View>
      
      <Text style={styles.username} numberOfLines={1}>
        {user.displayName || user.username}
      </Text>
      
      {viewCount > 0 && (
        <View style={styles.viewCount}>
          <Text style={styles.viewCountText}>{viewCount}👁</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  storyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.leather.black,
  },
  storyRingUnviewed: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 3,
    ...shadows.gold,
  },
  storyRingActive: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 3,
    ...shadows.gold,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  username: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    maxWidth: 72,
    textAlign: 'center',
    fontWeight: '500',
  },
  viewCount: {
    marginTop: spacing.xs,
  },
  viewCountText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
});
