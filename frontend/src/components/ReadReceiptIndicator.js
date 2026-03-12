import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/cliqueTheme";

/**
 * ReadReceiptIndicator — Displays message delivery status.
 *
 * Status flow:
 *   sending → sent (✓) → delivered (✓✓) → read (✓✓ gold)
 *
 * Bilingual tooltip support.
 */
export default function ReadReceiptIndicator({ status, timestamp }) {
  const getCheckmarks = () => {
    switch (status) {
      case "sending":
        return { icon: "◦", color: colors.text.muted, label: "Envoi... / Sending..." };
      case "sent":
        return { icon: "✓", color: colors.text.secondary, label: "Envoyé / Sent" };
      case "delivered":
        return { icon: "✓✓", color: colors.text.secondary, label: "Livré / Delivered" };
      case "read":
        return { icon: "✓✓", color: colors.gold.DEFAULT, label: "Lu / Read" };
      case "failed":
        return { icon: "⚠", color: "#FF4444", label: "Échec / Failed" };
      default:
        return { icon: "✓", color: colors.text.muted, label: "" };
    }
  };

  const { icon, color } = getCheckmarks();

  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      const date = new Date(ts);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  return (
    <View style={styles.container}>
      {timestamp && (
        <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
      )}
      <Text style={[styles.checkmark, { color }]}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontWeight: "300",
  },
  checkmark: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: -1,
  },
});
