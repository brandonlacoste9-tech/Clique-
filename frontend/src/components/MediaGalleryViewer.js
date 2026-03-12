import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from "react-native";
import { Video } from "expo-av";
import { colors, spacing, typography } from "../theme/cliqueTheme";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MediaGalleryViewer({
  visible,
  mediaUri,
  mediaType,
  senderName,
  onClose,
}) {
  const panY = useState(new Animated.Value(0))[0];

  const resetPan = () => {
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const panResponder = panResponder || PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: Animated.event([null, { dy: panY }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gestureState) => {
      if (Math.abs(gestureState.dy) > 150 || Math.abs(gestureState.vy) > 1.5) {
        // Swipe away to close
        Animated.timing(panY, {
          toValue: gestureState.dy > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onClose();
          setTimeout(() => panY.setValue(0), 200);
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        // Snap back
        resetPan();
      }
    },
  });

  if (!visible || !mediaUri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {/* Background Overlay */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: panY.interpolate({
                inputRange: [-SCREEN_HEIGHT, 0, SCREEN_HEIGHT],
                outputRange: [0, 1, 0],
              }),
            },
          ]}
        />

        <Animated.View
          style={[styles.contentContainer, { transform: [{ translateY: panY }] }]}
          {...panResponder.panHandlers}
        >
          {mediaType === "video" ? (
            <Video
              source={{ uri: mediaUri }}
              style={styles.media}
              resizeMode="contain"
              shouldPlay
              isLooping
              isMuted={false}
              useNativeControls
            />
          ) : (
            <Image
              source={{ uri: mediaUri }}
              style={styles.media}
              resizeMode="contain"
            />
          )}

          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            {senderName && (
              <View style={styles.titleBadge}>
                <Text style={styles.titleText}>{senderName}</Text>
              </View>
            )}
            <View style={{ width: 44 }} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  contentContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  titleBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.5)",
  },
  titleText: {
    color: colors.gold.DEFAULT,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
