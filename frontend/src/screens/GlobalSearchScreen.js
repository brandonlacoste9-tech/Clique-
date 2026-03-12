import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { messagesAPI } from "../api/cliqueApi";
import { colors, spacing, typography, borderRadius } from "../theme/cliqueTheme";
import { useLanguageStore } from "../services/languageService";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";

const localeMap = { fr, en: enUS, es };

export default function GlobalSearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentLanguage, t } = useLanguageStore();

  const handleSearch = useCallback(async (text) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await messagesAPI.globalSearch(text);
      setResults(res.data.results);
    } catch (err) {
      console.error("Global search failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() =>
        navigation.navigate("ChatDetail", {
          userId: item.user.id,
          userName: item.user.displayName || item.user.username,
        })
      }
    >
      <Image
        source={{ uri: item.user.avatarUrl || "https://via.placeholder.com/100" }}
        style={styles.avatar}
      />
      <View style={styles.resultInfo}>
        <View style={styles.resultHeader}>
          <Text style={styles.displayName}>
            {item.user.displayName || item.user.username}
          </Text>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(item.sentAt), {
              addSuffix: true,
              locale: localeMap[currentLanguage] || fr,
            })}
          </Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.searchBarContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.gold.DEFAULT} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t("RECHERCHE_GLOBALE") || "Rechercher dans les messages..."}
              placeholderTextColor={colors.text.muted}
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>
        </View>
      </BlurView>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            query.length >= 2 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {t("AUCUN_RESULTAT") || "Aucun message trouvé / No results found"}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHighlight,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 45,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.sizes.md,
  },
  resultsList: {
    padding: spacing.md,
  },
  resultCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  displayName: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: "bold",
  },
  timestamp: {
    color: colors.text.muted,
    fontSize: 10,
  },
  messageText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    marginTop: 100,
    alignItems: "center",
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
  },
});
