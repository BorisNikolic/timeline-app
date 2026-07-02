/**
 * Push notification service using expo-notifications
 */

import * as Notifications from 'expo-notifications';
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
 * Request notification permissions.
 *
 * Local (scheduled) notifications work on simulators/emulators too — the
 * physical-device requirement only applies to *remote* push tokens, which we
 * don't use. Returns true when granted, false otherwise. Never throws.
 */
export async function requestPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

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
  } catch (error) {
    console.warn('Notification permissions unavailable:', error?.message || error);
    return false;
  }
}

/**
 * Schedule a local notification for an event.
 *
 * Returns the notification identifier, or `null` when there is nothing to
 * schedule (event has no time, or the trigger moment is already in the past).
 * Callers treat `null` as "saved, but no reminder" rather than an error.
 *
 * @param {Object} event - The event object
 * @param {number} minutesBefore - Minutes before the event to trigger notification
 * @returns {Promise<string|null>} The notification identifier, or null
 */
export async function scheduleEventReminder(event, minutesBefore) {
  if (!event?.time) return null;

  // Parse event date and time
  const eventDate = new Date(event.date.split('T')[0] + 'T00:00:00');
  const [hours, minutes] = event.time.split(':').map(Number);
  eventDate.setHours(hours, minutes, 0, 0);

  // Calculate trigger time
  const triggerTime = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);

  // Nothing to schedule for a moment that has already passed.
  if (triggerTime <= new Date()) return null;

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
