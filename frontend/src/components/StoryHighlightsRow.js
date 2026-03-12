import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Image,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  getHighlights,
  createHighlight,
  deleteHighlight,
} from "../services/storyHighlightsService";
import { useLanguageStore } from "../services/languageService";
import { colors, spacing, borderRadius, shadows } from "../theme/cliqueTheme";

const EMOJI_OPTIONS = ["⚜️", "💫", "👑", "✨", "🔥", "💎", "🌙", "🌸", "❄️", "🎮", "📚", "✈️", "🎵", "🏆", "💪", "🌊"];
const COLOR_OPTIONS = ["#D4AF37", "#4A90D9", "#50C878", "#9B59B6", "#E8A0BF", "#7EC8E3", "#FF6B6B", "#FFD93D"];

/**
 * StoryHighlightsRow — Horizontal row of story highlight circles on profile.
 * Tap a highlight to view stories. "+" button to create new.
 */
export default function StoryHighlightsRow({ onViewHighlight }) {
  const { language } = useLanguageStore();
  const [highlights, setHighlights] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("⚜️");
  const [newColor, setNewColor] = useState("#D4AF37");
  const [viewedHighlight, setViewedHighlight] = useState(null);

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    const data = await getHighlights();
    setHighlights(data);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await createHighlight(newName.trim(), newEmoji, newColor);
    setShowCreate(false);
    setNewName("");
    setNewEmoji("⚜️");
    setNewColor("#D4AF37");
    loadHighlights();
  };

  const handleDelete = async (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteHighlight(id);
    setViewedHighlight(null);
    loadHighlights();
  };

  const getLabel = (nameObj) => {
    if (typeof nameObj === "string") return nameObj;
    return nameObj[language] || nameObj.fr || "Highlight";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Create New Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCreate(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.addCircle}>
            <Text style={styles.addIcon}>+</Text>
          </View>
          <Text style={styles.highlightLabel}>
            {language === "es" ? "Nuevo" : language === "en" ? "New" : "Nouveau"}
          </Text>
        </TouchableOpacity>

        {/* Highlight Circles */}
        {highlights.map((highlight) => (
          <TouchableOpacity
            key={highlight.id}
            style={styles.highlightItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewedHighlight(highlight);
            }}
            onLongPress={() => handleDelete(highlight.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.highlightCircle,
                { borderColor: highlight.color },
                highlight.stories?.length > 0 && styles.highlightCircleHasStories,
              ]}
            >
              {highlight.stories?.length > 0 && highlight.stories[0].mediaUri ? (
                <Image
                  source={{ uri: highlight.stories[0].mediaUri }}
                  style={styles.highlightImage}
                />
              ) : (
                <Text style={styles.highlightEmoji}>{highlight.emoji}</Text>
              )}
            </View>
            <Text style={styles.highlightLabel} numberOfLines={1}>
              {getLabel(highlight.name)}
            </Text>
            {highlight.stories?.length > 0 && (
              <View style={[styles.countBadge, { backgroundColor: highlight.color }]}>
                <Text style={styles.countText}>{highlight.stories.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create Highlight Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {language === "es"
                ? "NUEVO DESTACADO"
                : language === "en"
                ? "NEW HIGHLIGHT"
                : "NOUVEAU MOMENT FORT"}
            </Text>

            {/* Name Input */}
            <TextInput
              style={styles.nameInput}
              placeholder={
                language === "es" ? "Nombre..." : language === "en" ? "Name..." : "Nom..."
              }
              placeholderTextColor={colors.text.muted}
              value={newName}
              onChangeText={setNewName}
              maxLength={20}
            />

            {/* Emoji Picker */}
            <Text style={styles.pickerLabel}>EMOJI</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiOption,
                    newEmoji === e && styles.emojiOptionSelected,
                  ]}
                  onPress={() => setNewEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Picker */}
            <Text style={styles.pickerLabel}>
              {language === "es" ? "COLOR" : language === "en" ? "COLOR" : "COULEUR"}
            </Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    newColor === c && styles.colorOptionSelected,
                  ]}
                  onPress={() => setNewColor(c)}
                />
              ))}
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCreate(false)}
              >
                <Text style={styles.cancelBtnText}>
                  {language === "es" ? "Cancelar" : language === "en" ? "Cancel" : "Annuler"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, !newName.trim() && styles.createBtnDisabled]}
                onPress={handleCreate}
                disabled={!newName.trim()}
              >
                <Text style={styles.createBtnText}>
                  {language === "es" ? "Crear" : language === "en" ? "Create" : "Créer"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Highlight Stories Modal */}
      <Modal visible={!!viewedHighlight} transparent animationType="fade">
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerCard}>
            {/* Header */}
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerEmoji}>{viewedHighlight?.emoji}</Text>
              <Text style={styles.viewerTitle}>
                {viewedHighlight ? getLabel(viewedHighlight.name) : ""}
              </Text>
            </View>

            {/* Stories Grid */}
            {viewedHighlight?.stories?.length > 0 ? (
              <FlatList
                data={viewedHighlight.stories}
                numColumns={3}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.storiesGrid}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.storyThumb} activeOpacity={0.7}>
                    {item.mediaUri ? (
                      <Image
                        source={{ uri: item.mediaUri }}
                        style={styles.storyThumbImage}
                      />
                    ) : (
                      <View style={styles.storyThumbPlaceholder}>
                        <Text style={styles.storyThumbIcon}>📷</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyHighlight}>
                <Text style={styles.emptyEmoji}>📸</Text>
                <Text style={styles.emptyText}>
                  {language === "es"
                    ? "Sin historias aún.\nAñade desde la vista de historias."
                    : language === "en"
                    ? "No stories yet.\nAdd from story viewer."
                    : "Aucune histoire encore.\nAjoute depuis la vue stories."}
                </Text>
              </View>
            )}

            {/* Close */}
            <TouchableOpacity
              style={styles.viewerClose}
              onPress={() => setViewedHighlight(null)}
            >
              <Text style={styles.viewerCloseText}>
                {language === "es" ? "Cerrar" : language === "en" ? "Close" : "Fermer"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  // ─── Add Button ──────────────────
  addButton: {
    alignItems: "center",
    width: 64,
  },
  addCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  addIcon: {
    color: colors.text.muted,
    fontSize: 24,
    fontWeight: "300",
  },
  // ─── Highlight Item ──────────────
  highlightItem: {
    alignItems: "center",
    width: 64,
    position: "relative",
  },
  highlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  highlightCircleHasStories: {
    borderWidth: 3,
  },
  highlightImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  highlightEmoji: {
    fontSize: 24,
  },
  highlightLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  countBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  countText: {
    color: "#000",
    fontSize: 8,
    fontWeight: "bold",
  },
  // ─── Create Modal ────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.leather.dark,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  modalTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  nameInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    marginBottom: spacing.lg,
  },
  pickerLabel: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.lg,
  },
  emojiOption: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  emojiOptionSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
  },
  emojiText: {
    fontSize: 18,
  },
  colorGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.xl,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#FFF",
    transform: [{ scale: 1.15 }],
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    alignItems: "center",
  },
  cancelBtnText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  createBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gold.DEFAULT,
    alignItems: "center",
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    color: colors.leather.black,
    fontSize: 13,
    fontWeight: "bold",
  },
  // ─── Viewer Modal ────────────────
  viewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  viewerCard: {
    backgroundColor: colors.leather.dark,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 380,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  viewerEmoji: {
    fontSize: 28,
  },
  viewerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 16,
    fontWeight: "bold",
  },
  storiesGrid: {
    gap: 4,
  },
  storyThumb: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 2,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  storyThumbImage: {
    width: "100%",
    height: "100%",
  },
  storyThumbPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  storyThumbIcon: {
    fontSize: 20,
  },
  emptyHighlight: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  viewerClose: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    alignItems: "center",
  },
  viewerCloseText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
