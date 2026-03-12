import React, { useEffect, useState, useRef } from "react";
import { Platform, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { View, Image, StyleSheet, StatusBar, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import { useAuthStore } from "./src/store/cliqueStore";
import { colors, shadows, spacing } from "./src/theme/cliqueTheme";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "./src/services/websocketService";
import { triggerDailyGreeting } from "./src/services/eliteGreetingService";
import {
  registerForPushNotifications,
  setupNotificationListeners,
  scheduleDailyReminder,
  clearAllNotifications,
} from "./src/services/pushNotificationService";
import {
  initializeEncryption,
  clearAllEncryptionData,
} from "./src/services/encryptionService";

// Screens
import CameraScreen from "./src/screens/CameraScreen";
import StoriesScreen from "./src/screens/StoriesScreen";
import ChatScreen from "./src/screens/ChatScreen";
import MapScreen from "./src/screens/MapScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ChatDetailScreen from "./src/screens/ChatDetailScreen";
import AddFriendsScreen from "./src/screens/AddFriendsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import CliqueChatScreen from "./src/screens/CliqueChatScreen";
import SearchCliquesScreen from "./src/screens/SearchCliquesScreen";
import ProfileCustomizeScreen from "./src/screens/ProfileCustomizeScreen";
import GlobalSearchScreen from "./src/screens/GlobalSearchScreen";

// Auth
import AuthScreen from "./src/screens/AuthScreen";
import LandingVIPScreen from "./src/screens/LandingVIPScreen";
import StoryViewer from "./src/components/StoryViewer";

const linking = {
  prefixes: ["clique://", "https://clique.app"],
  config: {
    screens: {
      Main: {
        screens: {
          Chat: "chat",
          Stories: "stories",
          Map: "map",
          Profile: "profile",
        },
      },
      ChatDetail: "chat/:userId",
      CliqueChat: "clique/:cliqueId",
      GlobalSearch: "search",
      SearchCliques: "explore",
    },
  },
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

async function setupEmpireChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("elite_messages", {
      name: "L'Élite Notifications",
      importance: Notifications.AndroidImportance.MAX,
      sound: "empire_chime.wav",
      vibrationPattern: [0, 100, 50, 100],
      lightColor: colors.gold.DEFAULT,
    });
  }
}

// Main app with auth check
export default function App() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigationRef = useRef(null);

  useEffect(() => {
    setupEmpireChannel();
  }, []);

  // Push notification listeners (deep-link on tap)
  useEffect(() => {
    const unsubscribe = setupNotificationListeners(navigationRef);
    return unsubscribe;
  }, []);

  // Clear badge when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        clearAllNotifications();
      }
    });
    return () => sub?.remove();
  }, []);

  // Connect/disconnect WebSocket based on auth
  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();

      // Register push token + schedule reminders
      registerForPushNotifications().then((token) => {
        if (token) {
          console.log("Push token registered:", token);
          // TODO: Send token to backend via userAPI.updatePushToken(token)
        }
      });
      scheduleDailyReminder();

      // Initialize E2E encryption keys
      initializeEncryption().then(({ publicKey, isNew }) => {
        if (isNew) {
          console.log("[App] New E2E identity created:", publicKey.substring(0, 16));
          // TODO: Upload publicKey to backend for key exchange
        }
      });

      // Fire daily greeting on session start
      const user = useAuthStore.getState().user;
      if (user) {
        triggerDailyGreeting(user.displayName || user.username);
      }
    } else {
      disconnectWebSocket();
    }

    return () => disconnectWebSocket();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.loadingLogo}>CLIQUE</Text>
        <Text style={styles.loadingTagline}>L'Élite de l'Instant / The Instant Elite</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: true,
        colors: {
          primary: colors.gold.DEFAULT,
          background: colors.background,
          card: colors.surface,
          text: colors.text.primary,
          border: colors.surfaceHighlight,
          notification: colors.accent.orange,
        },
      }}
      linking={linking}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="LandingVIP"
              component={LandingVIPScreen}
              options={{ animationEnabled: true }}
            />
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{
                animationTypeForReplace: !isAuthenticated ? "pop" : "push",
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ gestureEnabled: true }} />
            <Stack.Screen name="CliqueChat" component={CliqueChatScreen} options={{ gestureEnabled: true }} />
            <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} options={{ gestureEnabled: true }} />
            <Stack.Screen name="AddFriends" component={AddFriendsScreen} options={{ gestureEnabled: true }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ gestureEnabled: true }} />
            <Stack.Screen name="SearchCliques" component={SearchCliquesScreen} options={{ gestureEnabled: true }} />
            <Stack.Screen name="ProfileCustomize" component={ProfileCustomizeScreen} options={{ gestureEnabled: true }} />
          </>
        )}
      </Stack.Navigator>
      {isAuthenticated && <StoryViewer />}
    </NavigationContainer>
  );
}

// Main tab navigation
function MainTabs() {
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.leather.black,
          borderTopColor: colors.gold.DEFAULT,
          borderTopWidth: 0.5,
          height: 90,
          paddingBottom: 15,
          ...shadows.gold,
          shadowOpacity: 0.2,
        },
        tabBarActiveTintColor: colors.gold.DEFAULT,
        tabBarInactiveTintColor: "rgba(212, 175, 55, 0.3)",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "bold",
          letterSpacing: 1,
          textTransform: "uppercase",
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconContainer, focused && styles.iconActiveMap]}
            >
              <Text style={{ fontSize: 24, color }}>📍</Text>
            </View>
          ),
          tabBarLabel: "Territoire",
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconContainer, focused && styles.iconActiveChat]}
            >
              <Text style={{ fontSize: 24, color }}>💬</Text>
              <View style={styles.notificationDot} />
            </View>
          ),
          tabBarLabel: "Elite",
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconContainer, focused && styles.iconActiveCamera]}
            >
              <View style={styles.cameraIconShutter}>
                <View style={styles.cameraIconInner} />
              </View>
            </View>
          ),
          tabBarLabel: "Capture",
        }}
      />
      <Tab.Screen
        name="Stories"
        component={StoriesScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconActiveStories,
              ]}
            >
              <Text style={{ fontSize: 24, color }}>✨</Text>
            </View>
          ),
          tabBarLabel: "L'Élite",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconActiveProfile,
              ]}
            >
              <Text style={{ fontSize: 24, color }}>👤</Text>
            </View>
          ),
          tabBarLabel: "Souverain",
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.gold.DEFAULT,
    letterSpacing: 8,
    ...shadows.gold,
  },
  loadingTagline: {
    fontSize: 12,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: spacing.sm,
    opacity: 0.6,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  iconActiveChat: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  iconActiveMap: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  iconActiveStories: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  iconActiveProfile: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  iconActiveCamera: {
    transform: [{ scale: 1.1 }],
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFBF00",
    borderWidth: 1,
    borderColor: colors.leather.black,
  },
  cameraIconShutter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.gold,
  },
  cameraIconInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold.DEFAULT,
    opacity: 0.8,
  },
});
