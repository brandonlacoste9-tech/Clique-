import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/cliqueTheme';

export default function ImperialImagePreview({
  visible,
  onClose,
  imageUri,
  onSend,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <TouchableOpacity style={styles.container} activeOpacity={1}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <Text style={styles.actionText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={onSend}>
              <Text style={styles.sendText}>ENVOYER</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.leather.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: colors.gold.DEFAULT,
    fontSize: 28,
    fontWeight: '300',
  },
  image: {
    width: '100%',
    height: '80%',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  actionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  actionText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: '600',
  },
  sendButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: borderRadius.full,
    ...shadows.gold,
  },
  sendText: {
    color: colors.leather.black,
    fontSize: typography.sizes.base,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
