import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

const { width, height } = Dimensions.get('window');

export default function ImperialStoryViewer({
  story,
  onClose,
  onNext,
  onPrev,
}) {
  const [progress, setProgress] = useState(0);
  const [showCaption, setShowCaption] = useState(true);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const captionAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start progress animation
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 15000, // 15 seconds
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && onNext) {
        onNext();
      }
    });

    // Auto-hide caption after 3 seconds
    const captionTimer = setTimeout(() => {
      Animated.timing(captionAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }, 3000);

    return () => clearTimeout(captionTimer);
  }, []);

  const toggleCaption = () => {
    if (captionAnim.current._value === 1) {
      Animated.timing(captionAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(captionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePress = () => {
    toggleCaption();
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {/* Story media */}
      <TouchableOpacity style={styles.mediaContainer} onPress={handlePress}>
        <Image
          source={{ uri: story.mediaUrl }}
          style={styles.media}
          resizeMode="cover"
        />
        
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
            ]}
          />
        </View>

        {/* Caption overlay */}
        <Animated.View
          style={[
            styles.captionContainer,
            { opacity: captionAnim },
          ]}
        >
          <Text style={styles.captionText}>{story.caption}</Text>
        </Animated.View>

        {/* User info */}
        <View style={styles.userInfo}>
          <Image
            source={{ uri: story.userAvatar }}
            style={styles.userAvatar}
          />
          <Text style={styles.username}>{story.username}</Text>
        </View>
      </TouchableOpacity>

      {/* Navigation buttons */}
      <View style={styles.navContainer}>
        {onPrev && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={onPrev}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
        )}
        
        {onNext && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={onNext}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.leather.black,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: colors.gold.DEFAULT,
    fontSize: 28,
    fontWeight: '300',
  },
  mediaContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.gold.DEFAULT,
    ...shadows.gold,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  captionText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    textAlign: 'center',
    fontWeight: '500',
  },
  userInfo: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
  },
  username: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  navContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    transform: [{ translateY: -50 }],
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  navButtonText: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '300',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  actionIcon: {
    fontSize: 20,
  },
});
