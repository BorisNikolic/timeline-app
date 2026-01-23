/**
 * DayPicker - Navigation between days with prev/next arrows
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { formatDateShort, addDays, subDays, isToday, isSameDay } from '../utils/dateHelpers';

export default function DayPicker({
  selectedDate,
  onDateChange,
  availableDates = [],
}) {
  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleJumpToToday = () => {
    onDateChange(new Date());
  };

  // Allow navigation within festival bounds (first to last event day)
  const firstDay = availableDates.length > 0 ? availableDates[0] : null;
  const lastDay = availableDates.length > 0 ? availableDates[availableDates.length - 1] : null;

  // Compare dates without time component for proper bounds checking
  const selectedDateStart = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : null;
  const firstDayStart = firstDay ? new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate()) : null;
  const lastDayStart = lastDay ? new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate()) : null;

  const canGoPrev = selectedDateStart && firstDayStart && selectedDateStart > firstDayStart;
  const canGoNext = selectedDateStart && lastDayStart && selectedDateStart < lastDayStart;
  const isTodaySelected = isToday(selectedDate);
  const todayIsWithinTimeline = availableDates.some(d => isSameDay(d, new Date()));

  return (
    <View style={styles.container}>
      {/* Previous day button */}
      <TouchableOpacity
        style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}
        onPress={handlePrevDay}
        disabled={!canGoPrev}
      >
        <Text style={[styles.navButtonText, !canGoPrev && styles.navButtonTextDisabled]}>
          ◀
        </Text>
      </TouchableOpacity>

      {/* Current date display */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {formatDateShort(selectedDate)}
        </Text>
        {isToday(selectedDate) && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>TODAY</Text>
          </View>
        )}
      </View>

      {/* Next day button */}
      <TouchableOpacity
        style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
        onPress={handleNextDay}
        disabled={!canGoNext}
      >
        <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
          ▶
        </Text>
      </TouchableOpacity>

      {/* Jump to today button (only if today is within the festival timeline) */}
      {!isTodaySelected && todayIsWithinTimeline && (
        <TouchableOpacity style={styles.todayButton} onPress={handleJumpToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.screen,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grayLight,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.teal,
  },
  navButtonDisabled: {
    backgroundColor: colors.neutral.grayLighter,
  },
  navButtonText: {
    fontSize: 16,
    color: colors.text.inverse,
  },
  navButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  dateText: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
  },
  todayBadge: {
    backgroundColor: colors.coral,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  todayBadgeText: {
    ...typography.textStyles.caption,
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.bold,
  },
  todayButton: {
    marginLeft: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.tealLight,
    borderRadius: borderRadius.md,
  },
  todayButtonText: {
    ...typography.textStyles.buttonSmall,
    color: colors.text.inverse,
  },
});
