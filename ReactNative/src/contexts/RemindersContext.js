/**
 * RemindersContext — single shared reminders store.
 *
 * Reminders double as "saved sets" (the Lineup star). Lifting the state into one
 * provider means starring on the Lineup tab instantly reflects on My Plan and
 * Event Detail, with one notification schedule + one AsyncStorage source of truth.
 *
 * The `useReminders()` API is unchanged from the original hook, so consumers are
 * untouched (../hooks/useReminders re-exports this).
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scheduleEventReminder,
  cancelReminder,
  requestPermissions,
} from '../services/notifications';

const REMINDERS_STORAGE_KEY = '@pyramid_festival_reminders';
const RemindersContext = createContext(null);

export function RemindersProvider({ children }) {
  const [reminders, setReminders] = useState({});
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadReminders();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await requestPermissions();
    setPermissionGranted(granted);
  };

  const loadReminders = useCallback(async () => {
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
        if (Object.keys(activeReminders).length !== Object.keys(parsed).length) {
          await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(activeReminders));
        }
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  const setReminder = useCallback(async (event, minutesBefore) => {
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) throw new Error('Notification permission not granted');
      setPermissionGranted(true);
    }

    try {
      if (reminders[event.id]) {
        await cancelReminder(reminders[event.id].notificationId);
      }

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

  const hasReminder = useCallback((eventId) => !!reminders[eventId], [reminders]);
  const getReminder = useCallback((eventId) => reminders[eventId] || null, [reminders]);
  const getAllReminders = useCallback(() => (
    Object.values(reminders).sort((a, b) => {
      const dateA = new Date(a.eventDate + 'T' + a.eventTime);
      const dateB = new Date(b.eventDate + 'T' + b.eventTime);
      return dateA - dateB;
    })
  ), [reminders]);

  const value = useMemo(() => ({
    reminders,
    loading,
    permissionGranted,
    setReminder,
    removeReminder,
    hasReminder,
    getReminder,
    getAllReminders,
    refreshReminders: loadReminders,
  }), [reminders, loading, permissionGranted, setReminder, removeReminder, hasReminder, getReminder, getAllReminders, loadReminders]);

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within a RemindersProvider');
  return ctx;
}

export default RemindersContext;
