// Web stub for push notifications — avoids importing expo-device / expo-notifications
// which are native-only and would crash or hang on web.

export async function getPushToken() {
  console.log('Push notifications are not supported on web');
  return null;
}

export async function registerPushToken() {
  console.log('Push token registration skipped on web');
}

export function onNotificationReceived() {}
export function onNotificationResponseReceived() {}

export function scheduleLocalNotification() {
  return Promise.resolve(null);
}

export function cancelScheduledNotification() {}

export async function setBadgeCount() {}

export function initializePushNotifications() {
  console.log('Push notification service: web stub (no-op)');
}

export default {
  getPushToken,
  registerPushToken,
  scheduleLocalNotification,
  cancelScheduledNotification,
  setBadgeCount,
  initializePushNotifications,
};
