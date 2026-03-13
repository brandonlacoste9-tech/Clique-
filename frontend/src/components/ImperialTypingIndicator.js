import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../theme/chatsnapTheme';

export default function ImperialTypingIndicator({
  userId,
  isActive,
}) {
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View
          style={[
            styles.dot,
            { transform: [{ translateY: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { transform: [{ translateY: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { transform: [{ translateY: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) }] },
          ]}
        />
      </View>
      <Text style={styles.text}>En train d'écrire...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  bubble: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.muted,
  },
  text: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
});
