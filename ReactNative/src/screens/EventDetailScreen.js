/**
 * EventDetailScreen - Full event details with reminder picker
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

import ReminderPicker from '../components/ReminderPicker';
import { useReminders } from '../hooks/useReminders';
import { formatTime, formatDateLong, parseDate, getMinutesUntilEvent } from '../utils/dateHelpers';

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const { hasReminder, getReminder, setReminder, removeReminder } = useReminders();

  const eventHasReminder = hasReminder(event.id);
  const existingReminder = getReminder(event.id);
  const minutesUntil = getMinutesUntilEvent(event);
  const isPast = minutesUntil !== null && minutesUntil < 0;

  const handleSetReminder = useCallback(async (minutes) => {
    try {
      await setReminder(event, minutes);
    } catch (error) {
      console.error('Error setting reminder:', error);
    }
  }, [event, setReminder]);

  const handleRemoveReminder = useCallback(async () => {
    try {
      await removeReminder(event.id);
    } catch (error) {
      console.error('Error removing reminder:', error);
    }
  }, [event.id, removeReminder]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Category header */}
        <View
          style={[
            styles.categoryHeader,
            { backgroundColor: event.categoryColor || colors.teal },
          ]}
        >
          <Text style={styles.categoryName}>{event.categoryName || 'Event'}</Text>
        </View>

        {/* Event title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Date and time */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>
              {formatDateLong(parseDate(event.date))}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>
              {formatTime(event.time)}
              {event.endTime ? ` - ${formatTime(event.endTime)}` : ''}
            </Text>
          </View>

          {event.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>About</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}
        </View>

        {/* Reminder status - hidden for past events */}
        {eventHasReminder && !isPast && (
          <View style={styles.reminderStatus}>
            <Text style={styles.reminderStatusIcon}>🔔</Text>
            <View style={styles.reminderStatusContent}>
              <Text style={styles.reminderStatusTitle}>Reminder set</Text>
              <Text style={styles.reminderStatusText}>
                {existingReminder.minutesBefore} minutes before
              </Text>
            </View>
            <TouchableOpacity
              style={styles.reminderEditButton}
              onPress={() => setReminderModalVisible(true)}
            >
              <Text style={styles.reminderEditButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom action bar - hidden for past events */}
      {!isPast && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[
              styles.reminderButton,
              eventHasReminder && styles.reminderButtonActive,
            ]}
            onPress={() => setReminderModalVisible(true)}
          >
            <Text style={styles.reminderButtonIcon}>
              {eventHasReminder ? '🔔' : '🔕'}
            </Text>
            <Text
              style={[
                styles.reminderButtonText,
                eventHasReminder && styles.reminderButtonTextActive,
              ]}
            >
              {eventHasReminder ? 'Reminder Set' : 'Set Reminder'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reminder picker modal */}
      <ReminderPicker
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onSetReminder={handleSetReminder}
        onRemoveReminder={handleRemoveReminder}
        event={event}
        existingReminder={existingReminder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing['3xl'],
  },
  categoryHeader: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  categoryName: {
    ...typography.textStyles.label,
    color: colors.text.inverse,
    letterSpacing: 1,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text.primary,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  infoText: {
    ...typography.textStyles.body,
    color: colors.text.primary,
  },
  descriptionSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.grayLight,
  },
  descriptionTitle: {
    ...typography.textStyles.label,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  reminderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal + '15',
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  reminderStatusIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  reminderStatusContent: {
    flex: 1,
  },
  reminderStatusTitle: {
    ...typography.textStyles.h5,
    color: colors.teal,
  },
  reminderStatusText: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
  },
  reminderEditButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.teal,
    borderRadius: borderRadius.md,
  },
  reminderEditButtonText: {
    ...typography.textStyles.buttonSmall,
    color: colors.text.inverse,
  },
  actionBar: {
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.grayLight,
    ...shadows.md,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.grayLighter,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  reminderButtonActive: {
    backgroundColor: colors.teal,
  },
  reminderButtonIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  reminderButtonText: {
    ...typography.textStyles.button,
    color: colors.text.primary,
  },
  reminderButtonTextActive: {
    color: colors.text.inverse,
  },
});
