import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors, typography, borderRadius } from "../theme/cliqueTheme";
import * as Linking from "expo-linking";

const { width } = Dimensions.get("window");
const SNIPPET_SIZE = width * 0.5;

export default function LocationMessage({ latitude, longitude, isMe }) {
  const handlePress = () => {
    // Open in native maps app
    const url = `maps://?q=${latitude},${longitude}`; // iOS
    const androidUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(Ma Position)`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(androidUrl).catch(() => console.warn("Could not open maps."));
      }
    });
  };

  if (!latitude || !longitude) return null;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        showsUserLocation={false}
      >
        <Marker coordinate={{ latitude, longitude }}>
          <View style={styles.customMarker}>
            <Text style={styles.markerEmoji}>⚜️</Text>
          </View>
        </Marker>
      </MapView>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>📍 Position / Location</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SNIPPET_SIZE,
    height: SNIPPET_SIZE,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 16,
    color: "#000",
  },
  badge: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.gold.DEFAULT,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
