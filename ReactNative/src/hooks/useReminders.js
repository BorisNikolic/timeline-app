/**
 * Hook for managing event reminders with AsyncStorage and notifications
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scheduleEventReminder,
  cancelReminder,
  requestPermissions,
} from '../services/notifications';

const REMINDERS_STORAGE_KEY = '@pyramid_festival_reminders';

/**
 * Reminder object shape:
 * {
 *   eventId: string,
 *   notificationId: string,
 *   minutesBefore: number,
 *   eventTitle: string,
 *   eventDate: string,
 *   eventTime: string,
 *   createdAt: string,
 * }
 */

export function useReminders() {
  const [reminders, setReminders] = useState({});
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Load reminders from storage on mount
  useEffect(() => {
    loadReminders();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await requestPermissions();
    setPermissionGranted(granted);
  };

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clean up past reminders
        const now = new Date();
        const activeReminders = {};
        Object.entries(parsed).forEach(([eventId, reminder]) => {
          const eventDate = new Date(reminder.eventDate + 'T' + reminder.eventTime);
          if (eventDate > now) {
            activeReminders[eventId] = reminder;
          }
        });
        setReminders(activeReminders);
        // Save cleaned up reminders
        if (Object.keys(activeReminders).length !== Object.keys(parsed).length) {
          await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(activeReminders));
        }
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  /**
   * Set a reminder for an event
   */
  const setReminder = useCallback(async (event, minutesBefore) => {
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        throw new Error('Notification permission not granted');
      }
      setPermissionGranted(true);
    }

    try {
      // Cancel existing reminder if any
      if (reminders[event.id]) {
        await cancelReminder(reminders[event.id].notificationId);
      }

      // Schedule new notification
      const notificationId = await scheduleEventReminder(event, minutesBefore);

      const reminder = {
        eventId: event.id,
        notificationId,
        minutesBefore,
        eventTitle: event.title,
        eventDate: event.date.split('T')[0],
        eventTime: event.time,
        categoryName: event.categoryName,
        categoryColor: event.categoryColor,
        createdAt: new Date().toISOString(),
      };

      const newReminders = { ...reminders, [event.id]: reminder };
      setReminders(newReminders);
      await saveReminders(newReminders);

      return reminder;
    } catch (error) {
      console.error('Error setting reminder:', error);
      throw error;
    }
  }, [reminders, permissionGranted]);

  /**
   * Remove a reminder for an event
   */
  const removeReminder = useCallback(async (eventId) => {
    try {
      if (reminders[eventId]) {
        await cancelReminder(reminders[eventId].notificationId);
      }

      const newReminders = { ...reminders };
      delete newReminders[eventId];
      setReminders(newReminders);
      await saveReminders(newReminders);
    } catch (error) {
      console.error('Error removing reminder:', error);
      throw error;
    }
  }, [reminders]);

  /**
   * Check if an event has a reminder set
   */
  const hasReminder = useCallback((eventId) => {
    return !!reminders[eventId];
  }, [reminders]);

  /**
   * Get reminder for an event
   */
  const getReminder = useCallback((eventId) => {
    return reminders[eventId] || null;
  }, [reminders]);

  /**
   * Get all reminders as array
   */
  const getAllReminders = useCallback(() => {
    return Object.values(reminders).sort((a, b) => {
      const dateA = new Date(a.eventDate + 'T' + a.eventTime);
      const dateB = new Date(b.eventDate + 'T' + b.eventTime);
      return dateA - dateB;
    });
  }, [reminders]);

  return {
    reminders,
    loading,
    permissionGranted,
    setReminder,
    removeReminder,
    hasReminder,
    getReminder,
    getAllReminders,
    refreshReminders: loadReminders,
  };
}
