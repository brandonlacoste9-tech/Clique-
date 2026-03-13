// Offline Indicator Component
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, typography, spacing } from '../theme/chatsnapTheme';

export default function OfflineIndicator({ isConnected, onRetry }) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      // Show indicator after a short delay to avoid flickering
      const timeout = setTimeout(() => {
        setShowIndicator(true);
      }, 1000);
      
      return () => clearTimeout(timeout);
    } else {
      setShowIndicator(false);
    }
  }, [isConnected]);

  if (!showIndicator) return null;

  return (
    <View style={styles.container}>
      <View style={styles.indicator}>
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.text}>Pas de connexion</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function ConnectionStatus({ isConnected }) {
  return (
    <View style={styles.container}>
      <View style={[styles.status, isConnected ? styles.online : styles.offline]}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>
          {isConnected ? 'En ligne' : 'Hors ligne'}
        </Text>
      </View>
    </View>
  );
}

export function MessageQueueIndicator({ queuedCount, onSendAll }) {
  if (!queuedCount || queuedCount === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.queue}>
        <Text style={styles.queueText}>
          {queuedCount} message{queuedCount > 1 ? 's' : ''} en attente
        </Text>
        <TouchableOpacity style={styles.sendButton} onPress={onSendAll}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  indicator: {
    backgroundColor: colors.accent.red,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  retryButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  retryText: {
    color: colors.accent.red,
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  online: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  offline: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold.DEFAULT,
  },
  statusText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
  },
  queue: {
    backgroundColor: colors.gold.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  queueText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  sendButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  sendButtonText: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
  },
});
