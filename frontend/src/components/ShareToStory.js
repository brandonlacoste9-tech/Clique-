// Share to Story Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Share } from 'react-native';

import { colors, typography, spacing, borderRadius } from '../theme/chatsnapTheme';
import { uploadAPI } from '../api/chatsnapApi';

export default function ShareToStory({ mediaUri, onShare }) {
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleShare = async () => {
    try {
      // Try native share first
      await Share.share({
        message: 'Regarde cette story sur ChatSnap!',
        url: mediaUri,
        title: 'ChatSnap',
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleCreateStory = async () => {
    setIsUploading(true);
    
    try {
      // Get presigned URL
      const response = await uploadAPI.getPresignedUrl('image', 'jpg');
      const { presignedUrl, mediaKey } = response.data;
      
      // Upload media
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: mediaUri,
      });
      
      if (uploadResponse.ok) {
        onShare?.({ mediaKey });
        setShowModal(false);
      }
    } catch (err) {
      console.error('Failed to create story:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
        <Text style={styles.buttonText}>Partager</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.container}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Partager en story</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.preview}>
              <View style={styles.previewImage}>
                <Text style={styles.previewIcon}>📷</Text>
              </View>
              <Text style={styles.previewText}>Voulez-vous créer une story avec ce contenu?</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.shareButton]}
                onPress={handleShare}
              >
                <Text style={styles.shareButtonText}>Partager</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.storyButton]}
                onPress={handleCreateStory}
                disabled={isUploading}
              >
                <Text style={styles.storyButtonText}>
                  {isUploading ? 'Création...' : 'Créer une story'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export function QuickShareButton({ onShare }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onShare}>
      <Text style={styles.buttonText}>📤</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.leather.black,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHighlight,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
  },
  closeButton: {
    color: colors.text.secondary,
    fontSize: 24,
  },
  preview: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewIcon: {
    fontSize: 32,
  },
  previewText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceHighlight,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.leather.black,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: colors.gold.DEFAULT,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
  storyButton: {
    backgroundColor: colors.gold.DEFAULT,
  },
  storyButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
});
