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
  getSecurityFingerprint,
  getEncryptionStats,
  E2E_STATUS,
} from "../services/encryptionService";
import { colors, spacing, borderRadius, shadows } from "../theme/cliqueTheme";

/**
 * EncryptionBadge — Shows E2E encryption status in chat headers.
 * Tap to reveal the security fingerprint verification modal.
 */
export default function EncryptionBadge({ recipientId, recipientName }) {
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [fingerprint, setFingerprint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    checkEncryptionStatus();
  }, [recipientId]);

  const checkEncryptionStatus = async () => {
    try {
      const fp = await getSecurityFingerprint(recipientId);
      const encStats = await getEncryptionStats();
      setFingerprint(fp);
      setIsEncrypted(!!fp);
      setStats(encStats);
    } catch (err) {
      console.warn("[EncryptionBadge] Status check error:", err);
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setShowModal(true);
  };

  const status = isEncrypted ? E2E_STATUS.ENCRYPTED : E2E_STATUS.NOT_ENCRYPTED;

  return (
    <>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity onPress={handlePress} style={styles.badge}>
          <Text style={styles.badgeIcon}>{status.icon}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Security Verification Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>
                {isEncrypted ? "🔐" : "🔓"}
              </Text>
              <Text style={styles.modalTitle}>
                {isEncrypted
                  ? "CHIFFREMENT ACTIF / ENCRYPTION ACTIVE"
                  : "NON CHIFFRÉ / NOT ENCRYPTED"}
              </Text>
            </View>

            {/* Status Description */}
            <Text style={styles.modalDescription}>
              {isEncrypted
                ? `Les messages avec ${recipientName} sont chiffrés de bout en bout. Personne d'autre ne peut les lire.\n\nMessages with ${recipientName} are end-to-end encrypted. No one else can read them.`
                : `La session de chiffrement n'est pas encore établie. Les messages seront chiffrés une fois la session créée.\n\nEncryption session not yet established. Messages will be encrypted once the session is created.`}
            </Text>

            {/* Security Fingerprint */}
            {fingerprint && (
              <View style={styles.fingerprintSection}>
                <Text style={styles.fingerprintLabel}>
                  EMPREINTE DE SÉCURITÉ / SECURITY FINGERPRINT
                </Text>
                <View style={styles.fingerprintBox}>
                  <Text style={styles.fingerprintText}>{fingerprint}</Text>
                </View>
                <Text style={styles.fingerprintHint}>
                  Comparez cette empreinte avec {recipientName} pour vérifier
                  l'identité.{"\n"}Compare this fingerprint with {recipientName}{" "}
                  to verify identity.
                </Text>
              </View>
            )}

            {/* Stats */}
            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {stats.activeSessions}
                  </Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {stats.publicFingerprint
                      ? `${stats.publicFingerprint}...`
                      : "—"}
                  </Text>
                  <Text style={styles.statLabel}>Clé / Key</Text>
                </View>
              </View>
            )}

            {/* Close button */}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
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
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
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
  modalHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  modalDescription: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  fingerprintSection: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  fingerprintLabel: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  fingerprintBox: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    marginBottom: spacing.sm,
  },
  fingerprintText: {
    color: colors.gold.DEFAULT,
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: 1,
    textAlign: "center",
  },
  fingerprintHint: {
    color: colors.text.muted,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  statLabel: {
    color: colors.text.muted,
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.5,
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
