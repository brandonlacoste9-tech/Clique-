import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";
import { STICKER_PICKER_OPTIONS } from "../services/bitmojiService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Extended sticker categories with bilingual labels
const STICKER_CATEGORIES = [
  {
    id: "reactions",
    label: "Réactions / Reactions",
    icon: "😎",
    stickers: STICKER_PICKER_OPTIONS,
  },
  {
    id: "quebec",
    label: "Québécois / Quebec",
    icon: "⚜️",
    stickers: [
      { key: "tiguidou", emoji: "👌", label: "Tiguidou!" },
      { key: "tabarnac", emoji: "🤯", label: "Tabarnac!" },
      { key: "calisse", emoji: "😤", label: "Câlisse!" },
      { key: "poutine", emoji: "🍟", label: "Poutine" },
      { key: "depanneur", emoji: "🏪", label: "Dépanneur / Corner Store" },
      { key: "hockey", emoji: "🏒", label: "Hockey" },
      { key: "hiver", emoji: "❄️", label: "Hiver / Winter" },
      { key: "montreal", emoji: "🏙️", label: "Montréal" },
      { key: "fleurdelys", emoji: "⚜️", label: "Fleur-de-lys" },
      { key: "sirop", emoji: "🍁", label: "Sirop d'érable / Maple Syrup" },
    ],
  },
  {
    id: "elite",
    label: "L'Élite / Elite",
    icon: "👑",
    stickers: [
      { key: "crown", emoji: "👑", label: "Souverain / Sovereign" },
      { key: "gold", emoji: "🥇", label: "Or Impérial / Imperial Gold" },
      { key: "diamond", emoji: "💎", label: "Diamant / Diamond" },
      { key: "trophy", emoji: "🏆", label: "Victoire / Victory" },
      { key: "scepter", emoji: "🪄", label: "Sceptre / Scepter" },
      { key: "shield", emoji: "🛡️", label: "Bouclier / Shield" },
      { key: "sword", emoji: "⚔️", label: "Bataille / Battle" },
      { key: "castle", emoji: "🏰", label: "Empire" },
      { key: "lion", emoji: "🦁", label: "Lionheart" },
      { key: "eagle", emoji: "🦅", label: "Aigle / Eagle" },
    ],
  },
  {
    id: "vibes",
    label: "Vibes",
    icon: "✨",
    stickers: [
      { key: "sparkle", emoji: "✨", label: "Brillant / Sparkle" },
      { key: "rocket", emoji: "🚀", label: "Décollage / Liftoff" },
      { key: "heart_fire", emoji: "❤️‍🔥", label: "Feu / Fire" },
      { key: "skull", emoji: "💀", label: "Mort de rire / Dying" },
      { key: "eye_roll", emoji: "🙄", label: "Pfff" },
      { key: "clap", emoji: "👏", label: "Bravo" },
      { key: "pray", emoji: "🙏", label: "SVP / Please" },
      { key: "hundred", emoji: "💯", label: "Cent / Hundred" },
      { key: "nerd", emoji: "🤓", label: "Nerd" },
      { key: "cap", emoji: "🧢", label: "Cap" },
    ],
  },
];

export default function StickerPicker({ onStickerSelect, onClose, visible }) {
  const [activeCategory, setActiveCategory] = useState("reactions");
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 300)).current;
  const scaleAnims = useRef({});

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 300,
      useNativeDriver: true,
      damping: 15,
      stiffness: 120,
    }).start();
  }, [visible]);

  const getScaleAnim = (key) => {
    if (!scaleAnims.current[key]) {
      scaleAnims.current[key] = new Animated.Value(1);
    }
    return scaleAnims.current[key];
  };

  const handleStickerPress = (sticker) => {
    const anim = getScaleAnim(sticker.key);

    // Bounce animation
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.4,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 5,
        stiffness: 200,
      }),
    ]).start();

    // Imperial haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Send sticker
    if (onStickerSelect) {
      onStickerSelect(sticker);
    }
  };

  const handleCategoryPress = (categoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(categoryId);
  };

  if (!visible) return null;

  const currentCategory = STICKER_CATEGORIES.find(
    (c) => c.id === activeCategory
  );

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            {currentCategory?.label || "Stickers"}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryBarContent}
      >
        {STICKER_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryTab,
              activeCategory === cat.id && styles.categoryTabActive,
            ]}
            onPress={() => handleCategoryPress(cat.id)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sticker Grid */}
      <ScrollView
        style={styles.gridContainer}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {currentCategory?.stickers.map((sticker) => {
          const scale = getScaleAnim(sticker.key);

          return (
            <TouchableOpacity
              key={sticker.key}
              style={styles.stickerCell}
              onPress={() => handleStickerPress(sticker)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.stickerInner,
                  { transform: [{ scale }] },
                ]}
              >
                <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
              </Animated.View>
              <Text style={styles.stickerLabel} numberOfLines={1}>
                {sticker.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.leather.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 360,
    borderTopWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    ...shadows.gold,
    shadowOpacity: 0.15,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHighlight,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  categoryBar: {
    maxHeight: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceHighlight,
  },
  categoryBarContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: "center",
  },
  categoryTab: {
    width: 40,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  categoryTabActive: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  categoryIcon: {
    fontSize: 20,
  },
  gridContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  stickerCell: {
    width: (SCREEN_WIDTH - spacing.md * 2) / 5,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  stickerInner: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  stickerEmoji: {
    fontSize: 28,
  },
  stickerLabel: {
    color: colors.text.muted,
    fontSize: 8,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 60,
  },
});
