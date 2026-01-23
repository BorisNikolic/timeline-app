/**
 * EventCard - Displays a single event in the schedule list
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { formatTime, formatTimeUntil, getMinutesUntilEvent, isEventHappeningNow } from '../utils/dateHelpers';

export default function EventCard({
  event,
  onPress,
  hasReminder = false,
  onReminderPress,
  currentTime,
}) {
  const isLive = isEventHappeningNow(event, currentTime);
  const minutesUntil = getMinutesUntilEvent(event, currentTime);
  const timeUntilText = formatTimeUntil(minutesUntil);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isLive && styles.containerLive,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Category color indicator */}
      <View
        style={[
          styles.categoryIndicator,
          { backgroundColor: event.categoryColor || colors.teal },
        ]}
      />

      {/* Event content */}
      <View style={styles.content}>
        {/* Header row with category and time until */}
        <View style={styles.headerRow}>
          <Text style={styles.categoryName} numberOfLines={1}>
            {event.categoryName || 'Event'}
          </Text>
          {isLive ? (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          ) : timeUntilText ? (
            <Text style={styles.timeUntil}>{timeUntilText}</Text>
          ) : null}
        </View>

        {/* Event title */}
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Time range */}
        <Text style={styles.timeRange}>
          {formatTime(event.time)}
          {event.endTime ? ` - ${formatTime(event.endTime)}` : ''}
        </Text>
      </View>

      {/* Reminder button */}
      <TouchableOpacity
        style={styles.reminderButton}
        onPress={onReminderPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.reminderIcon, hasReminder && styles.reminderIconActive]}>
          {hasReminder ? '🔔' : '🔕'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.md,
    overflow: 'hidden',
  },
  containerLive: {
    borderWidth: 2,
    borderColor: colors.coral,
  },
  categoryIndicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.textStyles.label,
    color: colors.text.secondary,
    flex: 1,
  },
  liveBadge: {
    backgroundColor: colors.coral,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  liveBadgeText: {
    ...typography.textStyles.caption,
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.bold,
  },
  timeUntil: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
  },
  title: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timeRange: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
  },
  reminderButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  reminderIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  reminderIconActive: {
    opacity: 1,
  },
});
