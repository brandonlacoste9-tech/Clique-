// Story Duration Display Component
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, typography, spacing } from '../theme/chatsnapTheme';

export default function StoryDuration({ 
  createdAt, 
  expiresAt,
  showCountdown = true 
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [totalDuration, setTotalDuration] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      if (!expiresAt) return;

      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expiré');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (createdAt && expiresAt) {
      const start = new Date(createdAt);
      const end = new Date(expiresAt);
      const duration = end - start;
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      setTotalDuration(`${hours}h ${minutes}m`);
    }
  }, [createdAt, expiresAt]);

  if (!showCountdown) {
    return (
      <View style={styles.container}>
        <Text style={styles.durationText}>
          {totalDuration || '24h'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{timeLeft}</Text>
      </View>
      <Text style={styles.expiresText}>
        Expires in {timeLeft}
      </Text>
    </View>
  );
}

export function StoryExpiryBadge({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      if (!expiresAt) return;

      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expiré');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft || timeLeft === 'Expiré') return null;

  return (
    <View style={styles.expiryBadge}>
      <Text style={styles.expiryText}>⏰ {timeLeft}</Text>
    </View>
  );
}

export function StoryRemainingTime({ duration = 15, elapsed }) {
  const remaining = Math.max(0, duration - elapsed);
  
  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{remaining}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  durationBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
  },
  expiresText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  expiryBadge: {
    backgroundColor: colors.gold.DEFAULT,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  expiryText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
  },
});
