/**
 * Web stub for react-native-maps (native-only).
 * Renders a placeholder; full map available in the mobile app.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MapPlaceholder = () => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>🗺️ Carte</Text>
    <Text style={styles.subtext}>Disponible dans l'app mobile</Text>
  </View>
);

// Stub Marker: render children only (pins won't show on web)
export const Marker = ({ children }) => (children ? <>{children}</> : null);

export default MapPlaceholder;

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d0d0d",
  },
  text: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
});
