import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialChatBubble({
  message,
  showAvatar = false,
  showTime = true,
  onAvatarPress,
}) {
  const isMe = message.sender === 'me';

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.myContainer : styles.theirContainer,
      ]}
    >
      {!isMe && showAvatar && (
        <TouchableOpacity
          style={styles.avatar}
          onPress={onAvatarPress}
        >
          <Image
            source={{ uri: message.userAvatar }}
            style={styles.avatarImage}
          />
        </TouchableOpacity>
      )}
      
      <View
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.theirBubble,
        ]}
      >
        {message.type === 'image' ? (
          <Image
            source={{ uri: message.mediaUrl }}
            style={styles.mediaBubble}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.text, isMe ? styles.myText : styles.theirText]}>
            {message.text}
          </Text>
        )}
        
        {showTime && message.timestamp && (
          <Text style={styles.time}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  myContainer: {
    alignSelf: 'flex-end',
  },
  theirContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  bubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    position: 'relative',
  },
  myBubble: {
    backgroundColor: colors.gold.DEFAULT,
    borderBottomRightRadius: 4,
    ...shadows.gold,
  },
  theirBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: typography.sizes.base,
    lineHeight: 20,
  },
  myText: {
    color: colors.leather.black,
    fontWeight: '500',
  },
  theirText: {
    color: colors.text.primary,
  },
  mediaBubble: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
