import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/cliqueTheme';

export default function ImperialAvatar({
  uri,
  size = 'md',
  name,
  status = 'offline',
  showStatus = true,
  onPress,
  style,
  ...props
}) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 40, height: 40 };
      case 'md':
        return { width: 56, height: 56 };
      case 'lg':
        return { width: 80, height: 80 };
      case 'xl':
        return { width: 120, height: 120 };
      default:
        return { width: 56, height: 56 };
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return colors.accent.green;
      case 'busy':
        return colors.accent.red;
      case 'away':
        return colors.accent.orange;
      default:
        return colors.text.muted;
    }
  };

  const avatarContent = (
    <View style={[styles.container, getSizeStyles(), style]} {...props}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {name ? name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      )}
      
      {showStatus && (
        <View
          style={[
            styles.statusIndicator,
            { borderColor: colors.leather.black },
            status === 'online' && styles.statusOnline,
            status === 'busy' && styles.statusBusy,
            status === 'away' && styles.statusAway,
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
      >
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    ...shadows.gold,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '900',
    color: colors.leather.black,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.text.muted,
    borderWidth: 2,
  },
  statusOnline: {
    backgroundColor: colors.accent.green,
    ...shadows.gold,
  },
  statusBusy: {
    backgroundColor: colors.accent.red,
    ...shadows.gold,
  },
  statusAway: {
    backgroundColor: colors.accent.orange,
    ...shadows.gold,
  },
});
