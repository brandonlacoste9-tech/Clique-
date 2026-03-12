import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";

const MAX_DURATION_MS = 60000; // 60 seconds max

export default function VoiceRecorder({ onRecordingComplete, onCancel }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [sound, setSound] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recording, sound]);

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave bar animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Gold glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Audio permission not granted");
        return;
      }

      // Configure audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setDuration(0);
      setRecordedUri(null);

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Duration timer
      intervalRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= MAX_DURATION_MS / 1000) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      clearInterval(intervalRef.current);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setRecordedUri(uri);
      setIsRecording(false);
      setRecording(null);

      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  const playRecording = async () => {
    if (!recordedUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error("Failed to play recording:", err);
    }
  };

  const handleSend = () => {
    if (recordedUri && onRecordingComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRecordingComplete({
        uri: recordedUri,
        duration,
        type: "voice_note",
      });
    }
  };

  const handleCancel = () => {
    if (recording) {
      recording.stopAndUnloadAsync().catch(() => {});
    }
    clearInterval(intervalRef.current);
    setRecording(null);
    setIsRecording(false);
    setDuration(0);
    setRecordedUri(null);

    if (onCancel) onCancel();
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Generate wave visualization bars
  const renderWaveBars = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const randomHeight = 8 + Math.random() * 24;
      const animatedHeight = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [randomHeight * 0.3, randomHeight],
      });

      bars.push(
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              height: isRecording ? animatedHeight : randomHeight * 0.5,
              backgroundColor: isRecording
                ? colors.gold.DEFAULT
                : recordedUri
                  ? colors.gold.light
                  : colors.surfaceHighlight,
            },
          ]}
        />
      );
    }
    return bars;
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <View style={styles.container}>
      {/* Imperial glow backdrop */}
      {isRecording && (
        <Animated.View
          style={[styles.glowBackdrop, { opacity: glowOpacity }]}
        />
      )}

      {/* Cancel / Duration / Send row */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.durationContainer}>
          {isRecording && <View style={styles.recordingDot} />}
          <Text
            style={[
              styles.durationText,
              isRecording && styles.durationRecording,
            ]}
          >
            {formatDuration(duration)}
          </Text>
        </View>

        {recordedUri && !isRecording && (
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendText}>▸</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wave Visualization */}
      <View style={styles.waveContainer}>{renderWaveBars()}</View>

      {/* Action Buttons */}
      <View style={styles.controls}>
        {recordedUri && !isRecording ? (
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.retakeButton}
            >
              <Text style={styles.retakeText}>
                Refaire / Retake
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={playRecording}
              style={[styles.playButton, isPlaying && styles.playingButton]}
            >
              <Text style={styles.playIcon}>
                {isPlaying ? "⏸" : "▶"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSend} style={styles.confirmSend}>
              <Text style={styles.confirmSendText}>
                Envoyer / Send
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.controlRow}>
            <Text style={styles.hintText}>
              {isRecording
                ? "Enregistrement... / Recording..."
                : "Appuie pour enregistrer / Tap to record"}
            </Text>

            <Animated.View
              style={[
                styles.recordButtonOuter,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                ]}
                activeOpacity={0.7}
              >
                {isRecording ? (
                  <View style={styles.stopSquare} />
                ) : (
                  <Text style={styles.micIcon}>🎤</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.maxDuration}>Max 1:00</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.leather.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    overflow: "hidden",
  },
  glowBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.gold.DEFAULT,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  durationText: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.mono,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  durationRecording: {
    color: colors.gold.DEFAULT,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.gold,
  },
  sendText: {
    color: colors.leather.black,
    fontSize: 22,
    fontWeight: "bold",
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.lg,
    gap: 3,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hintText: {
    color: colors.text.muted,
    fontSize: 11,
    flex: 1,
    textAlign: "center",
  },
  maxDuration: {
    color: colors.text.muted,
    fontSize: 10,
    flex: 1,
    textAlign: "center",
  },
  recordButtonOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.gold.DEFAULT,
    ...shadows.gold,
  },
  recordButtonActive: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    borderColor: "#FF3B30",
  },
  micIcon: {
    fontSize: 28,
  },
  stopSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  retakeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  retakeText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: "bold",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
  },
  playingButton: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  playIcon: {
    fontSize: 24,
    color: colors.gold.DEFAULT,
  },
  confirmSend: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gold.DEFAULT,
    ...shadows.gold,
    shadowOpacity: 0.3,
  },
  confirmSendText: {
    color: colors.leather.black,
    fontSize: 11,
    fontWeight: "bold",
  },
});
