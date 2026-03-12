/**
 * storyHighlightsService.js — Save & Organize Story Highlights for Clique
 *
 * Users can save stories to named highlight collections on their profile.
 * Like Instagram Highlights: circular icons that persist after 24h expiry.
 *
 * Trilingual labels throughout.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGHLIGHTS_KEY = "clique_story_highlights";

// ─── Default Highlight Categories ───────────────────────────
export const DEFAULT_HIGHLIGHTS = [
  {
    id: "memories",
    name: { fr: "Souvenirs", en: "Memories", es: "Recuerdos" },
    emoji: "💫",
    color: "#D4AF37",
  },
  {
    id: "squad",
    name: { fr: "La Clique", en: "The Squad", es: "La Pandilla" },
    emoji: "👑",
    color: "#9B59B6",
  },
  {
    id: "vibes",
    name: { fr: "Vibes", en: "Vibes", es: "Vibras" },
    emoji: "✨",
    color: "#50C878",
  },
  {
    id: "travel",
    name: { fr: "Voyages", en: "Travel", es: "Viajes" },
    emoji: "✈️",
    color: "#4A90D9",
  },
];

// ─── Load Highlights ────────────────────────────────────────
export async function getHighlights() {
  try {
    const raw = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
    if (raw) return JSON.parse(raw);

    // Initialize with defaults
    const defaults = DEFAULT_HIGHLIGHTS.map((h) => ({
      ...h,
      stories: [],
      createdAt: new Date().toISOString(),
    }));
    await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(defaults));
    return defaults;
  } catch (err) {
    console.warn("[Highlights] Load error:", err);
    return [];
  }
}

// ─── Create Highlight ───────────────────────────────────────
export async function createHighlight(name, emoji = "⚜️", color = "#D4AF37") {
  const highlights = await getHighlights();
  const newHighlight = {
    id: `highlight_${Date.now()}`,
    name: typeof name === "string" ? { fr: name, en: name, es: name } : name,
    emoji,
    color,
    stories: [],
    createdAt: new Date().toISOString(),
  };
  highlights.push(newHighlight);
  await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
  console.log(`[Highlights] ✨ Created: ${JSON.stringify(name)}`);
  return newHighlight;
}

// ─── Add Story to Highlight ─────────────────────────────────
export async function addStoryToHighlight(highlightId, story) {
  const highlights = await getHighlights();
  const highlight = highlights.find((h) => h.id === highlightId);
  if (!highlight) return false;

  // Prevent duplicates
  if (highlight.stories.some((s) => s.id === story.id)) return false;

  highlight.stories.push({
    id: story.id,
    mediaUri: story.mediaUri,
    mediaType: story.mediaType || "image",
    caption: story.caption || "",
    addedAt: new Date().toISOString(),
    originalTimestamp: story.timestamp,
  });

  await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
  console.log(`[Highlights] 📸 Story added to ${highlightId}`);
  return true;
}

// ─── Remove Story from Highlight ────────────────────────────
export async function removeStoryFromHighlight(highlightId, storyId) {
  const highlights = await getHighlights();
  const highlight = highlights.find((h) => h.id === highlightId);
  if (!highlight) return false;

  highlight.stories = highlight.stories.filter((s) => s.id !== storyId);
  await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
  return true;
}

// ─── Delete Highlight ───────────────────────────────────────
export async function deleteHighlight(highlightId) {
  let highlights = await getHighlights();
  highlights = highlights.filter((h) => h.id !== highlightId);
  await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
  console.log(`[Highlights] 🗑️ Deleted: ${highlightId}`);
}

// ─── Update Highlight ───────────────────────────────────────
export async function updateHighlight(highlightId, updates) {
  const highlights = await getHighlights();
  const index = highlights.findIndex((h) => h.id === highlightId);
  if (index === -1) return false;

  highlights[index] = { ...highlights[index], ...updates };
  await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
  return true;
}

// ─── Reorder Highlights ─────────────────────────────────────
export async function reorderHighlights(orderedIds) {
  const highlights = await getHighlights();
  const reordered = orderedIds
    .map((id) => highlights.find((h) => h.id === id))
    .filter(Boolean);

  // Add any that weren't in the order list
  highlights.forEach((h) => {
    if (!orderedIds.includes(h.id)) reordered.push(h);
  });

  await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(reordered));
}

// ─── Get Highlight by ID ────────────────────────────────────
export async function getHighlightById(highlightId) {
  const highlights = await getHighlights();
  return highlights.find((h) => h.id === highlightId) || null;
}

// ─── Stats ──────────────────────────────────────────────────
export async function getHighlightStats() {
  const highlights = await getHighlights();
  return {
    totalHighlights: highlights.length,
    totalStories: highlights.reduce((sum, h) => sum + h.stories.length, 0),
    highlights: highlights.map((h) => ({
      id: h.id,
      name: h.name,
      storyCount: h.stories.length,
    })),
  };
}
