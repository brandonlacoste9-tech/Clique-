import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialMapPin({
  user,
  isOnline,
  onPress,
}) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatarBorder,
          isOnline && styles.avatarOnline,
        ]}
      >
        <Image
          source={{ uri: user.avatarUrl }}
          style={styles.avatarImage}
        />
      </View>
      <View
        style={[
          styles.pinTip,
          isOnline && { borderBottomColor: colors.accent.green },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    padding: 2,
    backgroundColor: colors.leather.black,
    ...shadows.gold,
  },
  avatarOnline: {
    borderColor: colors.accent.green,
    shadowColor: colors.accent.green,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.gold.DEFAULT,
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
});
