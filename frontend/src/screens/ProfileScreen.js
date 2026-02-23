import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';

import { useAuthStore } from '../store/cliqueStore';
import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: '👥', label: 'Mes amis', value: '24' },
    { icon: '🔥', label: 'Streaks actifs', value: '7' },
    { icon: '🏆', label: 'Score', value: user?.snapScore?.toString() || '0' },
    { icon: '⚙️', label: 'Paramètres' },
    { icon: '🔒', label: 'Confidentialité' },
    { icon: '❓', label: 'Aide' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>✏️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user?.displayName || 'Mon nom'}</Text>
        <Text style={styles.username}>@{user?.username || 'username'}</Text>

        {user?.bio && (
          <Text style={styles.bio}>{user.bio}</Text>
        )}

        <View style={styles.location}>
          <Text style={styles.locationText}>📍 {user?.location || 'Québec'}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.snapScore || 0}</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Amis</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Streaks</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.value && (
              <Text style={styles.menuValue}>{item.value}</Text>
            )}
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Clique 2026.1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.gold.DEFAULT
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background
  },
  editText: {
    fontSize: 16
  },
  name: {
    fontSize: typography.sizes['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary
  },
  username: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: spacing.xs
  },
  bio: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl
  },
  location: {
    marginTop: spacing.sm
  },
  locationText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg
  },
  stat: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.gold.DEFAULT
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surfaceHighlight
  },
  menu: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary
  },
  menuValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginRight: spacing.sm
  },
  chevron: {
    fontSize: typography.sizes.lg,
    color: colors.text.muted
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center'
  },
  logoutText: {
    color: colors.accent.red,
    fontSize: typography.sizes.base,
    fontWeight: '500'
  },
  version: {
    textAlign: 'center',
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xl,
    marginBottom: spacing['2xl']
  }
});
