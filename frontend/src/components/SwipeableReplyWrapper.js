import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { colors, spacing } from "../theme/cliqueTheme";

/**
 * SwipeableReplyWrapper — Wrap message bubble to enable "Swipe-to-Reply".
 *
 * When swipe right exceeds threshold, triggers onReply callback and plays haptic.
 */
export default function SwipeableReplyWrapper({
  children,
  onReply,
  isDisabled = false,
}) {
  const translateX = new Animated.Value(0);
  const opacity = translateX.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX > 60 && !isDisabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onReply) onReply();
      }
      // Snap back
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[0, 50]}
        failOffsetY={[-10, 10]}
      >
        <Animated.View style={{ transform: [{ translateX }] }}>
          {/* Reply Icon revealing behind */}
          <Animated.View style={[styles.replyIconContainer, { opacity }]}>
            <View style={styles.replyCircle}>
              <Text style={styles.replyIcon}>↩️</Text>
            </View>
          </Animated.View>

          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  replyIconContainer: {
    position: "absolute",
    left: -60,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
  },
  replyCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
  },
  replyIcon: {
    fontSize: 16,
  },
});
