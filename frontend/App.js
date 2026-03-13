import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import { useAuthStore } from "./src/store/chatsnapStore";
import { colors, shadows, spacing } from "./src/theme/chatsnapTheme";

// Screens
import CameraScreen from "./src/screens/CameraScreen";
import StoriesScreen from "./src/screens/StoriesScreen";
import ChatScreen from "./src/screens/ChatScreen";
import MapScreen from "./src/screens/MapScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ChatDetailScreen from "./src/screens/ChatDetailScreen";
import PremiumUpgrade from "./src/components/ImperialPremiumUpgrade";

// Auth
import AuthScreen from "./src/screens/AuthScreen";
import StoryViewer from "./src/components/StoryViewer";
import ImperialTabBar from "./src/components/ImperialTabBar";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

class AppErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.appRoot, styles.errorFallback]}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => (Platform.OS === "web" && typeof window !== "undefined" ? window.location.reload() : this.setState({ hasError: false }))}
          >
            <Text style={styles.errorButtonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

async function setupEmpireChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("elite_messages", {
      name: "L'Élite Notifications",
      importance: Notifications.AndroidImportance.MAX,
      sound: "empire_chime",
      vibrationPattern: [0, 100, 50, 100],
      lightColor: colors.gold.DEFAULT,
    });
  }
}

const WEB_BG = "#0A0A0A";

// Web: run before first paint so the screen is never white
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `html,body{background:${WEB_BG}!important;margin:0;min-height:100vh;}body *{box-sizing:border-box;}#root,.root{background:${WEB_BG}!important;min-height:100vh!important;display:flex!important;flex-direction:column!important;}`;
  document.head.appendChild(style);
  document.documentElement.style.backgroundColor = WEB_BG;
  document.body.style.backgroundColor = WEB_BG;
  document.body.style.margin = "0";
  document.body.style.minHeight = "100vh";
  const root = document.getElementById("root") || document.getElementById("app-root") || document.body.firstElementChild;
  if (root) {
    root.style.backgroundColor = WEB_BG;
    root.style.minHeight = "100vh";
    root.style.display = "flex";
    root.style.flexDirection = "column";
  }
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    setupEmpireChannel();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <AppErrorBoundary>
    <View style={styles.appRoot}>
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
            <Stack.Screen name="PremiumUpgrade" component={PremiumUpgrade} />
          </>
        )}
      </Stack.Navigator>
      {isAuthenticated && <StoryViewer />}
    </NavigationContainer>
    </View>
    </AppErrorBoundary>
  );
}

function MainTabs() {
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <ImperialTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>📍</Text>
          ),
          tabBarLabel: "Territoire",
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>💬</Text>
          ),
          tabBarLabel: "Elite",
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>📷</Text>
          ),
          tabBarLabel: "Capture",
        }}
      />
      <Tab.Screen
        name="Stories"
        component={StoriesScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>✨</Text>
          ),
          tabBarLabel: "L'Élite",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={{ tabPress: triggerHaptic }}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
          tabBarLabel: "Souverain",
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: colors.background,
    minHeight: Platform.OS === "web" ? "100vh" : undefined,
    width: Platform.OS === "web" ? "100%" : undefined,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    minHeight: Platform.OS === "web" ? "100vh" : undefined,
  },
  loadingText: {
    color: colors.gold.DEFAULT,
    fontSize: 18,
  },
  errorFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.gold.DEFAULT,
    fontSize: 18,
    marginBottom: 16,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#0A0A0A",
    fontWeight: "bold",
  },
});
