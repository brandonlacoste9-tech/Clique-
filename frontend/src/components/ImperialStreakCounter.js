import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/cliqueTheme';

export default function ImperialStreakCounter({
  count,
  expiresAt,
  size = 'md',
}) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (count > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [count]);

  const isExpired = count === 0 || (expiresAt && new Date(expiresAt) < new Date());

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <View style={styles.fireIcon}>
        <Text style={styles.fireText}>🔥</Text>
      </View>
      <Text style={styles.count}>{count}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fireIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent.orange,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.gold,
  },
  fireText: {
    fontSize: 14,
  },
  count: {
    color: colors.accent.orange,
    fontSize: typography.sizes.base,
    fontWeight: '900',
  },
});
