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
  MUTE_OPTIONS,
  muteConversation,
  getMuteStatus,
  archiveConversation,
  unarchiveConversation,
  isConversationArchived,
  pinConversation,
  unpinConversation,
  isConversationPinned,
} from "../services/conversationManagerService";
import { useLanguageStore } from "../services/languageService";
import { colors, spacing, borderRadius, shadows } from "../theme/cliqueTheme";

/**
 * ChatOptionsSheet — Bottom sheet for conversation actions.
 * Pin, Mute, Archive, Delete.
 */
export default function ChatOptionsSheet({
  visible,
  conversationId,
  conversationName,
  onClose,
  onDelete,
  onStartVoiceCall,
  onStartVideoCall,
}) {
  const { language, t } = useLanguageStore();
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [muteStatus, setMuteStatus] = useState(null);
  const [showMuteOptions, setShowMuteOptions] = useState(false);
  const slideAnim = useState(new Animated.Value(400))[0];

  useEffect(() => {
    if (visible) {
      loadStates();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 150,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadStates = async () => {
    const pinned = await isConversationPinned(conversationId);
    const archived = await isConversationArchived(conversationId);
    const mute = await getMuteStatus(conversationId);
    setIsPinned(pinned);
    setIsArchived(archived);
    setMuteStatus(mute);
  };

  const handlePin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPinned) {
      await unpinConversation(conversationId);
    } else {
      await pinConversation(conversationId);
    }
    setIsPinned(!isPinned);
    onClose();
  };

  const handleArchive = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isArchived) {
      await unarchiveConversation(conversationId);
    } else {
      await archiveConversation(conversationId);
    }
    setIsArchived(!isArchived);
    onClose();
  };

  const handleMute = async (muteKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await muteConversation(conversationId, muteKey);
    setMuteStatus(muteKey === "off" ? null : { key: muteKey });
    setShowMuteOptions(false);
    onClose();
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (onDelete) onDelete(conversationId);
    onClose();
  };

  const handleCall = (type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (type === "voice" && onStartVoiceCall) onStartVoiceCall(conversationId);
    if (type === "video" && onStartVideoCall) onStartVideoCall(conversationId);
    onClose();
  };

  if (!visible) return null;

  const LABELS = {
    fr: {
      pin: "Épingler",
      unpin: "Désépingler",
      mute: "Muet",
      unmute: "Activer son",
      archive: "Archiver",
      unarchive: "Désarchiver",
      delete: "Supprimer",
      cancel: "Cancelar",
      muteTitle: "DURACIÓN DEL SILENCIO",
      call: "Appel",
      videoCall: "Appel Vidéo",
    },
    en: {
      pin: "Pin",
      unpin: "Unpin",
      mute: "Mute",
      unmute: "Unmute",
      archive: "Archive",
      unarchive: "Unarchive",
      delete: "Delete",
      cancel: "Cancel",
      muteTitle: "MUTE DURATION",
      call: "Voice Call",
      videoCall: "Video Call",
    },
    es: {
      pin: "Fijar",
      unpin: "Desfijar",
      mute: "Silenciar",
      unmute: "Activar sonido",
      archive: "Archivar",
      unarchive: "Desarchivar",
      delete: "Eliminar",
      cancel: "Cancelar",
      muteTitle: "DURACIÓN DEL SILENCIO",
      call: "Llamada de voz",
      videoCall: "Video llamada",
    },
  };

  const L = LABELS[language] || LABELS.fr;

  const actions = [
    {
      icon: "📞",
      label: L.call,
      onPress: () => handleCall("voice"),
      color: "#4CAF50",
    },
    {
      icon: "📹",
      label: L.videoCall,
      onPress: () => handleCall("video"),
      color: colors.gold.DEFAULT,
    },
    {
      icon: isPinned ? "📌" : "📍",
      label: isPinned ? L.unpin : L.pin,
      onPress: handlePin,
      color: colors.gold.DEFAULT,
    },
    {
      icon: muteStatus ? "🔔" : "🔕",
      label: muteStatus ? L.unmute : L.mute,
      onPress: () => {
        if (muteStatus) {
          handleMute("off");
        } else {
          setShowMuteOptions(true);
        }
      },
      color: colors.text.primary,
    },
    {
      icon: isArchived ? "📤" : "📦",
      label: isArchived ? L.unarchive : L.archive,
      onPress: handleArchive,
      color: colors.text.primary,
    },
    {
      icon: "🗑️",
      label: L.delete,
      onPress: handleDelete,
      color: "#FF4444",
      danger: true,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Conversation Name */}
          <View style={styles.sheetHeader}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>
              {conversationName?.toUpperCase()}
            </Text>
          </View>

          {/* Mute Duration Sub-menu */}
          {showMuteOptions ? (
            <View style={styles.muteSection}>
              <Text style={styles.muteSectionTitle}>{L.muteTitle}</Text>
              {MUTE_OPTIONS.filter((o) => o.key !== "off").map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.muteOption}
                  onPress={() => handleMute(option.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.muteIcon}>{option.icon}</Text>
                  <Text style={styles.muteLabel}>
                    {option[language] || option.fr}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowMuteOptions(false)}
              >
                <Text style={styles.cancelText}>{L.cancel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Main Actions */
            <View style={styles.actionsContainer}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionRow,
                    action.danger && styles.actionRowDanger,
                  ]}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text
                    style={[
                      styles.actionLabel,
                      { color: action.color },
                      action.danger && styles.actionLabelDanger,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Cancel */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{L.cancel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.leather.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHighlight,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 3,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceHighlight,
    gap: spacing.md,
  },
  actionRowDanger: {
    borderBottomWidth: 0,
  },
  actionIcon: {
    fontSize: 22,
    width: 32,
    textAlign: "center",
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionLabelDanger: {
    color: "#FF4444",
  },
  muteSection: {
    paddingHorizontal: spacing.lg,
  },
  muteSectionTitle: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  muteOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceHighlight,
  },
  muteIcon: {
    fontSize: 18,
    width: 28,
    textAlign: "center",
  },
  muteLabel: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: colors.text.muted,
    fontSize: 13,
  },
  closeBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    alignItems: "center",
  },
  closeBtnText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
