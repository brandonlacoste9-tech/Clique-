import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";

import { useAuthStore } from "../store/cliqueStore";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";
import ThemeToggle from "../components/ThemeToggle";
import ProfileStats from "../components/ProfileStats";
import MuteBlockList from "../components/MuteBlock";
import { userAPI } from "../api/cliqueApi";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await userAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const menuItems = [
    { icon: "👥", label: "Mes amis", value: "24" },
    { icon: "🔥", label: "Streaks actifs", value: "7" },
    { icon: "🏆", label: "Score", value: user?.snapScore?.toString() || "0" },
    { icon: "⚙️", label: "Paramètres" },
    { icon: "🔒", label: "Confidentialité" },
    { icon: "❓", label: "Aide" },
  ];

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={require("../../assets/suede_bg.png")}
        style={styles.headerBackground}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user?.avatarUrl || "https://via.placeholder.com/150",
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editText}>✏️</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>{user?.displayName || "MON NOM"}</Text>
            <Text style={styles.username}>@{user?.username || "username"}</Text>

            {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

            <View style={styles.location}>
              <Text style={styles.locationText}>
                📍 {user?.location || "Québec"}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.eliteStatusBanner}>
        <Text style={styles.eliteStatusTitle}>STATUT DE L'ÉLITE</Text>
        <Text style={styles.eliteStatusValue}>SOUVERAIN D'OR</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.influence || "9.8"}</Text>
          <Text style={styles.statLabel}>INFLUENCE</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.snapScore || "124k"}</Text>
          <Text style={styles.statLabel}>SCORE ÉLITE</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.streaks || "7"}</Text>
          <Text style={styles.statLabel}>SOUVERAINETÉ</Text>
        </View>
      </View>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Profile Stats */}
      {stats && <ProfileStats stats={stats} />}

      {/* Mute/Block Lists */}
      <MuteBlockList type="muted" users={[]} onAction={(id) => console.log('Unmute', id)} />
      <MuteBlockList type="blocked" users={[]} onAction={(id) => console.log('Unblock', id)} />

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
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
    backgroundColor: colors.background,
  },
  eliteStatusBanner: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    alignItems: "center",
    ...shadows.gold,
  },
  eliteStatusTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  eliteStatusValue: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: "bold",
    marginTop: 4,
    letterSpacing: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    ...shadows.gold, // Imperial Glow
  },
  editButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.leather.black,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  editText: {
    fontSize: 16,
  },
  name: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "bold",
    color: colors.text.primary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  username: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  location: {
    marginTop: spacing.sm,
  },
  locationText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "bold",
    color: colors.gold.DEFAULT,
    ...shadows.gold,
    shadowRadius: 5,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surfaceHighlight,
  },
  menu: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  menuValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  chevron: {
    fontSize: typography.sizes.lg,
    color: colors.gold.DEFAULT,
    fontWeight: "bold",
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  logoutText: {
    color: colors.accent.red,
    fontSize: typography.sizes.base,
    fontWeight: "500",
  },
  version: {
    textAlign: "center",
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xl,
    marginBottom: spacing["2xl"],
  },
});
