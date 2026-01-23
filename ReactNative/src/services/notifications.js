/**
 * Push notification service using expo-notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions
 */
export async function requestPermissions() {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Event Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4592AA',
    });
  }

  return true;
}

/**
 * Schedule a local notification for an event
 * @param {Object} event - The event object
 * @param {number} minutesBefore - Minutes before the event to trigger notification
 * @returns {string} The notification identifier
 */
export async function scheduleEventReminder(event, minutesBefore) {
  // Parse event date and time
  const eventDate = new Date(event.date.split('T')[0] + 'T00:00:00');
  if (!event.time) {
    throw new Error('Event has no time');
  }

  const [hours, minutes] = event.time.split(':').map(Number);
  eventDate.setHours(hours, minutes, 0, 0);

  // Calculate trigger time
  const triggerTime = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);

  // Don't schedule if time has passed
  if (triggerTime <= new Date()) {
    throw new Error('Cannot schedule notification in the past');
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎪 ${event.title}`,
      body: `Starting in ${minutesBefore} minutes at ${event.categoryName || 'the festival'}`,
      data: { eventId: event.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
      channelId: Platform.OS === 'android' ? 'reminders' : undefined,
    },
  });

  return identifier;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelReminder(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledReminders() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Add listener for when notification is received
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when notification is tapped
 */
export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
