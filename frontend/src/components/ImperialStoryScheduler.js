import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

const timeSlots = [
  { label: 'Maintenant', value: 'now' },
  { label: 'Dans 15 min', value: '15min' },
  { label: 'Dans 1 heure', value: '1h' },
  { label: 'Dans 4 heures', value: '4h' },
  { label: 'Demain 9h', value: 'tomorrow9' },
  { label: 'Demain 12h', value: 'tomorrow12' },
  { label: 'Demain 18h', value: 'tomorrow18' },
];

export default function ImperialStoryScheduler({
  visible,
  onClose,
  onSchedule,
}) {
  const handleSchedule = (slot) => {
    onSchedule?.(slot);
    onClose?.();
  };

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
            <Text style={styles.title}>Programmer la story</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={timeSlots}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.slotItem}
                onPress={() => handleSchedule(item.value)}
              >
                <Text style={styles.slotLabel}>{item.label}</Text>
                <Text style={styles.slotIcon}>📅</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.slotList}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.leather.black,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold.DEFAULT,
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
  slotList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  slotLabel: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
  slotIcon: {
    fontSize: 18,
  },
});
