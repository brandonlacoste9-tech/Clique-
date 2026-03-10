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

export default function ImperialShareToStory({
  visible,
  onClose,
  imageUri,
  onShare,
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
          <View style={styles.header}>
            <Text style={styles.title}>Partager à L'Élite</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Ajouter une légende</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={onShare}>
              <Text style={styles.sendText}>ENVOYER À L'ÉLITE</Text>
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
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: '900',
    letterSpacing: 2,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: colors.gold.DEFAULT,
    fontSize: 20,
    fontWeight: '300',
  },
  image: {
    width: '100%',
    height: '70%',
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
