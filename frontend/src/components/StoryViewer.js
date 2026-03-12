import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";
import { Video } from "expo-av";
import { colors, typography, spacing, shadows } from "../theme/cliqueTheme";
import { useUIStore, useMessagesStore, useAuthStore } from "../store/cliqueStore";
import { messagesAPI } from "../api/cliqueApi";

const REACTION_EMOJIS = ["🔥", "😍", "😂", "⚜️", "💯"];

const { width, height } = Dimensions.get("window");

const StoryViewer = () => {
  const { showStoryViewer, currentStoryGroup, closeStoryViewer } = useUIStore();
  const { addMessage } = useMessagesStore();
  const { user } = useAuthStore();
  const borderOpacity = useSharedValue(0);

  const handleReaction = async (emoji) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const targetUserId = currentStoryGroup.userId || currentStoryGroup.id;
    
    // Add to local state optimistically
    addMessage(targetUserId, {
      id: `reaction-${Date.now()}`,
      sender: "me",
      text: emoji,
      contentType: "sticker",
      contentKey: "story_reaction",
      timestamp: new Date().toISOString()
    });

    try {
      await messagesAPI.sendMessage(targetUserId, {
        text: emoji,
        contentType: "sticker",
        contentKey: "story_reaction"
      });
    } catch (err) {
      console.warn("Reaction send error", err);
    }

    closeStoryViewer();
  };

  useEffect(() => {
    if (showStoryViewer) {
      // Imperial Haptic Pulse
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Imperial Glow sequence
      borderOpacity.value = withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 2000 }),
      );
    }
  }, [showStoryViewer]);

  if (!showStoryViewer || !currentStoryGroup) return null;

  const animatedBorderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
    borderColor: colors.gold.DEFAULT,
    borderWidth: 4,
    borderRadius: 20,
    ...shadows.gold,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  }));

  return (
    <Modal transparent visible={showStoryViewer} animationType="none">
      <View style={styles.container}>
        {/* Suede Curtain Effect */}
        <Animated.View
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          style={[StyleSheet.absoluteFill, styles.suedeOverlay]}
        >
          <Image
            source={require("../../assets/suede_bg.png")}
            style={styles.suedeImage}
            blurRadius={10}
          />
        </Animated.View>

        {/* Story Content Slide */}
        <Animated.View
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown.duration(300)}
          style={styles.contentContainer}
        >
          {/* Gold Glow Border Overlay */}
          <Animated.View style={animatedBorderStyle} pointerEvents="none" />

          {/* Media Rendering */}
          <View style={styles.mediaContainer}>
            {currentStoryGroup.stories[0]?.type === "video" ? (
              <Video
                source={{ uri: currentStoryGroup.stories[0].url }}
                style={styles.media}
                resizeMode="cover"
                shouldPlay
                isLooping
              />
            ) : (
              <Image
                source={{ uri: currentStoryGroup.stories[0]?.url }}
                style={styles.media}
              />
            )}
          </View>

          {/* Top Bar (Info & Close) */}
          <View style={styles.topBar}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: currentStoryGroup.avatarUrl }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>
                  {currentStoryGroup.username}
                </Text>
                <Text style={styles.timestamp}>L'Élite de l'Instant / The Instant Elite</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeStoryViewer}
              style={styles.closeButton}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* YOLO & Metadata Overlays */}
          {currentStoryGroup.stories[0]?.mood && (
            <View style={styles.metadataContainer}>
              <View style={styles.yoloPill}>
                <Text style={styles.yoloIcon}>👁️ YOLOv8n</Text>
                <Text style={styles.yoloText}>
                  {currentStoryGroup.stories[0].mood
                    .replace("auto-tag: ", "")
                    .toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          {currentStoryGroup.stories[0]?.caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>
                {currentStoryGroup.stories[0].caption}
              </Text>
            </View>
          )}

          {/* Suede Interaction footer */}
          <View style={styles.footer}>
            {/* Quick Reactions */}
            <View style={styles.reactionsBar}>
              {REACTION_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleReaction(emoji)}
                  style={styles.reactionButton}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reply Button */}
            <TouchableOpacity style={styles.replyButton}>
              <Text style={styles.replyText}>
                Répondre à / Reply to {currentStoryGroup.username}...
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  suedeOverlay: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  suedeImage: {
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },
  contentContainer: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  mediaContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  topBar: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  username: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  timestamp: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  closeButton: {
    padding: 10,
  },
  closeIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 20,
  },
  replyButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  replyText: {
    color: "#fff",
    fontSize: 14,
  },
  reactionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  reactionEmoji: {
    fontSize: 24,
  },
  metadataContainer: {
    position: "absolute",
    top: 120,
    right: 20,
    alignItems: "flex-end",
    zIndex: 20,
  },
  yoloPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 13, 13, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent.green,
    shadowColor: colors.accent.green,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    gap: 6,
  },
  yoloIcon: {
    fontSize: 10,
    color: colors.accent.green,
    fontWeight: "bold",
  },
  yoloText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  captionContainer: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 20,
  },
  captionText: {
    color: "#fff",
    fontSize: typography.sizes.lg,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});

export default StoryViewer;
