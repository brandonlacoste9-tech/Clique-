import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  TouchableWithoutFeedback,
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
import { useUIStore } from "../store/cliqueStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const StoryViewer = () => {
  const { showStoryViewer, currentStoryGroup, closeStoryViewer } = useUIStore();
  const borderOpacity = useSharedValue(0);

  // Which story in the group (user can have multiple stories)
  const [storyIndex, setStoryIndex] = useState(0);
  // Which segment within the current story (for backend-segmented video)
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerWidthRef = useRef(SCREEN_WIDTH);
  const segmentEndHandledRef = useRef(false);

  const stories = currentStoryGroup?.stories ?? [];
  const story = stories[storyIndex];
  // Segment resolution: backend segments or single-URL backward compat
  const hasSegments =
    Array.isArray(story?.segments) && story.segments.length > 0;
  const currentSegment = hasSegments
    ? story.segments[segmentIndex]
    : story
      ? { url: story.url ?? story.mediaUrl, durationSeconds: story.durationSeconds ?? 7 }
      : null;
  const totalSegments = hasSegments ? story.segments.length : 1;
  const progressBarsSource = hasSegments ? story.segments : (currentSegment ? [currentSegment] : []);

  // Reset indices when viewer opens or when story group changes
  useEffect(() => {
    if (showStoryViewer && currentStoryGroup) {
      setStoryIndex(0);
      setSegmentIndex(0);
      setIsPaused(false);
    }
  }, [showStoryViewer, currentStoryGroup?.id ?? currentStoryGroup?.username]);

  // Reset segment when switching to another story in the same group
  useEffect(() => {
    setSegmentIndex(0);
  }, [storyIndex]);

  // Allow segment end to fire again when segment or story changes
  useEffect(() => {
    segmentEndHandledRef.current = false;
  }, [storyIndex, segmentIndex]);

  useEffect(() => {
    if (showStoryViewer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      borderOpacity.value = withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 2000 }),
      );
    }
  }, [showStoryViewer]);

  const goToNextStoryGroup = useCallback(() => {
    if (storyIndex < stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setSegmentIndex(0);
    } else {
      closeStoryViewer();
    }
  }, [storyIndex, stories.length, closeStoryViewer]);

  const goToPreviousStoryGroup = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setSegmentIndex(0);
    } else {
      closeStoryViewer();
    }
  }, [storyIndex, closeStoryViewer]);

  const handleSegmentEnd = useCallback(() => {
    if (segmentIndex < totalSegments - 1) {
      setSegmentIndex((i) => i + 1);
    } else {
      goToNextStoryGroup();
    }
  }, [totalSegments, segmentIndex, goToNextStoryGroup]);

  const onPlaybackStatusUpdate = useCallback(
    (status) => {
      if (!status.isLoaded || isPaused || segmentEndHandledRef.current) return;
      const remaining = status.durationMillis - status.positionMillis;
      if (remaining < 200 && status.durationMillis > 0) {
        segmentEndHandledRef.current = true;
        handleSegmentEnd();
      }
    },
    [isPaused, handleSegmentEnd],
  );

  const preloadNextSegment = useCallback(() => {
    if (!hasSegments) return;
    const next = story.segments[segmentIndex + 1];
    if (next?.url && typeof Video.prefetch === "function") {
      Video.prefetch(next.url);
    }
  }, [hasSegments, story?.segments, segmentIndex]);

  const onTap = useCallback(
    (evt) => {
      const x = evt.nativeEvent.locationX;
      const w = containerWidthRef.current;
      if (x < w / 2) {
        if (segmentIndex > 0) {
          setSegmentIndex((i) => i - 1);
        } else {
          goToPreviousStoryGroup();
        }
      } else {
        if (segmentIndex < totalSegments - 1) {
          setSegmentIndex((i) => i + 1);
        } else {
          goToNextStoryGroup();
        }
      }
    },
    [totalSegments, segmentIndex, goToNextStoryGroup, goToPreviousStoryGroup],
  );

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

  const isImage = story?.mediaType === "image";
  const isVideo = !isImage && (story?.type === "video" || story?.mediaType === "video");

  return (
    <Modal transparent visible={showStoryViewer} animationType="none">
      <View style={styles.container}>
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

        <Animated.View
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown.duration(300)}
          style={styles.contentContainer}
          onLayout={(e) => {
            containerWidthRef.current = e.nativeEvent.layout.width;
          }}
        >
          <Animated.View style={animatedBorderStyle} pointerEvents="none" />

          <TouchableWithoutFeedback
            onPress={onTap}
            onLongPress={() => setIsPaused(true)}
            onPressOut={() => setIsPaused(false)}
          >
            <View style={styles.mediaContainer}>
              {!story || !currentSegment?.url ? null : isImage ? (
                <Image
                  source={{ uri: currentSegment.url }}
                  style={styles.media}
                  resizeMode="cover"
                />
              ) : (
                <Video
                  source={{ uri: currentSegment.url }}
                  style={styles.media}
                  resizeMode="cover"
                  shouldPlay={!isPaused}
                  isLooping={false}
                  onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                  onLoad={preloadNextSegment}
                />
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* Per-segment progress bars (one bar for single-URL stories) */}
          {progressBarsSource.length > 0 && (
            <View style={styles.progressContainer}>
              {progressBarsSource.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressBar,
                    i < segmentIndex && styles.progressBarFilled,
                    i === segmentIndex && styles.progressBarActive,
                  ]}
                />
              ))}
            </View>
          )}

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
                <Text style={styles.timestamp}>L'Élite de l'Instant</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeStoryViewer}
              style={styles.closeButton}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.replyButton}>
              <Text style={styles.replyText}>
                Répondre à {currentStoryGroup.username}...
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
  progressContainer: {
    position: "absolute",
    top: 50,
    left: 12,
    right: 12,
    flexDirection: "row",
    zIndex: 15,
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  progressBarFilled: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  progressBarActive: {
    backgroundColor: "white",
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
});

export default StoryViewer;
