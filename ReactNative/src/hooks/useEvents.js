/**
 * Hook for fetching and managing events data
 */

import { useQuery } from '@tanstack/react-query';
import { getTimelineEvents, getTimelineCategories } from '../services/api';
import { isSameDay, parseDate, getFestivalDays, isEventHappeningNow } from '../utils/dateHelpers';
import { orderAndLabelCategories } from '../utils/categoryKind';

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
    select: orderAndLabelCategories, // fixed display order + "Kids Garden" label
  });
}

/**
 * Get events filtered by date and optionally by category
 */
export function useEventsForDate(events, date, categoryId = null) {
  if (!events || !date) return [];

  // The last festival day also absorbs any trailing after-midnight tail (e.g. a
  // closing after-party dated on the following calendar day), so it stays reachable
  // even though that day isn't shown as its own pill.
  const festivalDays = getFestivalDays(events);
  const lastDay = festivalDays[festivalDays.length - 1];
  const isLast = lastDay && isSameDay(date, lastDay);

  let filtered = events.filter(event => {
    const eventDate = parseDate(event.date);
    return isSameDay(eventDate, date) || (isLast && eventDate > lastDay);
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
  // Single source of truth for "is this on right now" (overnight-safe).
  return events.filter(event => isEventHappeningNow(event, currentTime));
}
