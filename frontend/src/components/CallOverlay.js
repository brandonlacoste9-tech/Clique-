import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { colors, spacing, borderRadius, shadows } from "../theme/cliqueTheme";
import { callService, CALL_TYPES } from "../services/callService";
import { useLanguageStore } from "../services/languageService";

const { width, height } = Dimensions.get("window");

/**
 * CallOverlay — High-fidelity fullscreen call UI.
 * Supports Video Grid, Voice Mode, and premium controls.
 */
export default function CallOverlay({ visible, call, onClose }) {
  const { language } = useLanguageStore();
  const [duration, setDuration] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval;
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();

      // Loop Pulse Animations
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse1, { toValue: 1.4, duration: 2000, useNativeDriver: true }),
            Animated.timing(pulse1, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(1000),
            Animated.timing(pulse2, { toValue: 1.4, duration: 2000, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();

      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
    return () => clearInterval(interval);
  }, [visible]);

  const formatDuration = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    callService.endCall();
    if (onClose) onClose();
  };

  const LABELS = {
    fr: { end: "Raccrocher", mute: "Muet", cam: "Caméra", joining: "Connexion..." },
    en: { end: "End", mute: "Mute", cam: "Camera", joining: "Connecting..." },
    es: { end: "Finalizar", mute: "Silencio", cam: "Cámara", joining: "Conectando..." },
  };

  const L = LABELS[language] || LABELS.fr;

  if (!visible || !call) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.container}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <SafeAreaView style={styles.safeArea}>
            
            {/* Header: Status & Timer */}
            <View style={styles.header}>
              <View style={styles.statusBadge}>
                <View style={[styles.pulseDot, { backgroundColor: call.type === CALL_TYPES.VIDEO ? colors.gold.DEFAULT : "#4CAF50" }]} />
                <Text style={styles.statusText}>{call.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.durationText}>{formatDuration(duration)}</Text>
              <TouchableOpacity onPress={onClose} style={styles.minimizeBtn}>
                <Text style={styles.minimizeIcon}>⌄</Text>
              </TouchableOpacity>
            </View>

            {/* Main View: Grid or Voice Avatar */}
            <View style={styles.mainView}>
              {call.type === CALL_TYPES.VIDEO ? (
                <View style={styles.videoGrid}>
                  {/* Mock Remote Video */}
                  <View style={styles.remoteVideo}>
                    <Image 
                      source={{ uri: "https://api.clique.app/v1/mock/video-stream-1" }} 
                      style={styles.fullVideo}
                      defaultSource={require("../../assets/icon.png")} // Fallback
                    />
                    <View style={styles.participantNameBadge}>
                      <Text style={styles.participantName}>Jean-Sébastien</Text>
                    </View>
                  </View>
                  
                  {/* Mock Local Video (PIP) */}
                  {!call.isCameraOff && (
                    <View style={styles.localVideoPip}>
                      <View style={styles.localVideoPlaceholder}>
                        <Text style={styles.localIcon}>👤</Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.voiceView}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>👑</Text>
                    {/* Animated Pulse Rings */}
                    <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse1 }], opacity: pulse1.interpolate({ inputRange: [1, 1.4], outputRange: [0.3, 0] }) }]} />
                    <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse2 }], opacity: pulse2.interpolate({ inputRange: [1, 1.4], outputRange: [0.3, 0] }) }]} />
                  </View>
                  <Text style={styles.callerName}>La Clique Elite</Text>
                  <Text style={styles.connectingText}>{L.joining}</Text>
                </View>
              )}
            </View>

            {/* Bottom Controls */}
            <View style={styles.controlsContainer}>
              <View style={styles.controlsRow}>
                {/* Mute Toggle */}
                <TouchableOpacity 
                  style={[styles.controlBtn, call.isMuted && styles.controlBtnActive]} 
                  onPress={() => callService.toggleMute()}
                >
                  <Text style={styles.controlIcon}>{call.isMuted ? "🎙️" : "🎤"}</Text>
                  <Text style={styles.controlLabel}>{L.mute}</Text>
                </TouchableOpacity>

                {/* End Call */}
                <TouchableOpacity 
                  style={styles.endCallBtn} 
                  onPress={handleEndCall}
                >
                  <Text style={styles.endCallIcon}>📞</Text>
                </TouchableOpacity>

                {/* Camera Toggle (Video Call Only) */}
                {call.type === CALL_TYPES.VIDEO && (
                  <TouchableOpacity 
                    style={[styles.controlBtn, call.isCameraOff && styles.controlBtnActive]} 
                    onPress={() => callService.toggleCamera()}
                  >
                    <Text style={styles.controlIcon}>{call.isCameraOff ? "📵" : "📹"}</Text>
                    <Text style={styles.controlLabel}>{L.cam}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: colors.gold.DEFAULT,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  durationText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  minimizeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  minimizeIcon: {
    color: "#FFF",
    fontSize: 24,
    marginTop: -8,
  },
  mainView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // ─── Video Grid Styles ───────────
  videoGrid: {
    flex: 1,
    width: "100%",
    padding: spacing.md,
    position: "relative",
  },
  remoteVideo: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#111",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fullVideo: {
    width: "100%",
    height: "100%",
  },
  participantNameBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  participantName: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  localVideoPip: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.xl,
    width: 100,
    height: 150,
    borderRadius: 16,
    backgroundColor: "#222",
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    overflow: "hidden",
    ...shadows.gold,
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  localIcon: {
    fontSize: 24,
  },
  // ─── Voice View Styles ───────────
  voiceView: {
    alignItems: "center",
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.leather.dark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.gold.DEFAULT,
    marginBottom: spacing.xl,
    position: "relative",
    ...shadows.gold,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  pulseRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    opacity: 0.3,
  },
  callerName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  connectingText: {
    color: colors.gold.DEFAULT,
    fontSize: 14,
    letterSpacing: 1,
  },
  // ─── Controls Styles ─────────────
  controlsContainer: {
    paddingBottom: spacing["2xl"],
    paddingHorizontal: spacing.xl,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: spacing.lg,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  controlBtn: {
    alignItems: "center",
    width: 60,
  },
  controlBtnActive: {
    opacity: 0.5,
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlLabel: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "135deg" }],
    ...shadows.gold,
    shadowColor: "#FF3B30",
  },
  endCallIcon: {
    color: "#FFF",
    fontSize: 28,
  },
});
