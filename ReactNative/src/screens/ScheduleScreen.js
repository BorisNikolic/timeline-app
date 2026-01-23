/**
 * ScheduleScreen - Main event list with day picker, filters, and happening now
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

import DayPicker from '../components/DayPicker';
import StageFilter from '../components/StageFilter';
import HappeningNow from '../components/HappeningNow';
import EventCard from '../components/EventCard';
import ReminderPicker from '../components/ReminderPicker';
import OfflineFirstLaunch from '../components/OfflineFirstLaunch';

import { useTimelineEvents, useCategories, useEventsForDate, useHappeningNow } from '../hooks/useEvents';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useReminders } from '../hooks/useReminders';
import { useNetwork } from '../contexts/NetworkContext';
import { groupEventsByHour, getUniqueDates, isToday, parseDate, isSameDay } from '../utils/dateHelpers';
import { TIMELINE_ID } from '../utils/constants';

export default function ScheduleScreen({ navigation }) {
  // State - use hardcoded timeline ID
  const timelineId = TIMELINE_ID;
  const [selectedDate, setSelectedDate] = useState(null); // Will be set once events load
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedEventForReminder, setSelectedEventForReminder] = useState(null);

  // Current time for live updates
  const currentTime = useCurrentTime();

  // Network state for offline handling
  const { isConnected, isInternetReachable } = useNetwork();
  const isOffline = !isConnected || !isInternetReachable;

  // API queries using hardcoded timeline ID
  const { data: events, isLoading: eventsLoading, isError, error, refetch: refetchEvents } = useTimelineEvents(timelineId);
  const { data: categories } = useCategories(timelineId);

  // Reminders
  const { hasReminder, getReminder, setReminder, removeReminder } = useReminders();

  // Get unique dates with events
  const availableDates = useMemo(() => {
    if (!events) return [];
    return getUniqueDates(events);
  }, [events]);

  // Smart initial date selection once events load
  useEffect(() => {
    if (availableDates.length > 0 && selectedDate === null) {
      const today = new Date();
      const firstDay = availableDates[0];
      const lastDay = availableDates[availableDates.length - 1];

      // Check if today has events in the festival
      const todayHasEvents = availableDates.some(d => isSameDay(d, today));

      if (todayHasEvents) {
        // Today is a festival day with events - select it
        setSelectedDate(today);
      } else {
        // Today is not a festival day - default to first festival day
        setSelectedDate(firstDay);
      }
    }
  }, [availableDates, selectedDate]);

  // Filter events for selected date and category
  const filteredEvents = useEventsForDate(events, selectedDate, selectedCategoryId);

  // Enrich events with category info
  const enrichedEvents = useMemo(() => {
    if (!filteredEvents || !categories) return [];
    return filteredEvents.map(event => {
      const category = categories.find(c => c.id === event.categoryId);
      return {
        ...event,
        categoryName: category?.name || 'Event',
        categoryColor: category?.color || colors.teal,
      };
    });
  }, [filteredEvents, categories]);

  // Group events by hour for section list
  const sections = useMemo(() => groupEventsByHour(enrichedEvents), [enrichedEvents]);

  // Get happening now events
  const happeningNowEvents = useMemo(() => {
    if (!events || !categories || !isToday(selectedDate)) return [];
    const live = useHappeningNow(events, currentTime);
    return live.map(event => {
      const category = categories.find(c => c.id === event.categoryId);
      return {
        ...event,
        categoryName: category?.name || 'Event',
        categoryColor: category?.color || colors.teal,
      };
    });
  }, [events, categories, currentTime, selectedDate]);

  // Handlers
  const handleEventPress = useCallback((event) => {
    navigation.navigate('EventDetail', { event });
  }, [navigation]);

  const handleReminderPress = useCallback((event) => {
    setSelectedEventForReminder(event);
    setReminderModalVisible(true);
  }, []);

  const handleSetReminder = useCallback(async (minutes) => {
    if (selectedEventForReminder) {
      try {
        await setReminder(selectedEventForReminder, minutes);
      } catch (error) {
        console.error('Error setting reminder:', error);
      }
    }
  }, [selectedEventForReminder, setReminder]);

  const handleRemoveReminder = useCallback(async () => {
    if (selectedEventForReminder) {
      try {
        await removeReminder(selectedEventForReminder.id);
      } catch (error) {
        console.error('Error removing reminder:', error);
      }
    }
  }, [selectedEventForReminder, removeReminder]);

  // Offline first launch - no cached data and offline
  if (!events && isError && isOffline) {
    return <OfflineFirstLaunch onRetry={refetchEvents} />;
  }

  // Loading state - show while events are loading or date is being determined
  if (eventsLoading && !events) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  // Waiting for date selection after events loaded
  if (selectedDate === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Day picker */}
      <DayPicker
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        availableDates={availableDates}
      />

      {/* Happening now banner (only on today) */}
      <HappeningNow
        events={happeningNowEvents}
        onEventPress={handleEventPress}
        currentTime={currentTime}
      />

      {/* Stage filter */}
      <StageFilter
        categories={categories || []}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
      />

      {/* Event list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => handleEventPress(item)}
            hasReminder={hasReminder(item.id)}
            onReminderPress={() => handleReminderPress(item)}
            currentTime={currentTime}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>No events scheduled</Text>
            <Text style={styles.emptyListSubtext}>for this day</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={eventsLoading}
            onRefresh={refetchEvents}
            tintColor={colors.teal}
          />
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
      />

      {/* Reminder picker modal */}
      <ReminderPicker
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onSetReminder={handleSetReminder}
        onRemoveReminder={handleRemoveReminder}
        event={selectedEventForReminder}
        existingReminder={selectedEventForReminder ? getReminder(selectedEventForReminder.id) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.screen,
  },
  loadingText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.screen,
  },
  emptyText: {
    ...typography.textStyles.h4,
    color: colors.text.secondary,
  },
  sectionHeader: {
    backgroundColor: colors.background.screen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grayLight,
  },
  sectionHeaderText: {
    ...typography.textStyles.label,
    color: colors.text.tertiary,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyListText: {
    ...typography.textStyles.h4,
    color: colors.text.tertiary,
  },
  emptyListSubtext: {
    ...typography.textStyles.body,
    color: colors.text.tertiary,
  },
});
