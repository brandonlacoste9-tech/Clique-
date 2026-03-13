// Story Viewer Progress Bar Component
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

import { colors } from '../theme/chatsnapTheme';

export default function StoryViewerProgress({ 
  duration = 15, 
  onProgressComplete,
  isPaused = false 
}) {
  const [progress, setProgress] = useState(0);
  const animationRef = useRef(new Animated.Value(0));
  const startTimeRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    // Reset animation when duration changes
    animationRef.current.setValue(0);
    setProgress(0);
    
    if (!isPaused) {
      startAnimation();
    }
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [duration, isPaused]);

  const startAnimation = () => {
    const startTime = Date.now();
    startTimeRef.current = startTime;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000; // in seconds
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      animationRef.current.setValue(newProgress);

      if (newProgress >= 100) {
        onProgressComplete?.();
      } else {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);
  };

  const pauseAnimation = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  };

  const resumeAnimation = () => {
    if (!animationIdRef.current) {
      startAnimation();
    }
  };

  const togglePause = () => {
    if (animationIdRef.current) {
      pauseAnimation();
    } else {
      resumeAnimation();
    }
  };

  // Expose methods for parent component
  React.useImperativeHandle(ref, () => ({
    pause: pauseAnimation,
    resume: resumeAnimation,
    togglePause,
    getProgress: () => progress,
    setProgress: (val) => {
      setProgress(val);
      animationRef.current.setValue(val);
    }
  }));

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animationRef.current.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>
          {Math.ceil((100 - progress) / 100 * duration)}s
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 100,
  },
  progressBar: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold.DEFAULT,
  },
  timeDisplay: {
    position: 'absolute',
    top: -20,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
