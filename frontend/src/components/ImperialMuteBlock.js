import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/cliqueTheme';

export default function ImperialMuteBlock({
  type = 'muted',
  users = [],
  onAction,
}) {
  const title = type === 'muted' ? 'Utilisateurs muets' : 'Utilisateurs bloqués';
  const actionLabel = type === 'muted' ? 'Démuter' : 'Débloquer';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Aucun utilisateur {type === 'muted' ? 'muet' : 'bloqué'}
          </Text>
        </View>
      ) : (
        <View style={styles userList}>
          {users.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitial}>
                    {user.name?.charAt(0) || '?'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userUsername}>{user.username}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onAction?.(user.id)}
              >
                <Text style={styles.actionText}>{actionLabel}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: '900',
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
  },
  userList: {
    gap: spacing.sm,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHighlight,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    color: colors.leather.black,
    fontSize: typography.sizes.base,
    fontWeight: '900',
  },
  userName: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: '600',
  },
  userUsername: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent.red,
    borderRadius: borderRadius.full,
  },
  actionText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
});
