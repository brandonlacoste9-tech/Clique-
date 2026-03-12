import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useMessagesStore } from "../store/cliqueStore";
import { getAvatarUrl } from "../services/bitmojiService";
import { useLanguageStore } from "../services/languageService";
import { colors, spacing, borderRadius } from "../theme/cliqueTheme";

/**
 * ForwardPicker — Modal to select one or more recipients to forward a message to.
 */
export default function ForwardPicker({ visible, onForward, onClose }) {
  const { language } = useLanguageStore();
  const { conversations } = useMessagesStore();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!visible) {
      setSearch("");
      setSelectedIds([]);
    }
  }, [visible]);

  const toggleSelect = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSend = () => {
    if (selectedIds.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onForward(selectedIds);
    onClose();
  };

  const filteredConversations = conversations.filter((c) => {
    const name = (c.user.displayName || c.user.username).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const LABELS = {
    fr: {
      title: "TRANSFÉRER À",
      placeholder: "Rechercher...",
      send: "Envoyer",
      cancel: "Annuler",
      to: "À",
    },
    en: {
      title: "FORWARD TO",
      placeholder: "Search...",
      send: "Send",
      cancel: "Cancel",
      to: "To",
    },
    es: {
      title: "REENVIAR A",
      placeholder: "Buscar...",
      send: "Enviar",
      cancel: "Cancelar",
      to: "A",
    },
  };

  const L = LABELS[language] || LABELS.fr;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{L.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>{L.cancel}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder={L.placeholder}
            placeholderTextColor={colors.text.muted}
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.conversationId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSelected = selectedIds.includes(item.user.username);
              return (
                <TouchableOpacity
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() => toggleSelect(item.user.username)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: getAvatarUrl(item.user) }}
                    style={styles.avatar}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name}>
                      {item.user.displayName || item.user.username}
                    </Text>
                  </View>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity
            style={[styles.sendBtn, selectedIds.length === 0 && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={selectedIds.length === 0}
          >
            <Text style={styles.sendBtnText}>
              {L.send} ({selectedIds.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.leather.dark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "80%",
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
  },
  title: {
    color: colors.gold.DEFAULT,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
  },
  cancelText: {
    color: colors.text.muted,
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    padding: 12,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  itemSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.05)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.gold.DEFAULT,
    borderColor: colors.gold.DEFAULT,
  },
  checkIcon: {
    color: colors.leather.black,
    fontSize: 12,
    fontWeight: "bold",
  },
  sendBtn: {
    margin: spacing.xl,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: colors.leather.black,
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
