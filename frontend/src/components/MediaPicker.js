import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Video } from "expo-av";
import * as Haptics from "expo-haptics";
import LocationMessage from "./LocationMessage";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * MediaPicker — Inline media attachment component for chat.
 * Supports photo/video from camera or gallery.
 * Shows preview before sending. Bilingual labels.
 */
export default function MediaPicker({ onMediaSelect, onCancel, visible }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 400)).current;
  const previewScale = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 400,
      useNativeDriver: true,
      damping: 18,
      stiffness: 100,
    }).start();
  }, [visible]);

  React.useEffect(() => {
    if (selectedMedia) {
      Animated.spring(previewScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 150,
      }).start();
    } else {
      previewScale.setValue(0.8);
    }
  }, [selectedMedia]);

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.log("Gallery permission not granted");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedMedia({
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          width: asset.width,
          height: asset.height,
          duration: asset.duration || 0,
          fileName: asset.fileName || `media_${Date.now()}`,
        });
      }
    } catch (err) {
      console.error("Gallery pick error:", err);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        console.log("Camera permission not granted");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setSelectedMedia({
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          width: asset.width,
          height: asset.height,
          duration: asset.duration || 0,
          fileName: asset.fileName || `capture_${Date.now()}`,
        });
      }
    } catch (err) {
      console.error("Camera capture error:", err);
    }
  };

  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission not granted");
        return;
      }

      setUploading(true);
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      setSelectedMedia({
        type: "location",
        uri: "location_map", // Placeholder since we don't have a real uri
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setUploading(false);
    } catch (err) {
      console.error("Location error:", err);
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedMedia || !onMediaSelect) return;

    setUploading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulate a brief upload delay for UX
    await new Promise((r) => setTimeout(r, 400));

    onMediaSelect(selectedMedia);
    setSelectedMedia(null);
    setUploading(false);
  };

  const handleCancel = () => {
    setSelectedMedia(null);
    if (onCancel) onCancel();
  };

  if (!visible) return null;

  // Preview mode — show selected media before sending
  if (selectedMedia) {
    return (
      <Animated.View
        style={[
          styles.previewContainer,
          { transform: [{ scale: previewScale }] },
        ]}
      >
        {/* Media Preview */}
        <View style={styles.previewMediaWrapper}>
          {selectedMedia.type === "location" ? (
            <LocationMessage
              latitude={selectedMedia.latitude}
              longitude={selectedMedia.longitude}
              isMe={true}
            />
          ) : selectedMedia.type === "video" ? (
            <Video
              source={{ uri: selectedMedia.uri }}
              style={styles.previewMedia}
              resizeMode="contain"
              shouldPlay
              isLooping
              isMuted={false}
            />
          ) : (
            <Image
              source={{ uri: selectedMedia.uri }}
              style={styles.previewMedia}
              resizeMode="contain"
            />
          )}

          {/* Media type badge */}
          <View style={styles.mediaTypeBadge}>
            <Text style={styles.mediaTypeBadgeText}>
              {selectedMedia.type === "location"
                ? "📍 Position"
                : selectedMedia.type === "video"
                ? "🎥 Vidéo"
                : "📷 Photo"}
            </Text>
            {selectedMedia.duration > 0 && (
              <Text style={styles.durationBadgeText}>
                {Math.round(selectedMedia.duration / 1000)}s
              </Text>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.previewActions}>
          <TouchableOpacity
            onPress={() => setSelectedMedia(null)}
            style={styles.retakeBtn}
          >
            <Text style={styles.retakeBtnText}>
              ✕  Annuler / Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendMediaBtn}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.leather.black} size="small" />
            ) : (
              <Text style={styles.sendMediaBtnText}>
                Envoyer / Send  ▸
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // Picker mode — choose source
  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Handle */}
      <View style={styles.handle} />

      {/* Title */}
      <Text style={styles.title}>
        PARTAGER / SHARE
      </Text>

      {/* Source options */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={takePhoto}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>📷</Text>
          </View>
          <Text style={styles.optionLabel}>Caméra</Text>
          <Text style={styles.optionSublabel}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={pickFromGallery}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>🖼️</Text>
          </View>
          <Text style={styles.optionLabel}>Galerie</Text>
          <Text style={styles.optionSublabel}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={shareLocation}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>📍</Text>
          </View>
          <Text style={styles.optionLabel}>Position</Text>
          <Text style={styles.optionSublabel}>Location</Text>
        </TouchableOpacity>
      </View>

      {/* Cancel */}
      <TouchableOpacity onPress={handleCancel} style={styles.cancelRow}>
        <Text style={styles.cancelText}>
          Fermer / Close
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.leather.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing["2xl"],
    borderTopWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    ...shadows.gold,
    shadowOpacity: 0.15,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHighlight,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  optionCard: {
    alignItems: "center",
    width: (SCREEN_WIDTH - spacing.lg * 4) / 3,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  optionIconDisabled: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: "transparent",
  },
  optionIcon: {
    fontSize: 26,
  },
  optionLabel: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  optionSublabel: {
    color: colors.text.muted,
    fontSize: 9,
    marginTop: 2,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  comingSoonText: {
    color: colors.leather.black,
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  cancelRow: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  cancelText: {
    color: colors.text.secondary,
    fontSize: 12,
  },

  // ─── Preview Styles ──────────────────
  previewContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  previewMediaWrapper: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: SCREEN_WIDTH - spacing.lg * 2,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  previewMedia: {
    width: "100%",
    height: "100%",
  },
  mediaTypeBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: spacing.sm,
  },
  mediaTypeBadgeText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: "bold",
  },
  durationBadgeText: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "bold",
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    alignItems: "center",
  },
  retakeBtnText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  sendMediaBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gold.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.gold,
    shadowOpacity: 0.4,
  },
  sendMediaBtnText: {
    color: colors.leather.black,
    fontSize: 13,
    fontWeight: "bold",
  },
});
