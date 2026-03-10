// Push Notification Service - Expo token registration and handling
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/cliqueStore';
import { notificationsAPI } from '../api/cliqueApi';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Get push token
export async function getPushToken() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Ask for permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token');
    return null;
  }

  // Get the actual token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

// Register token with backend
export async function registerPushToken() {
  const { token: authToken } = useAuthStore.getState();
  
  if (!authToken) {
    console.log('No auth token, skipping push token registration');
    return;
  }

  try {
    const pushToken = await getPushToken();
    
    if (!pushToken) {
      console.log('No push token available');
      return;
    }

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    const appVersion = '2026.1.0';
    const osVersion = Device.osVersion || 'unknown';

    await notificationsAPI.registerToken(pushToken, platform, appVersion, osVersion);
    console.log('Push token registered successfully');
  } catch (err) {
    console.error('Failed to register push token:', err);
  }
}

// Handle notification when app is in foreground
export function onNotificationReceived(notification) {
  console.log('Notification received:', notification);
  // Play sound or trigger haptic feedback
  // This can be customized based on notification type
}

// Handle notification response (user taps notification)
export function onNotificationResponseReceived(notificationResponse) {
  console.log('Notification response received:', notificationResponse);
  // Navigate to appropriate screen based on notification data
  const { notification } = notificationResponse;
  // Add navigation logic here
}

// Schedule local notification
export function scheduleLocalNotification(content, trigger) {
  return Notifications.scheduleNotificationAsync({
    content,
    trigger,
  });
}

// Cancel scheduled notification
export function cancelScheduledNotification(id) {
  Notifications.cancelScheduledNotificationAsync(id);
}

// Set badge count
export async function setBadgeCount(count) {
  await Notifications.setBadgeCountAsync(count);
}

// Initialize push notification service
export function initializePushNotifications() {
  // Set up notification handlers
  Notifications.addNotificationReceivedListener(onNotificationReceived);
  Notifications.addNotificationResponseReceivedListener(onNotificationResponseReceived);
  
  // Register token when app starts
  registerPushToken();
}

export default {
  getPushToken,
  registerPushToken,
  scheduleLocalNotification,
  cancelScheduledNotification,
  setBadgeCount,
  initializePushNotifications,
};
