import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
  Keyboard,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors, spacing, borderRadius, typography } from "../theme/cliqueTheme";

/**
 * ChatSearchBar — In-chat message search overlay.
 *
 * Features:
 *   - Real-time search as you type
 *   - Highlighted matching results
 *   - Navigate between matches (up/down arrows)
 *   - Bilingual labels
 */
export default function ChatSearchBar({
  visible,
  messages,
  onClose,
  onJumpToMessage,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -80,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();

    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery("");
      setResults([]);
      setCurrentIndex(0);
    }
  }, [visible]);

  const handleSearch = (text) => {
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      setCurrentIndex(0);
      return;
    }

    const searchLower = text.toLowerCase();
    const matches = (messages || [])
      .map((msg, index) => ({
        ...msg,
        originalIndex: index,
      }))
      .filter(
        (msg) =>
          msg.text &&
          !msg.isSystem &&
          msg.text.toLowerCase().includes(searchLower)
      );

    setResults(matches);
    setCurrentIndex(0);

    if (matches.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (onJumpToMessage) onJumpToMessage(matches[0].originalIndex);
    }
  };

  const navigateResult = (direction) => {
    if (results.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = results.length - 1;
    if (newIndex >= results.length) newIndex = 0;

    setCurrentIndex(newIndex);
    if (onJumpToMessage) onJumpToMessage(results[newIndex].originalIndex);
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={i} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  const escapeRegex = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      {/* Search Input Row */}
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Chercher... / Search..."
            placeholderTextColor={colors.text.muted}
            value={query}
            onChangeText={handleSearch}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults([]);
                setCurrentIndex(0);
              }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Result count + navigation */}
        {results.length > 0 && (
          <View style={styles.navRow}>
            <Text style={styles.resultCount}>
              {currentIndex + 1}/{results.length}
            </Text>
            <TouchableOpacity
              onPress={() => navigateResult(-1)}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>▲</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigateResult(1)}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>▼</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Close */}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Annuler</Text>
        </TouchableOpacity>
      </View>

      {/* No results message */}
      {query.length > 0 && results.length === 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>
            Aucun résultat / No results found
          </Text>
        </View>
      )}

      {/* Preview of matched messages */}
      {results.length > 0 && (
        <View style={styles.resultsPreview}>
          <FlatList
            data={results.slice(0, 5)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.resultCard,
                  index === currentIndex && styles.resultCardActive,
                ]}
                onPress={() => {
                  setCurrentIndex(index);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (onJumpToMessage)
                    onJumpToMessage(item.originalIndex);
                }}
              >
                <Text style={styles.resultSender} numberOfLines={1}>
                  {item.sender === "me" ? "Moi / Me" : "Eux / Them"}
                </Text>
                <Text style={styles.resultText} numberOfLines={2}>
                  {highlightText(item.text, query)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.leather.dark,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
    zIndex: 100,
    paddingTop: 50,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtnText: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: "bold",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resultCount: {
    color: colors.gold.DEFAULT,
    fontSize: 11,
    fontWeight: "bold",
    minWidth: 30,
    textAlign: "center",
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  navBtnText: {
    color: colors.text.primary,
    fontSize: 10,
  },
  closeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  closeBtnText: {
    color: colors.gold.DEFAULT,
    fontSize: 12,
    fontWeight: "bold",
  },
  noResults: {
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  noResultsText: {
    color: colors.text.muted,
    fontSize: 11,
    fontStyle: "italic",
  },
  resultsPreview: {
    marginTop: spacing.sm,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    width: 180,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  resultCardActive: {
    borderColor: colors.gold.DEFAULT,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  resultSender: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  resultText: {
    color: colors.text.primary,
    fontSize: 12,
    lineHeight: 16,
  },
  highlight: {
    color: colors.gold.DEFAULT,
    fontWeight: "bold",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
});
