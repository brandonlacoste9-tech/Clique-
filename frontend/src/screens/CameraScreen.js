import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Video } from "expo-av";
import * as MediaLibrary from "expo-media-library";

import { colors, spacing, borderRadius } from "../theme/cliqueTheme";
import { uploadAPI, storiesAPI } from "../api/cliqueApi";
import { useStoriesStore } from "../store/cliqueStore";

const { width, height } = Dimensions.get("window");

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scannerAnim = useRef(new Animated.Value(0)).current; // YOLO scanner

  const [showLenses, setShowLenses] = useState(false);
  const [selectedLens, setSelectedLens] = useState(null);
  const [lenses, setLenses] = useState([
    { id: "elite-gold", name: "L'Élite", icon: "👑" },
    { id: "suede-warmth", name: "Suede Warmth", icon: "🤎" },
    { id: "yolo-scan", name: "Vue YOLO", icon: "👁️" },
    { id: "montreal-noir", name: "MTL Noir", icon: "🏙️" },
  ]);

  const [previewUri, setPreviewUri] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const addStory = useStoriesStore((state) => state.addStory);

  useEffect(() => {
    // Shutter pulse
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    // YOLO Scanner sweeps up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scannerAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Clique a besoin de ta caméra / Clique needs your camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Autoriser / Allow</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      setPreviewUri(photo.uri);
      setPreviewType("image");
    } catch (err) {
      console.error("Photo error:", err);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    setRecordingDuration(0);

    // Start duration timer
    const interval = setInterval(() => {
      setRecordingDuration((d) => {
        if (d >= 15) {
          clearInterval(interval);
          stopRecording();
          return 15;
        }
        return d + 1;
      });
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 15,
        quality: "720p",
      });

      clearInterval(interval);
      setPreviewUri(video.uri);
      setPreviewType("video");
    } catch (err) {
      console.error("Video error:", err);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const uploadStory = async (uri, type) => {
    try {
      // Get presigned URL
      const ext = type === "image" ? "jpg" : "mp4";
      const contentType = type === "image" ? "image/jpeg" : "video/mp4";

      const { data } = await uploadAPI.getPresignedUrl(contentType, ext);

      // Upload to S3/MinIO
      const response = await fetch(uri);
      const blob = await response.blob();

      await fetch(data.presignedUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": contentType },
      });

      // Create story record
      const storyRes = await uploadAPI.createStory({
        mediaKey: data.key,
        mediaType: type,
        isPublic: false,
        allowReplies: true,
      });

      addStory(storyRes.data.story);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="picture"
      >
        {/* Top controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.flashIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.flipIcon} />
          </TouchableOpacity>
        </View>

        {/* YOLO Scanner Overlay */}
        {selectedLens?.id === "yolo-scan" && !previewUri && (
          <View style={styles.yoloContainer}>
            <View style={styles.yoloCornerTopLeft} />
            <View style={styles.yoloCornerTopRight} />
            <View style={styles.yoloCornerBottomLeft} />
            <View style={styles.yoloCornerBottomRight} />
            <Animated.View
              style={[
                styles.yoloScannerLine,
                {
                  transform: [
                    {
                      translateY: scannerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, height - 300],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={styles.yoloText}>ANALYSE YOLOv8n EN COURS... / SCANNING...</Text>
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          {/* Gallery button */}
          <TouchableOpacity style={styles.galleryButton}>
            <View style={styles.galleryThumb} />
          </TouchableOpacity>

          {/* Shutter button */}
          <TouchableOpacity
            style={styles.shutterContainer}
            onPress={takePicture}
            onLongPress={startRecording}
            onPressOut={isRecording ? stopRecording : null}
            delayLongPress={200}
          >
            <Animated.View
              style={[
                styles.shutterButton,
                isRecording && styles.shutterRecording,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View
                style={[
                  styles.shutterInner,
                  isRecording && styles.shutterInnerRecording,
                ]}
              />
            </Animated.View>

            {isRecording && (
              <Text style={styles.durationText}>{recordingDuration}s</Text>
            )}
          </TouchableOpacity>

          {/* Effects button */}
          <TouchableOpacity
            style={[
              styles.effectsButton,
              showLenses && styles.effectsButtonActive,
            ]}
            onPress={() => setShowLenses(!showLenses)}
          >
            <Text style={styles.effectsIconText}>✨</Text>
          </TouchableOpacity>
        </View>

        {/* Lens Carousel */}
        {showLenses && (
          <View style={styles.lensCarouselContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.lensList}
            >
              {lenses.map((lens) => (
                <TouchableOpacity
                  key={lens.id}
                  style={[
                    styles.lensItem,
                    selectedLens?.id === lens.id && styles.lensItemActive,
                  ]}
                  onPress={() => setSelectedLens(lens)}
                >
                  <Text style={styles.lensEmoji}>{lens.icon}</Text>
                  <Text style={styles.lensName}>{lens.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Hint */}
        <Text style={styles.hint}>
          {isRecording
            ? "Relâche pour arrêter / Release to stop"
            : "Appuie pour photo, maintiens pour vidéo / Tap for photo, hold for video"}
        </Text>

        {previewUri && (
          <View style={styles.previewContainer}>
            {previewType === "image" ? (
              <Image source={{ uri: previewUri }} style={styles.previewMedia} />
            ) : (
              <Video
                source={{ uri: previewUri }}
                style={styles.previewMedia}
                resizeMode="cover"
                shouldPlay
                isLooping
              />
            )}

            {/* Imperial Gold Lens Overlay Simulation */}
            {selectedLens?.id === "elite-gold" && (
              <View style={styles.imperialOverlay} />
            )}

            <View style={styles.previewControls}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPreviewUri(null)}
              >
                <Text style={styles.cancelText}>Annuler / Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  uploadStory(previewUri, previewType);
                  setPreviewUri(null);
                }}
              >
                <Text style={styles.sendButtonText}>ENVOYER À L’ÉLITE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  permissionText: {
    color: colors.text.primary,
    fontSize: 18,
    marginBottom: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.gold.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  permissionButtonText: {
    color: colors.leather.black,
    fontWeight: "bold",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  flashIcon: {
    width: 20,
    height: 20,
    backgroundColor: colors.text.primary,
  },
  flipIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.primary,
  },
  bottomControls: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryThumb: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: colors.surfaceHighlight,
  },
  shutterContainer: {
    alignItems: "center",
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.gold,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
  },
  shutterRecording: {
    borderColor: colors.accent.red,
    shadowColor: colors.accent.red,
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(212, 175, 55, 0.3)",
  },
  shutterInnerRecording: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: colors.accent.red,
  },
  durationText: {
    color: colors.accent.red,
    marginTop: spacing.sm,
    fontWeight: "bold",
  },
  effectsButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
  },
  effectsButtonActive: {
    backgroundColor: colors.gold.DEFAULT,
  },
  effectsIconText: {
    fontSize: 24,
  },
  lensCarouselContainer: {
    position: "absolute",
    bottom: 200,
    width: "100%",
    height: 100,
  },
  lensList: {
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
  lensItem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  lensItemActive: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 3,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
  },
  lensEmoji: {
    fontSize: 28,
  },
  lensName: {
    color: colors.text.primary,
    fontSize: 10,
    marginTop: 2,
    fontWeight: "bold",
  },
  effectsIcon: {
    width: 20,
    height: 20,
    backgroundColor: colors.gold.DEFAULT,
  },
  previewContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  previewMedia: {
    flex: 1,
  },
  previewControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  cancelButton: {
    padding: spacing.md,
  },
  cancelText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  sendButton: {
    backgroundColor: colors.gold.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.gold,
  },
  sendButtonText: {
    color: colors.leather.black,
    fontWeight: "bold",
    letterSpacing: 2,
    fontSize: typography.sizes.sm,
  },
  imperialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(212, 175, 55, 0.15)", // Subtle gold warm
  },
  yoloContainer: {
    ...StyleSheet.absoluteFillObject,
    top: 100,
    bottom: 200,
    marginHorizontal: spacing.xl,
    padding: spacing.md,
    justifyContent: "center",
  },
  yoloCornerTopLeft: {
    position: "absolute",
    top: 50,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.accent.green,
  },
  yoloCornerTopRight: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.accent.green,
  },
  yoloCornerBottomLeft: {
    position: "absolute",
    bottom: 50,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.accent.green,
  },
  yoloCornerBottomRight: {
    position: "absolute",
    bottom: 50,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.accent.green,
  },
  yoloScannerLine: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent.green,
    shadowColor: colors.accent.green,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  yoloText: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    color: colors.accent.green,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
