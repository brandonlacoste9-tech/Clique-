import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Switch,
  Linking,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";

import { useAuthStore } from "../store/cliqueStore";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  cliquePhrases,
} from "../theme/cliqueTheme";
import { getAvatarUrl } from "../services/bitmojiService";
import StoryHighlightsRow from "../components/StoryHighlightsRow";
import { paymentsAPI } from "../api/cliqueApi";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const [ghostMode, setGhostMode] = useState(user?.ghostMode || false);
  const [showGodMode, setShowGodMode] = useState(false);
  const [godModeInfluence, setGodModeInfluence] = useState(user?.influenceScore?.toString() || "0");

  const toggleGhostMode = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGhostMode(!ghostMode);
    // Note: an API call to cliqueApi.settingsAPI.updatePrivacy should go here
  };

  const toggleGodMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowGodMode(!showGodMode);
  };

  const handleSubscribe = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { data } = await paymentsAPI.subscribe();
      if (data?.checkoutUrl) {
        Linking.openURL(data.checkoutUrl);
      }
    } catch (err) {
      console.error("Subscription error:", err);
      Alert.alert("Error", "Could not initiate subscription session. Please try again.");
    }
  };

  const handleUpgrade = async (itemId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { data } = await paymentsAPI.upgrade(itemId);
      if (data?.checkoutUrl) {
        Linking.openURL(data.checkoutUrl);
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      Alert.alert("Error", "Could not initiate upgrade session. Please try again.");
    }
  };

  const menuItems = [
    {
      icon: "👥",
      label: "Mes amis / My Friends",
      value: "24",
      onPress: () => navigation.navigate("AddFriends"),
    },
    { icon: "🔥", label: "Streaks actifs / Active Streaks", value: user?.streakCount?.toString() || "0" },
    { icon: "🏆", label: "Score Élite / Elite Score", value: user?.snapScore?.toString() || "0" },
    {
      icon: "🎨",
      label: "Personnaliser / Customize / Personalizar",
      onPress: () => navigation.navigate("ProfileCustomize"),
    },
    {
      icon: "⚙️",
      label: "Paramètres / Settings / Ajustes",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      icon: "🔒",
      label: "Confidentialité / Privacy / Privacidad",
      onPress: () => navigation.navigate("Settings"),
    },
    { icon: "❓", label: "Aide / Help / Ayuda" },
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
                  uri: getAvatarUrl(user) || "https://via.placeholder.com/150",
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editText}>✏️</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onLongPress={toggleGodMode}>
               <Text style={styles.name}>{user?.displayName || "MON NOM"}</Text>
            </TouchableOpacity>
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

      {/* Story Highlights */}
      <StoryHighlightsRow />

      <View style={styles.eliteStatusBanner}>
        <Text style={styles.eliteStatusTitle}>STATUT DE L'RUCHE / HIVE STATUS</Text>
        <Text style={styles.eliteStatusValue}>
          {user?.sovereignTier || "INITIÉ"}
          {(!user?.sovereignTier || user?.sovereignTier.includes("INITIÉ")) && " (GRATUIT / FREE)"}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.influenceScore?.toFixed(1) || "0.0"}</Text>
          <Text style={styles.statLabel}>INFLUENCE</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.snapScore || "0"}</Text>
          <Text style={styles.statLabel}>SCORE ÉLITE / ELITE</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.streakCount || "0"}</Text>
          <Text style={styles.statLabel}>SOUVERAINETÉ / SOVEREIGNTY</Text>
        </View>
      </View>

      {/* CLIQUE+ Premium Banner */}
      <TouchableOpacity 
        style={styles.premiumBanner}
        onPress={handleSubscribe}
      >
        <View style={styles.premiumIconContainer}>
          <Text style={styles.premiumIcon}>👑</Text>
        </View>
        <View style={styles.premiumInfo}>
          <Text style={styles.premiumTitle}>PASSER À CLIQUE+</Text>
          <Text style={styles.premiumSubtitle}>Plus de prestige pour seulement 4.99$/mois</Text>
        </View>
        <Text style={styles.premiumChevron}>›</Text>
      </TouchableOpacity>

      {/* God Mode Interface */}
      {showGodMode && (
        <View style={styles.godModePanel}>
          <Text style={styles.godModeTitle}>🛠️ ARCHITECT GOD MODE</Text>
          <View style={styles.godModeControls}>
            <TouchableOpacity 
              style={styles.godModeBtn} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                // In production, this would call adminAPI.grantSovereignty
                alert("Sovereignty Granted. 🔱");
              }}
            >
              <Text style={styles.godModeBtnText}>GRANT SOUVERAINETÉ 🔱</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.godModeBtn, { backgroundColor: colors.accent.red }]}
              onPress={() => setShowGodMode(false)}
            >
              <Text style={styles.godModeBtnText}>CLOSE ARCHITECT MODE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* THE BEEHIVE SHOP 🐝 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>THE BEEHIVE SHOP 🐝</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopScroll}>
        <TouchableOpacity 
          style={styles.shopItem}
          onPress={() => handleUpgrade("royal_jelly")}
        >
          <Text style={styles.shopItemEmoji}>🍯</Text>
          <Text style={styles.shopItemTitle}>Royal Jelly</Text>
          <Text style={styles.shopItemPrice}>49.99$</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shopItem}
          onPress={() => handleUpgrade("golden_sting")}
        >
          <Text style={styles.shopItemEmoji}>🗡️</Text>
          <Text style={styles.shopItemTitle}>Golden Sting</Text>
          <Text style={styles.shopItemPrice}>19.99$</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shopItem}
          onPress={() => handleUpgrade("hive_essence")}
        >
          <Text style={styles.shopItemEmoji}>✨</Text>
          <Text style={styles.shopItemTitle}>Hive Essence</Text>
          <Text style={styles.shopItemPrice}>9.99$</Text>
        </TouchableOpacity>
      </ScrollView>

      <View
        style={[styles.ghostModeBanner, ghostMode && styles.ghostModeActive]}
      >
        <View style={styles.ghostModeInfo}>
          <Text style={styles.ghostModeTitle}>👻 Mode Fantôme / Ghost Mode</Text>
          <Text style={styles.ghostModeDesc}>
            {ghostMode
              ? "Invisible sur la carte. / Invisible on the map."
              : "Visible pour tes amis. / Visible to friends."}
          </Text>
        </View>
        <Switch
          trackColor={{ false: colors.border, true: colors.gold.DEFAULT }}
          thumbColor={ghostMode ? colors.leather.black : colors.text.muted}
          onValueChange={toggleGhostMode}
          value={ghostMode}
        />
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={item.onPress ? 0.7 : 1}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Déconnexion / Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Clique 2026.1.0{"\n"}Bilingue. Sécurisé. Québécois. / Bilingual. Secure. Local.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.leather.black,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.gold.hive, // Hive Yellow Border
    ...shadows.premium,
  },
  premiumIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: colors.gold.hive,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  premiumIcon: {
    fontSize: 24,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    color: colors.gold.hive,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  premiumSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  premiumChevron: {
    color: colors.gold.hive,
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionHeader: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.gold.hive,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3,
  },
  shopScroll: {
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.md,
  },
  shopItem: {
    width: 120,
    height: 140,
    backgroundColor: colors.surface,
    borderColor: "rgba(252, 209, 22, 0.2)",
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.card,
  },
  shopItemEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  shopItemTitle: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  shopItemPrice: {
    color: colors.gold.hive,
    fontSize: 10,
    fontWeight: "900",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  eliteStatusBanner: {
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    alignItems: "center",
    ...shadows.premium,
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
    paddingVertical: 24,
    marginHorizontal: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginTop: spacing.lg,
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
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
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
  ghostModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  ghostModeActive: {
    borderColor: colors.gold.DEFAULT,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    ...shadows.gold,
  },
  ghostModeInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  ghostModeTitle: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ghostModeDesc: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  godModePanel: {
    backgroundColor: colors.leather.black,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent.red,
    ...shadows.premium,
  },
  godModeTitle: {
    color: "#FF3B30",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: "center",
  },
  godModeControls: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  godModeBtn: {
    backgroundColor: colors.gold.DEFAULT,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    flex: 0.48,
    alignItems: "center",
  },
  godModeBtnText: {
    color: colors.leather.black,
    fontSize: 10,
    fontWeight: "bold",
  },
});
