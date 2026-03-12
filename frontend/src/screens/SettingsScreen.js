import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from "react-native";
import { useAuthStore } from "../store/cliqueStore";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const [ghostMode, setGhostMode] = useState(false);
  const [allowScreenshots, setAllowScreenshots] = useState(false);
  const [storyVisibility, setStoryVisibility] = useState("friends");

  const handleLogout = () => {
    Alert.alert("Déconnexion / Logout", "Tu es sûr(e) de vouloir quitter l'Élite? / Are you sure you want to leave the Elite?", [
      { text: "Annuler / Cancel", style: "cancel" },
      {
        text: "Déconnexion / Logout",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte / Delete Account",
      "Cette action est irréversible. Toutes tes données seront supprimées conformément à la Loi 25. / This action is irreversible. Data will be deleted per Law 25.",
      [
        { text: "Annuler / Cancel", style: "cancel" },
        {
          text: "Supprimer / Delete",
          style: "destructive",
          onPress: () => {
            // TODO: API call to delete
            logout();
          },
        },
      ],
    );
  };

  const SettingRow = ({ icon, label, value, onPress, children }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !children}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {children}
      {onPress && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PARAMÈTRES / SETTINGS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFIL / PROFILE</Text>
          <SettingRow
            icon="👤"
            label="Nom d'affichage / Display Name"
            value={user?.displayName || "Non défini / Not set"}
            onPress={() => {}}
          />
          <SettingRow
            icon="📍"
            label="Emplacement / Location"
            value={user?.location || "Québec"}
            onPress={() => {}}
          />
          <SettingRow
            icon="📝"
            label="Bio"
            value={user?.bio ? "Modifier / Edit" : "Ajouter / Add"}
            onPress={() => {}}
          />
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIDENTIALITÉ / PRIVACY</Text>
          <SettingRow icon="👻" label="Mode Fantôme / Ghost Mode">
            <Switch
              value={ghostMode}
              onValueChange={setGhostMode}
              trackColor={{
                false: colors.surfaceHighlight,
                true: colors.gold.DEFAULT,
              }}
              thumbColor="#fff"
            />
          </SettingRow>
          <SettingRow icon="📸" label="Autoriser captures d'écran / Allow Screenshots">
            <Switch
              value={allowScreenshots}
              onValueChange={setAllowScreenshots}
              trackColor={{
                false: colors.surfaceHighlight,
                true: colors.gold.DEFAULT,
              }}
              thumbColor="#fff"
            />
          </SettingRow>
          <SettingRow
            icon="👁️"
            label="Visibilité des stories / Story Visibility"
            value={
              storyVisibility === "friends"
                ? "Amis / Friends"
                : storyVisibility === "public"
                  ? "Public"
                  : "Clique"
            }
            onPress={() => {
              const next =
                storyVisibility === "friends"
                  ? "public"
                  : storyVisibility === "public"
                    ? "clique"
                    : "friends";
              setStoryVisibility(next);
            }}
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <SettingRow
            icon="🔔"
            label="Activées / Enabled"
            value="Tout / All"
            onPress={() => {}}
          />
          <SettingRow
            icon="🔊"
            label="Son / Sound"
            value="Empire Chime"
            onPress={() => {}}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À PROPOS / ABOUT</Text>
          <SettingRow
            icon="📋"
            label="Conditions d'utilisation / Terms of Service"
            onPress={() => {}}
          />
          <SettingRow
            icon="🔒"
            label="Politique de confidentialité / Privacy Policy"
            onPress={() => {}}
          />
          <SettingRow icon="⚖️" label="Conformité Loi 25 / Law 25 Compliance" onPress={() => {}} />
          <SettingRow icon="❓" label="Aide et support / Help & Support" onPress={() => {}} />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Déconnexion / Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteText}>Supprimer mon compte / Delete My Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>
          Clique 2026.1.0{"\n"}Bilingue. Sécurisé. Québécois. / Bilingual. Secure. Local.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  headerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.base,
    fontWeight: "900",
    letterSpacing: 3,
  },
  backButton: {
    color: colors.gold.DEFAULT,
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
  content: {
    paddingBottom: spacing["2xl"],
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.xs,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceHighlight,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: spacing.md,
    width: 24,
    textAlign: "center",
  },
  settingLabel: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  settingValue: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    marginRight: spacing.sm,
  },
  chevron: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.lg,
    fontWeight: "bold",
  },
  logoutButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  logoutText: {
    color: colors.accent.orange,
    fontSize: typography.sizes.base,
    fontWeight: "600",
  },
  deleteButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent.red,
  },
  deleteText: {
    color: colors.accent.red,
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
