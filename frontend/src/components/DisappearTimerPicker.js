import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  DISAPPEAR_OPTIONS,
  setDisappearTimer,
  getDisappearTimer,
  getTimerLabel,
} from "../services/disappearingMessageService";
import { colors, spacing, borderRadius, shadows } from "../theme/cliqueTheme";

/**
 * DisappearTimerPicker — Lets users set self-destruct timer for a conversation.
 * Renders as a small indicator in the chat header, tap to change.
 */
export default function DisappearTimerPicker({ conversationId, onChange }) {
  const [currentTimer, setCurrentTimer] = useState("off");
  const [showPicker, setShowPicker] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadTimer();
  }, [conversationId]);

  const loadTimer = async () => {
    const config = await getDisappearTimer(conversationId);
    setCurrentTimer(config?.key || "off");
  };

  const handleSelect = async (optionKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await setDisappearTimer(conversationId, optionKey);
    setCurrentTimer(optionKey);
    setShowPicker(false);

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (onChange) onChange(optionKey);
  };

  const { icon } = getTimerLabel(currentTimer);
  const isActive = currentTimer !== "off";

  return (
    <>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowPicker(true);
          }}
          style={[styles.badge, isActive && styles.badgeActive]}
        >
          <Text style={styles.badgeIcon}>{isActive ? "⏱️" : "💬"}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Timer Picker Modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Header */}
            <Text style={styles.modalTitle}>
              MESSAGES ÉPHÉMÈRES / DISAPPEARING MESSAGES
            </Text>
            <Text style={styles.modalSubtitle}>
              Les messages disparaissent après lecture.{"\n"}
              Messages disappear after being read.
            </Text>

            {/* Options */}
            <View style={styles.optionsList}>
              {DISAPPEAR_OPTIONS.map((option) => {
                const isSelected = currentTimer === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    onPress={() => handleSelect(option.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionLabels}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.fr}
                      </Text>
                      <Text style={styles.optionSublabel}>{option.en}</Text>
                    </View>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Close button */}
            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Fermer / Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  badgeActive: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  badgeIcon: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.leather.dark,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    ...shadows.gold,
    shadowOpacity: 0.2,
  },
  modalTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    color: colors.text.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  optionsList: {
    marginBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 4,
  },
  optionRowSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  optionIcon: {
    fontSize: 22,
    marginRight: spacing.md,
    width: 30,
    textAlign: "center",
  },
  optionLabels: {
    flex: 1,
  },
  optionLabel: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  optionLabelSelected: {
    color: colors.gold.DEFAULT,
  },
  optionSublabel: {
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 1,
  },
  checkmark: {
    color: colors.gold.DEFAULT,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    alignItems: "center",
  },
  closeBtnText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
