import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { View, Image, StyleSheet, StatusBar, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import { useAuthStore } from "./store/cliqueStore";
import { colors, shadows, spacing } from "./src/theme/cliqueTheme";

// Screens
import CameraScreen from "./screens/CameraScreen";
import StoriesScreen from "./screens/StoriesScreen";
import ChatScreen from "./screens/ChatScreen";
import MapScreen from "./screens/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChatDetailScreen from "./screens/ChatDetailScreen";

// Auth
import AuthScreen from "./screens/AuthScreen";
import StoryViewer from "./src/components/StoryViewer";

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

  useEffect(() => {
    setupEmpireChannel();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              animationTypeForReplace: !isAuthenticated ? "pop" : "push",
            }}
          />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
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
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 20,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },
  cameraInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    backgroundColor: "#FFBF00", // Amber spark
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
