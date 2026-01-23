/**
 * Hook for fetching and managing events data
 */

import { useQuery } from '@tanstack/react-query';
import { getTimelineEvents, getTimelineCategories } from '../services/api';
import { isSameDay, parseDate } from '../utils/dateHelpers';

/**
 * Query key factory for consistent cache keys
 */
export const eventKeys = {
  all: ['events'],
  timeline: (id) => ['events', id],
  categories: {
    all: ['categories'],
    timeline: (id) => ['categories', id],
  },
};

/**
 * Fetch all events for a timeline
 */
export function useTimelineEvents(timelineId) {
  return useQuery({
    queryKey: eventKeys.timeline(timelineId),
    queryFn: () => getTimelineEvents(timelineId),
    enabled: !!timelineId,
    gcTime: Infinity, // Never garbage collect - keep cached data forever
    staleTime: 5 * 60 * 1000, // 5 minutes - refetch in background when online
    placeholderData: (prev) => prev, // Show stale data while refetching
  });
}

/**
 * Fetch all categories (stages) for a timeline
 */
export function useCategories(timelineId) {
  return useQuery({
    queryKey: eventKeys.categories.timeline(timelineId),
    queryFn: () => getTimelineCategories(timelineId),
    enabled: !!timelineId,
    gcTime: Infinity, // Never garbage collect - keep cached data forever
    staleTime: 30 * 60 * 1000, // 30 minutes - categories change less often
    placeholderData: (prev) => prev,
  });
}

/**
 * Get events filtered by date and optionally by category
 */
export function useEventsForDate(events, date, categoryId = null) {
  if (!events || !date) return [];

  let filtered = events.filter(event => {
    const eventDate = parseDate(event.date);
    return isSameDay(eventDate, date);
  });

  if (categoryId) {
    filtered = filtered.filter(event => event.categoryId === categoryId);
  }

  // Sort by time
  return filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
}

/**
 * Get currently happening events
 */
export function useHappeningNow(events, currentTime = new Date()) {
  if (!events) return [];

  return events.filter(event => {
    const eventDate = parseDate(event.date);
    if (!isSameDay(eventDate, currentTime)) return false;

    if (!event.time || !event.endTime) return false;

    const [startHours, startMinutes] = event.time.split(':').map(Number);
    const [endHours, endMinutes] = event.endTime.split(':').map(Number);

    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentDecimal = currentHours + currentMinutes / 60;

    let startDecimal = startHours + startMinutes / 60;
    let endDecimal = endHours + endMinutes / 60;

    // Handle overnight events
    if (endDecimal < startDecimal) {
      endDecimal += 24;
      if (currentDecimal < startDecimal) {
        return currentDecimal + 24 >= startDecimal && currentDecimal + 24 <= endDecimal;
      }
    }

    return currentDecimal >= startDecimal && currentDecimal <= endDecimal;
  });
}
