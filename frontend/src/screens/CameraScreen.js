import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

import { colors, spacing, borderRadius } from '../theme/cliqueTheme';
import { uploadAPI, storiesAPI } from '../api/cliqueApi';
import { useStoriesStore } from '../store/cliqueStore';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const addStory = useStoriesStore(state => state.addStory);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Clique a besoin de ta caméra</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false
      });
      
      await uploadStory(photo.uri, 'image');
    } catch (err) {
      console.error('Photo error:', err);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Start duration timer
    const interval = setInterval(() => {
      setRecordingDuration(d => {
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
        quality: '720p'
      });
      
      clearInterval(interval);
      await uploadStory(video.uri, 'video');
    } catch (err) {
      console.error('Video error:', err);
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
      const ext = type === 'image' ? 'jpg' : 'mp4';
      const contentType = type === 'image' ? 'image/jpeg' : 'video/mp4';
      
      const { data } = await uploadAPI.getPresignedUrl(contentType, ext);
      
      // Upload to S3/MinIO
      const response = await fetch(uri);
      const blob = await response.blob();
      
      await fetch(data.presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': contentType }
      });
      
      // Create story record
      const storyRes = await uploadAPI.createStory({
        mediaKey: data.key,
        mediaType: type,
        isPublic: false,
        allowReplies: true
      });
      
      addStory(storyRes.data.story);
      
    } catch (err) {
      console.error('Upload error:', err);
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
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={[
                styles.shutterInner,
                isRecording && styles.shutterInnerRecording
              ]]} />
            </Animated.View>
            
            {isRecording && (
              <Text style={styles.durationText}>{recordingDuration}s</Text>
            )}
          </TouchableOpacity>

          {/* Effects button */}
          <TouchableOpacity style={styles.effectsButton}>
            <View style={styles.effectsIcon} />
          </TouchableOpacity>
        </View>

        {/* Hint */}
        <Text style={styles.hint}>
          {isRecording ? 'Relâche pour arrêter' : 'Appuie pour photo, maintiens pour vidéo'}
        </Text>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  camera: {
    flex: 1
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  permissionText: {
    color: colors.text.primary,
    fontSize: 18,
    marginBottom: spacing.lg
  },
  permissionButton: {
    backgroundColor: colors.gold.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md
  },
  permissionButtonText: {
    color: colors.leather.black,
    fontWeight: 'bold'
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flashIcon: {
    width: 20,
    height: 20,
    backgroundColor: colors.text.primary
  },
  flipIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.primary
  },
  bottomControls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center'
  },
  galleryThumb: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: colors.surfaceHighlight
  },
  shutterContainer: {
    alignItems: 'center'
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shutterRecording: {
    borderColor: colors.accent.red
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gold.DEFAULT
  },
  shutterInnerRecording: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: colors.accent.red
  },
  durationText: {
    color: colors.accent.red,
    marginTop: spacing.sm,
    fontWeight: 'bold'
  },
  effectsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center'
  },
  effectsIcon: {
    width: 20,
    height: 20,
    backgroundColor: colors.gold.DEFAULT
  },
  hint: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 12
  }
});
