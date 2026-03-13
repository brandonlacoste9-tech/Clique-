// Story Scheduler Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, DateTimePicker } from 'react-native';

import { colors, typography, spacing, borderRadius } from '../theme/chatsnapTheme';
import { schedulingAPI } from '../api/chatsnapApi';

export default function StoryScheduler({ 
  storyData, 
  onSchedule, 
  onCancel 
}) {
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSchedule = async () => {
    setIsPublishing(true);
    
    try {
      const data = {
        ...storyData,
        scheduleAt: scheduleDate.toISOString()
      };
      
      const response = await schedulingAPI.scheduleStory(data);
      onSchedule?.(response.data.story);
    } catch (err) {
      console.error('Failed to schedule story:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishNow = async () => {
    setIsPublishing(true);
    
    try {
      const data = {
        ...storyData,
        scheduleAt: new Date().toISOString()
      };
      
      const response = await schedulingAPI.scheduleStory(data);
      onSchedule?.(response.data.story);
    } catch (err) {
      console.error('Failed to publish story:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity 
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Planifier la story</Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.datePickerContainer}>
              <Text style={styles.label}>Date et heure</Text>
              <TouchableOpacity 
                style={styles.datePicker}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.dateText}>
                  {scheduleDate.toLocaleDateString('fr-CA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={scheduleDate}
                mode="datetime"
                display="default"
                onChange={(event, date) => {
                  setShowPicker(false);
                  if (date) {
                    setScheduleDate(date);
                  }
                }}
              />
            )}

            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Aperçu</Text>
              <View style={styles.previewImage}>
                <Text style={styles.previewIcon}>📷</Text>
              </View>
              {storyData.caption && (
                <Text style={styles.caption}>{storyData.caption}</Text>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.publishButton]}
              onPress={handlePublishNow}
              disabled={isPublishing}
            >
              <Text style={styles.publishButtonText}>
                {isPublishing ? 'Publication...' : 'Publier maintenant'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.scheduleButton]}
              onPress={handleSchedule}
              disabled={isPublishing}
            >
              <Text style={styles.scheduleButtonText}>
                {isPublishing ? 'Planification...' : 'Planifier'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function DraftCard({ draft, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Brouillon</Text>
        <Text style={styles.cardDate}>
          {new Date(draft.createdAt).toLocaleDateString('fr-CA', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      {draft.caption && (
        <Text style={styles.caption} numberOfLines={2}>
          {draft.caption}
        </Text>
      )}
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onEdit}
        >
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    maxHeight: '80%',
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
  content: {
    padding: spacing.lg,
  },
  datePickerContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  datePicker: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  dateText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  preview: {
    backgroundColor: colors.leather.black,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  previewLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.sm,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  previewIcon: {
    fontSize: 32,
  },
  caption: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    lineHeight: 16,
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
  publishButton: {
    backgroundColor: colors.gold.DEFAULT,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: colors.gold.DEFAULT,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: colors.leather.black,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
  },
  cardDate: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
  },
  deleteButton: {
    backgroundColor: colors.accent.red,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
  },
});
