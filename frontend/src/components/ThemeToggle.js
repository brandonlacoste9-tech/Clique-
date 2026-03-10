// Theme Toggle Component - Dark/Light Mode
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { colors, typography, spacing } from '../theme/cliqueTheme';
import { useAuthStore } from '../store/cliqueStore';
import { userAPI } from '../api/cliqueApi';

export default function ThemeToggle() {
  const { user } = useAuthStore();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Load saved preference
    if (user?.darkMode !== undefined) {
      setDarkMode(user.darkMode);
    }
  }, [user]);

  const toggleTheme = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    try {
      await userAPI.updateTheme({ darkMode: newMode });
      // Update user in store
      useAuthStore.getState().setUser({
        ...user,
        darkMode: newMode
      });
    } catch (err) {
      console.error('Failed to update theme:', err);
      // Revert on error
      setDarkMode(darkMode);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={toggleTheme}>
      <View style={styles.toggle}>
        <View 
          style={[
            styles.toggleCircle,
            { 
              transform: [{ translateX: darkMode ? 16 : 0 }],
              backgroundColor: darkMode ? colors.gold.DEFAULT : '#FFFFFF'
            }
          ]}
        />
      </View>
      <Text style={styles.label}>
        {darkMode ? 'Mode sombre' : 'Mode clair'}
      </Text>
    </TouchableOpacity>
  );
}

export function SystemThemeToggle() {
  const [darkMode, setDarkMode] = useState(true);
  const [systemTheme, setSystemTheme] = useState('dark');

  useEffect(() => {
    // Check system theme
    const checkSystemTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setSystemTheme(isDark ? 'dark' : 'light');
      setDarkMode(isDark);
    };

    checkSystemTheme();

    const listener = window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkSystemTheme);
    return () => listener.remove();
  }, []);

  const toggleTheme = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    try {
      await userAPI.updateTheme({ darkMode: newMode });
    } catch (err) {
      console.error('Failed to update theme:', err);
      setDarkMode(darkMode);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={toggleTheme}>
      <View style={styles.toggle}>
        <View 
          style={[
            styles.toggleCircle,
            { 
              transform: [{ translateX: darkMode ? 16 : 0 }],
              backgroundColor: darkMode ? colors.gold.DEFAULT : '#FFFFFF'
            }
          ]}
        />
      </View>
      <Text style={styles.label}>
        {darkMode ? 'Mode sombre' : 'Mode clair'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  toggle: {
    width: 40,
    height: 24,
    backgroundColor: colors.leather.black,
    borderRadius: 12,
    position: 'relative',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: 2,
    left: 2,
    transition: 'transform 0.3s ease',
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
});
