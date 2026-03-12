import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Animated,
  PanResponder,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { colors, spacing, borderRadius, shadows } from "../theme/cliqueTheme";
import { STICKER_PICKER_OPTIONS, getBitmojiSticker } from "../services/bitmojiService";
import { useAuthStore } from "../store/cliqueStore";

const { height, width } = Dimensions.get("window");
const SHEET_HEIGHT = height * 0.5;

/**
 * BitmojiSheet — A premium sticker selector inspired by Snap Kit.
 * Features: Bottom drag-to-dismiss, category switching, and rich Bitmoji previews.
 */
export default function BitmojiSheet({ visible, onSelect, onClose }) {
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const translateY = useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 12,
        stiffness: 120,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const CATEGORIES = [
    { id: "all", icon: "✨", label: "Touts / All" },
    { id: "happy", icon: "😊", label: "Joie / Happy" },
    { id: "hype", icon: "🔥", label: "Hype" },
    { id: "mood", icon: "🎭", label: "Mood" },
  ];

  const handleSelect = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const stickerUrl = getBitmojiSticker(user, item.key);
    onSelect({
      ...item,
      url: stickerUrl,
    });
    onClose();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) onClose();
        else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible && translateY._value === height) return null;

  return (
    <View style={styles.overlay} pointerEvents={visible ? "auto" : "none"}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose} 
      />
      <Animated.View 
        style={[styles.sheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.handle} />
          
          {/* Categories Tab Bar */}
          <View style={styles.tabBar}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tab, activeCategory === cat.id && styles.activeTab]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCategory(cat.id);
                }}
              >
                <Text style={styles.tabIcon}>{cat.icon}</Text>
                {activeCategory === cat.id && <Text style={styles.tabLabel}>{cat.label}</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Sticker Grid */}
          <FlatList
            data={STICKER_PICKER_OPTIONS}
            keyExtractor={(item) => item.key}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.stickerItem} 
                onPress={() => handleSelect(item)}
              >
                {user?.snapKitLinked ? (
                  <Image 
                    source={{ uri: getBitmojiSticker(user, item.key) }} 
                    style={styles.bitmojiImg}
                  />
                ) : (
                  <View style={styles.emojiFallback}>
                    <Text style={styles.emojiText}>{item.emoji}</Text>
                  </View>
                )}
                <Text style={styles.stickerLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.snapBadge}>
            <Text style={styles.snapText}>Powered by Snap Kit</Text>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: "rgba(30, 30, 30, 0.85)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    borderTopWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginVertical: 12,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  activeTab: {
    backgroundColor: colors.gold.DEFAULT,
    shadowColor: colors.gold.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    marginLeft: 6,
    color: "#000",
    fontSize: 12,
    fontWeight: "900",
  },
  grid: {
    padding: spacing.md,
    paddingBottom: 60,
  },
  stickerItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  bitmojiImg: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  emojiFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: {
    fontSize: 32,
  },
  stickerLabel: {
    marginTop: 4,
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  snapBadge: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  snapText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
