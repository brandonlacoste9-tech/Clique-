import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/chatsnapTheme';

export default function ImperialTabBar({
  state,
  descriptors,
  navigation,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <View style={styles.tabContent}>
              <Text style={styles.icon}>
                {options.tabBarIcon?.({ focused: isFocused, color: colors.gold.DEFAULT, size: 24 }) || '•'}
              </Text>
              {isFocused && (
                <Text style={styles.label}>{label}</Text>
              )}
            </View>
            
            {isFocused && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.leather.black,
    borderTopWidth: 1,
    borderTopColor: colors.gold.DEFAULT,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.gold.DEFAULT,
    fontWeight: '600',
    letterSpacing: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gold.DEFAULT,
    ...shadows.gold,
  },
});
