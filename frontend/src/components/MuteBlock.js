// Mute/Block Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';

import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';
import { blockingAPI } from '../api/cliqueApi';

export default function MuteBlock({ 
  userId, 
  currentStatus, 
  onStatusChange 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMute = async () => {
    setIsProcessing(true);
    
    try {
      if (currentStatus === 'muted') {
        await blockingAPI.unmuteUser(userId);
        onStatusChange?.('accepted');
      } else {
        await blockingAPI.muteUser(userId);
        onStatusChange?.('muted');
      }
    } catch (err) {
      console.error('Failed to update mute status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlock = async () => {
    setIsProcessing(true);
    
    try {
      if (currentStatus === 'blocked') {
        await blockingAPI.unblockUser(userId);
        onStatusChange?.('none');
      } else {
        await blockingAPI.blockUser(userId);
        onStatusChange?.('blocked');
      }
    } catch (err) {
      console.error('Failed to update block status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Text style={styles.buttonText}>
          {currentStatus === 'muted' ? '🔊 Démuter' : 
           currentStatus === 'blocked' ? '🚫 Débloquer' : 
           currentStatus === 'none' ? '👤' : '👤'}
        </Text>
      </TouchableOpacity>

      {showMenu && (
        <View style={styles.menu}>
          {currentStatus !== 'muted' && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleMute}
            >
              <Text style={styles.menuItemText}>🔊 Muter</Text>
            </TouchableOpacity>
          )}
          {currentStatus === 'muted' && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleMute}
            >
              <Text style={styles.menuItemText}>🔊 Démuter</Text>
            </TouchableOpacity>
          )}
          {currentStatus !== 'blocked' && (
            <TouchableOpacity 
              style={[styles.menuItem, styles.blockItem]}
              onPress={handleBlock}
            >
              <Text style={styles.menuItemText}>🚫 Bloquer</Text>
            </TouchableOpacity>
          )}
          {currentStatus === 'blocked' && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleBlock}
            >
              <Text style={styles.menuItemText}>🚫 Débloquer</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export function MuteBlockList({ type, users, onAction }) {
  const [showModal, setShowModal] = useState(false);

  const title = type === 'muted' ? 'Utilisateurs mutés' : 'Utilisateurs bloqués';
  const emptyText = type === 'muted' 
    ? 'Aucun utilisateur muté' 
    : 'Aucun utilisateur bloqué';

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{users?.length || 0}</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <View style={styles.userInfo}>
                    <Text style={styles.username}>{item.displayName || item.username}</Text>
                    <Text style={styles.mutedAt}>
                      {type === 'muted' ? 'Muted' : 'Blocked'}: {new Date(item.mutedAt || item.blockedAt).toLocaleDateString('fr-CA')}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      onAction?.(item.id);
                      setShowModal(false);
                    }}
                  >
                    <Text style={styles.actionButtonText}>
                      {type === 'muted' ? '🔊 Démuter' : '🚫 Débloquer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>{emptyText}</Text>
                </View>
              }
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  button: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: colors.leather.black,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    zIndex: 100,
    minWidth: 150,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHighlight,
  },
  blockItem: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  menuItemText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  modalContainer: {
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
  modalTitle: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
  },
  closeButton: {
    color: colors.text.secondary,
    fontSize: 24,
  },
  list: {
    padding: spacing.md,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHighlight,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
  mutedAt: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: borderRadius.sm,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
  },
});
