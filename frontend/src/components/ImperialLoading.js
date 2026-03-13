import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialLoading({
  message,
  variant = 'default',
  size = 'md',
}) {
  const pulseAnim = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.loader,
          { opacity: pulseAnim },
        ]}
      >
        <View style={styles.loaderInner}>
          <Text style={styles.loaderText}>Z</Text>
        </View>
      </Animated.View>
      
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loader: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.gold,
  },
  loaderInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.leather.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '900',
    color: colors.gold.DEFAULT,
  },
  message: {
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
    fontWeight: '500',
    textAlign: 'center',
  },
});
