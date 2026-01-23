/**
 * MyEventsScreen - Shows events with reminders set
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

import ReminderPicker from '../components/ReminderPicker';
import { useReminders } from '../hooks/useReminders';
import { formatTime, formatDateShort, parseDate } from '../utils/dateHelpers';

export default function MyEventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { getAllReminders, getReminder, setReminder, removeReminder, refreshReminders, loading } = useReminders();
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const reminders = useMemo(() => getAllReminders(), [getAllReminders]);

  const handleEventPress = useCallback((reminder) => {
    // Create a minimal event object for navigation
    const event = {
      id: reminder.eventId,
      title: reminder.eventTitle,
      date: reminder.eventDate,
      time: reminder.eventTime,
      categoryName: reminder.categoryName,
      categoryColor: reminder.categoryColor,
    };
    setSelectedEvent(event);
    setReminderModalVisible(true);
  }, []);

  const handleSetReminder = useCallback(async (minutes) => {
    if (selectedEvent) {
      try {
        await setReminder(selectedEvent, minutes);
      } catch (error) {
        console.error('Error updating reminder:', error);
      }
    }
  }, [selectedEvent, setReminder]);

  const handleRemoveReminder = useCallback(async () => {
    if (selectedEvent) {
      try {
        await removeReminder(selectedEvent.id);
      } catch (error) {
        console.error('Error removing reminder:', error);
      }
    }
  }, [selectedEvent, removeReminder]);

  const renderItem = useCallback(({ item: reminder }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(reminder)}
      activeOpacity={0.7}
    >
      {/* Category color indicator */}
      <View
        style={[
          styles.categoryIndicator,
          { backgroundColor: reminder.categoryColor || colors.teal },
        ]}
      />

      <View style={styles.eventContent}>
        {/* Date and category */}
        <View style={styles.headerRow}>
          <Text style={styles.eventDate}>
            {formatDateShort(parseDate(reminder.eventDate))}
          </Text>
          <Text style={styles.categoryName}>
            {reminder.categoryName}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.eventTitle} numberOfLines={2}>
          {reminder.eventTitle}
        </Text>

        {/* Time and reminder info */}
        <View style={styles.footerRow}>
          <Text style={styles.eventTime}>
            {formatTime(reminder.eventTime)}
          </Text>
          <View style={styles.reminderBadge}>
            <Text style={styles.reminderBadgeText}>
              🔔 {reminder.minutesBefore} min before
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleEventPress]);

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <Text style={styles.headerSubtitle}>
          {reminders.length} event{reminders.length !== 1 ? 's' : ''} with reminders
        </Text>
      </View>

      {/* Event list */}
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.eventId}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No reminders set</Text>
            <Text style={styles.emptySubtitle}>
              Browse the schedule and tap the bell icon to set reminders for events you don't want to miss
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshReminders}
            tintColor={colors.teal}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Reminder picker modal */}
      <ReminderPicker
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onSetReminder={handleSetReminder}
        onRemoveReminder={handleRemoveReminder}
        event={selectedEvent}
        existingReminder={selectedEvent ? getReminder(selectedEvent.id) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.navyDark,
  },
  headerTitle: {
    ...typography.textStyles.h2,
    color: colors.text.inverse,
  },
  headerSubtitle: {
    ...typography.textStyles.body,
    color: colors.tealLight,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.screen,
  },
  emptyText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    overflow: 'hidden',
  },
  categoryIndicator: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  eventDate: {
    ...typography.textStyles.label,
    color: colors.teal,
  },
  categoryName: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
  },
  eventTitle: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTime: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
  },
  reminderBadge: {
    backgroundColor: colors.teal + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  reminderBadgeText: {
    ...typography.textStyles.caption,
    color: colors.teal,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
