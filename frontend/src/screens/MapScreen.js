import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import MapView, { Marker } from "../lib/maps";

import {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  cliquePhrases,
} from "../theme/cliqueTheme";

const { width, height } = Dimensions.get("window");

// Mock data - replace with real friend locations
const mockFriends = [
  {
    id: "1",
    lat: 45.5017,
    lng: -73.5673,
    name: "Alex",
    isOnline: true,
    username: "@alex_imperial",
    bio: "Loyauté avant tout. ⚜️",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "2",
    lat: 45.5088,
    lng: -73.554,
    name: "Sam",
    isOnline: false,
    username: "@sam_sovereign",
    bio: "Vivre pour l'instant. 🥂",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "3",
    lat: 45.495,
    lng: -73.58,
    name: "Jordan",
    isOnline: true,
    username: "@jordan_elite",
    bio: "Montreal Noir. 🏙️",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
];

export default function MapScreen() {
  const [selectedUser, setSelectedUser] = React.useState(null);

  const handleMarkerPress = (user) => {
    setSelectedUser(user);
  };

  return (
    <View style={styles.container}>
      {/* Header with LV gold trim */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>TERRITOIRE</Text>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationButtonText}>📍</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.5017,
          longitude: -73.5673,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={obsidianMapStyle}
      >
        {mockFriends.map((friend) => (
          <Marker
            key={friend.id}
            coordinate={{ latitude: friend.lat, longitude: friend.lng }}
            onPress={() => handleMarkerPress(friend)}
          >
            <View style={styles.pinContainer}>
              <View
                style={[
                  styles.avatarBorder,
                  friend.isOnline && styles.avatarOnline,
                ]}
              >
                <Image
                  source={{ uri: friend.avatar }}
                  style={styles.avatarImage}
                />
              </View>
              <View
                style={[
                  styles.pinTip,
                  friend.isOnline && { borderBottomColor: colors.accent.green },
                ]}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Suede Profile Card Overlay */}
      {selectedUser && (
        <View style={styles.cardOverlay}>
          <ImageBackground
            source={require("../../assets/suede_bg.png")}
            style={styles.cardSuede}
            imageStyle={{ borderRadius: borderRadius.xl }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: selectedUser.avatar }}
                  style={styles.cardAvatar}
                />
                <View>
                  <Text style={styles.cardName}>{selectedUser.name}</Text>
                  <Text style={styles.cardUsername}>
                    {selectedUser.username}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedUser(null)}
                >
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardBio}>{selectedUser.bio}</Text>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>REJOINDRE L'ÉLITE</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendOnline]} />
          <Text style={styles.legendText}>ACTIF</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendOffline]} />
          <Text style={styles.legendText}>HORS LIGNE</Text>
        </View>
      </View>
    </View>
  );
}

const obsidianMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#0d0d0d" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: colors.gold.DEFAULT }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: colors.gold.DEFAULT }, { weight: 0.5 }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#121212" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: colors.gold.DEFAULT }, { weight: 0.2 }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "900",
    color: colors.text.primary,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  locationButtonText: {
    fontSize: 18,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    padding: 2,
    backgroundColor: colors.leather.black,
    ...shadows.gold,
  },
  avatarOnline: {
    borderColor: colors.accent.green,
    shadowColor: colors.accent.green,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.gold.DEFAULT,
    transform: [{ rotate: "180deg" }],
    marginTop: -2,
  },
  cardOverlay: {
    position: "absolute",
    bottom: 120,
    left: spacing.lg,
    right: spacing.lg,
    ...shadows.gold,
  },
  cardSuede: {
    overflow: "hidden",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  cardContent: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
  },
  cardName: {
    fontSize: typography.sizes.lg,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  cardUsername: {
    fontSize: typography.sizes.sm,
    color: colors.gold.DEFAULT,
    letterSpacing: 1,
  },
  closeButton: {
    marginLeft: "auto",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: colors.text.primary,
    fontSize: 20,
    lineHeight: 20,
  },
  cardBio: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontStyle: "italic",
    opacity: 0.8,
  },
  actionButton: {
    backgroundColor: colors.gold.DEFAULT,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.sm,
    ...shadows.gold,
  },
  actionButtonText: {
    color: colors.leather.black,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 12,
  },
  legend: {
    position: "absolute",
    top: 120,
    left: spacing.lg,
    flexDirection: "column",
    gap: spacing.xs,
    backgroundColor: "rgba(13, 13, 13, 0.8)",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendOnline: {
    backgroundColor: colors.accent.green,
    shadowColor: colors.accent.green,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  legendOffline: {
    backgroundColor: colors.text.muted,
  },
  legendText: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
