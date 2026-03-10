import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  RefreshControl,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme/cliqueTheme';

export default function ImperialPullToRefresh({
  refreshing,
  onRefresh,
  children,
}) {
  const spinAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(spinAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(spinAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [refreshing]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {children}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[colors.gold.DEFAULT]}
        tintColor={colors.gold.DEFAULT}
        progressViewOffset={60}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
