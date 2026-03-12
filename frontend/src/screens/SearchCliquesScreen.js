import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { cliquesAPI } from "../api/cliqueApi";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";

export default function SearchCliquesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [nearbyCliques, setNearbyCliques] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadNearbyCliques();
  }, []);

  const loadNearbyCliques = async () => {
    setSearching(true);
    try {
      // Mock coordinates for Plateau, Montreal
      const res = await cliquesAPI.getNearby(45.5122, -73.57, 5000);
      setNearbyCliques(res.data.cliques || []);
    } catch (err) {
      console.error("Failed to load nearby cliques:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateClique = async () => {
    if (!searchQuery.trim() || creating) return;

    setCreating(true);
    try {
      const res = await cliquesAPI.createClique({
        name: searchQuery,
        lat: 45.5122,
        lng: -73.57,
        region: "Montréal",
        neighborhood: "Le Plateau",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("CliqueChat", {
        cliqueId: res.data.clique.id,
        cliqueName: res.data.clique.name,
      });
    } catch (err) {
      console.error(
        "Failed to create clique:",
        err.response?.data?.error || err.message,
      );
    } finally {
      setCreating(false);
    }
  };

  const renderCliqueItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cliqueRow}
      onPress={() =>
        navigation.navigate("CliqueChat", {
          cliqueId: item.id,
          cliqueName: item.name,
        })
      }
    >
      <View style={styles.cliqueIcon}>
        <Text style={styles.cliqueIconText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.cliqueInfo}>
        <Text style={styles.cliqueName}>{item.name}</Text>
        <Text style={styles.cliqueMeta}>
          {item.memberCount} membres •{" "}
          {item.distanceMeters
            ? `${(item.distanceMeters / 1000).toFixed(1)}km`
            : "Près de toi"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() =>
          navigation.navigate("CliqueChat", {
            cliqueId: item.id,
            cliqueName: item.name,
          })
        }
      >
        <Text style={styles.joinButtonText}>REJOINDRE / JOIN</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TERRITOIRE / TERRITORY</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Trouver ou créer... / Find or create..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searching && (
          <ActivityIndicator
            color={colors.gold.DEFAULT}
            style={styles.searchSpinner}
          />
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>À PROXIMITÉ / NEARBY</Text>
      </View>

      <FlatList
        data={nearbyCliques}
        renderItem={renderCliqueItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={
            searchQuery.length > 0 && (
                <TouchableOpacity 
                    style={styles.createRow}
                    onPress={handleCreateClique}
                    disabled={creating}
                >
                    <View style={[styles.cliqueIcon, styles.createIcon]}>
                        <Text style={styles.createPlus}>+</Text>
                    </View>
                    <View style={styles.cliqueInfo}>
                        <Text style={styles.createTitle}>Créer / Create "<strong>{searchQuery}</strong>"</Text>
                        <Text style={styles.createSubtitle}>Lance ta clique exclusive / Start your clique</Text>
                    </View>
                    {creating && <ActivityIndicator color={colors.gold.DEFAULT} />}
                </TouchableOpacity>
            )
        }
        ListEmptyComponent={
          !searching && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📍</Text>
              <Text style={styles.emptyText}>Aucune clique ici... / No cliques here yet.</Text>
              <Text style={styles.emptySubtext}>Sois le premier! / Be the first!</Text>
            </View>
          )
        }
      />
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
    borderBottomColor: colors.surfaceHighlight,
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: "relative",
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  searchSpinner: {
    position: "absolute",
    right: spacing.lg + 16,
    top: spacing.md + 14,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(212, 175, 55, 0.05)",
  },
  sectionTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  cliqueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceHighlight,
  },
  cliqueIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  cliqueIconText: {
    color: colors.gold.DEFAULT,
    fontSize: 18,
    fontWeight: "bold",
  },
  cliqueInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cliqueName: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: "600",
  },
  cliqueMeta: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  joinButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  joinButtonText: {
    color: colors.gold.DEFAULT,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  createRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  createIcon: {
    borderColor: colors.accent.blue,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  createPlus: {
    color: colors.accent.blue,
    fontSize: 24,
    fontWeight: "300",
  },
  createTitle: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  createSubtitle: {
    color: colors.accent.blue,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    textAlign: "center",
    fontWeight: "bold",
  },
  emptySubtext: {
    color: colors.gold.DEFAULT,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
});
