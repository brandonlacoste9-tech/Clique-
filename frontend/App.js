import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuthStore } from './store/cliqueStore';
import { colors } from './theme/cliqueTheme';

// Screens
import CameraScreen from './screens/CameraScreen';
import StoriesScreen from './screens/StoriesScreen';
import ChatScreen from './screens/ChatScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';

// Auth
import AuthScreen from './screens/AuthScreen';

const Tab = createBottomTabNavigator();

// Main app with auth check
export default function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Loading screen */}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {isAuthenticated ? <MainTabs /> : <AuthScreen />}
    </NavigationContainer>
  );
}

// Main tab navigation
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.gold.DEFAULT,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarShowLabel: false
      }}
      initialRouteName="Camera"
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ tabBarIcon: MapIcon }}
      />
      <Tab.Screen 
        name="Stories" 
        component={StoriesScreen}
        options={{ tabBarIcon: StoriesIcon }}
      />
      
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ tabBarIcon: CameraIcon }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ tabBarIcon: ChatIcon }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarIcon: ProfileIcon }}
      />
    </Tab.Navigator>
  );
}

// Simple icon components (replace with actual icons)
function MapIcon({ color }) {
  return <View style={[styles.icon, { backgroundColor: color }]} />;
}
function StoriesIcon({ color }) {
  return <View style={[styles.icon, { backgroundColor: color }]} />;
}
function CameraIcon({ color }) {
  return (
    <View style={[styles.cameraButton, { borderColor: color }]} >
      <View style={[styles.cameraInner, { backgroundColor: color }]} />
    </View>
  );
}
function ChatIcon({ color }) {
  return <View style={[styles.icon, { backgroundColor: color }]} />;
}
function ProfileIcon({ color }) {
  return <View style={[styles.icon, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 20
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20
  },
  cameraInner: {
    width: 44,
    height: 44,
    borderRadius: 22
  }
});
