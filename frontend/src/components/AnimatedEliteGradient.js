import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function AnimatedEliteGradient({ children, style }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View style={[styles.container, style]}>
      <AnimatedGradient
        colors={["#FFD700", "#FF8C00", "#FFD700", "#B8860B", "#FFD700"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 2, y: 1 }}
        style={[
          styles.gradient,
          {
            transform: [{ translateX }],
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 2,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    width: "400%", // Extra width for sliding
  },
  content: {
    // Inner bubble style is handled by parent, but this provides the structure
  },
});
