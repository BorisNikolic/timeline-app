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
        // Drop reminders for sets that have already finished; keep everything
        // whose time is unknown/unparseable (better to show than silently lose).
        const now = new Date();
        const activeReminders = {};
        Object.entries(parsed).forEach(([eventId, reminder]) => {
          const when = new Date(`${reminder.eventDate}T${reminder.eventTime || '23:59'}`);
          if (isNaN(when.getTime()) || when > now) {
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

  // Saving a set ALWAYS succeeds. A notification is a best-effort bonus: it's
  // only scheduled when permission is granted AND the set is still upcoming.
  // Returns { reminder, scheduled, reason } so callers can nudge the user.
  // `reason`: 'permission' (notifications off) | 'past' (already started) |
  // 'notime' (set has no start time). Never throws.
  const setReminder = useCallback(async (event, minutesBefore) => {
    // Best-effort permission — never blocks saving the set.
    let granted = permissionGranted;
    if (!granted) {
      granted = await requestPermissions();
      if (granted) setPermissionGranted(true);
    }

    // Best-effort notification (replace any previous one for this event).
    // Isolated in its own try so a native failure can't stop the save below.
    let notificationId = null;
    try {
      const prevId = reminders[event.id]?.notificationId;
      if (prevId) await cancelReminder(prevId);
      if (granted) notificationId = await scheduleEventReminder(event, minutesBefore);
    } catch (error) {
      console.warn('Could not schedule reminder:', error?.message || error);
    }

    const scheduled = notificationId != null;
    const reason = scheduled ? null
      : !granted ? 'permission'
      : event.time ? 'past'
      : 'notime';

    const reminder = {
      eventId: event.id,
      notificationId,
      minutesBefore,
      notify: scheduled,
      eventTitle: event.title,
      eventDate: (event.date || '').split('T')[0],
      eventTime: event.time,
      categoryName: event.categoryName,
      categoryColor: event.categoryColor,
      createdAt: new Date().toISOString(),
    };

    // Functional update + persist the authoritative merged map inside the
    // updater, so rapid successive saves can't clobber one another through a
    // stale closure over `reminders`.
    setReminders(prev => {
      const next = { ...prev, [event.id]: reminder };
      saveReminders(next);
      return next;
    });
    return { reminder, scheduled, reason };
  }, [reminders, permissionGranted]);

  const removeReminder = useCallback(async (eventId) => {
    try {
      const prevId = reminders[eventId]?.notificationId;
      if (prevId) await cancelReminder(prevId);
    } catch (error) {
      console.warn('Could not cancel notification:', error?.message || error);
    }
    setReminders(prev => {
      const next = { ...prev };
      delete next[eventId];
      saveReminders(next);
      return next;
    });
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
