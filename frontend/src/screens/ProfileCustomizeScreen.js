import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useLanguageStore,
  LANGUAGE_OPTIONS,
  STATUS_PRESETS,
  THEME_PRESETS,
} from "../services/languageService";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../theme/cliqueTheme";

const STATUS_STORAGE_KEY = "clique_user_status";
const THEME_STORAGE_KEY = "clique_user_theme";

/**
 * ProfileCustomizeScreen — Status + Theme + Language all-in-one.
 */
export default function ProfileCustomizeScreen({ navigation }) {
  const { language, setLanguage, t } = useLanguageStore();
  const [currentStatus, setCurrentStatus] = useState("available");
  const [customStatusText, setCustomStatusText] = useState("");
  const [currentTheme, setCurrentTheme] = useState("imperial_gold");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadSettings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSettings = async () => {
    try {
      const status = await AsyncStorage.getItem(STATUS_STORAGE_KEY);
      const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (status) {
        const parsed = JSON.parse(status);
        setCurrentStatus(parsed.key || "available");
        setCustomStatusText(parsed.customText || "");
      }
      if (theme) setCurrentTheme(theme);
    } catch (err) {
      console.warn("[Customize] Load error:", err);
    }
  };

  const selectStatus = async (statusKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStatus(statusKey);
    setShowCustomInput(false);
    await AsyncStorage.setItem(
      STATUS_STORAGE_KEY,
      JSON.stringify({ key: statusKey, customText: "" })
    );
  };

  const saveCustomStatus = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrentStatus("custom");
    await AsyncStorage.setItem(
      STATUS_STORAGE_KEY,
      JSON.stringify({ key: "custom", customText: customStatusText })
    );
    setShowCustomInput(false);
  };

  const selectTheme = async (themeKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCurrentTheme(themeKey);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, themeKey);
  };

  const selectLanguage = (langKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLanguage(langKey);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("profile.customize").toUpperCase()}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ═══ LANGUAGE SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🌍  {t("profile.language").toUpperCase()}
          </Text>
          <View style={styles.languageRow}>
            {LANGUAGE_OPTIONS.map((option) => {
              const isSelected = language === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.languageCard,
                    isSelected && styles.languageCardSelected,
                  ]}
                  onPress={() => selectLanguage(option.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageFlag}>{option.flag}</Text>
                  <Text
                    style={[
                      styles.languageLabel,
                      isSelected && styles.languageLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.languageSublabel}>{option.sublabel}</Text>
                  {isSelected && <Text style={styles.selectedCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ═══ STATUS SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💬  {t("profile.status").toUpperCase()}
          </Text>
          <View style={styles.statusGrid}>
            {STATUS_PRESETS.map((preset) => {
              const isSelected = currentStatus === preset.key;
              return (
                <TouchableOpacity
                  key={preset.key}
                  style={[
                    styles.statusChip,
                    isSelected && styles.statusChipSelected,
                  ]}
                  onPress={() => selectStatus(preset.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.statusEmoji}>{preset.emoji}</Text>
                  <Text
                    style={[
                      styles.statusLabel,
                      isSelected && styles.statusLabelSelected,
                    ]}
                  >
                    {t(preset.translationKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom Status */}
            <TouchableOpacity
              style={[
                styles.statusChip,
                styles.statusChipCustom,
                currentStatus === "custom" && styles.statusChipSelected,
              ]}
              onPress={() => setShowCustomInput(!showCustomInput)}
              activeOpacity={0.7}
            >
              <Text style={styles.statusEmoji}>✏️</Text>
              <Text style={styles.statusLabel}>
                {t("profile.customStatus")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom Status Input */}
          {showCustomInput && (
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                placeholder={t("profile.editStatus")}
                placeholderTextColor={colors.text.muted}
                value={customStatusText}
                onChangeText={setCustomStatusText}
                maxLength={50}
              />
              <TouchableOpacity
                onPress={saveCustomStatus}
                style={styles.saveStatusBtn}
              >
                <Text style={styles.saveStatusBtnText}>{t("common.save")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ═══ THEME SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎨  {t("profile.theme").toUpperCase()}
          </Text>
          <View style={styles.themeGrid}>
            {THEME_PRESETS.map((theme) => {
              const isSelected = currentTheme === theme.key;
              const themeLabel =
                typeof theme.label === "string"
                  ? theme.label
                  : theme.label[language] || theme.label.fr;
              return (
                <TouchableOpacity
                  key={theme.key}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardSelected,
                  ]}
                  onPress={() => selectTheme(theme.key)}
                  activeOpacity={0.7}
                >
                  {/* Color Preview */}
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: theme.bg },
                    ]}
                  >
                    <View
                      style={[
                        styles.themeAccentDot,
                        { backgroundColor: theme.accent },
                      ]}
                    />
                    <Text style={styles.themePreviewEmoji}>
                      {theme.preview}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.themeLabel,
                      isSelected && { color: theme.accent },
                    ]}
                  >
                    {themeLabel}
                  </Text>
                  {isSelected && (
                    <View
                      style={[
                        styles.themeSelectedBadge,
                        { backgroundColor: theme.accent },
                      ]}
                    >
                      <Text style={styles.themeSelectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </Animated.View>
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
    paddingTop: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  backButton: {
    color: colors.gold.DEFAULT,
    fontSize: 30,
    fontWeight: "200",
  },
  headerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
  },

  // ─── Sections ────────────────────
  section: {
    marginTop: spacing["2xl"],
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },

  // ─── Language ────────────────────
  languageRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  languageCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  languageCardSelected: {
    borderColor: colors.gold.DEFAULT,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  languageFlag: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  languageLabel: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  languageLabelSelected: {
    color: colors.gold.DEFAULT,
  },
  languageSublabel: {
    color: colors.text.muted,
    fontSize: 8,
    marginTop: 2,
    textAlign: "center",
  },
  selectedCheck: {
    color: colors.gold.DEFAULT,
    fontSize: 16,
    fontWeight: "bold",
    position: "absolute",
    top: 8,
    right: 8,
  },

  // ─── Status ──────────────────────
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    gap: 6,
  },
  statusChipSelected: {
    borderColor: colors.gold.DEFAULT,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  statusChipCustom: {
    borderStyle: "dashed",
  },
  statusEmoji: {
    fontSize: 14,
  },
  statusLabel: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  statusLabelSelected: {
    color: colors.gold.DEFAULT,
  },
  customInputRow: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  customInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  saveStatusBtn: {
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
  },
  saveStatusBtnText: {
    color: colors.leather.black,
    fontSize: 12,
    fontWeight: "bold",
  },

  // ─── Themes ──────────────────────
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  themeCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  themeCardSelected: {
    borderWidth: 2,
  },
  themePreview: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  themeAccentDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  themePreviewEmoji: {
    fontSize: 28,
  },
  themeLabel: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  themeSelectedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  themeSelectedText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
});
