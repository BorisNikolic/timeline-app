// Timeline View Calculations
// Date range, positioning, and scale utility functions

import { startOfDay, subWeeks, addMonths, addDays, addWeeks, differenceInDays } from 'date-fns';
import type { ZoomLevel, Granularity, EventPosition, TimelineEventCard } from '../types/timeline';

// Constants
export const EVENT_CARD_HEIGHT = 80; // pixels
export const STACK_SPACING = 8; // pixels between stacked cards

// Zoom level to granularity mapping
export const ZOOM_TO_GRANULARITY: Record<ZoomLevel, Granularity> = {
  day: 'hour',      // Day view shows hourly ticks
  week: 'day',      // Week view shows daily ticks
  month: 'week',    // Month view shows weekly ticks
  quarter: 'month'  // Quarter view shows monthly ticks
};

/**
 * Calculate default date range for timeline
 * Default: 2 weeks before today, 2 months after today
 */
export function calculateDefaultDateRange(): { startDate: Date; endDate: Date } {
  const today = startOfDay(new Date());
  const startDate = subWeeks(today, 2);
  const endDate = addMonths(today, 2);

  return { startDate, endDate };
}

/**
 * Get pixels per day based on zoom level and visual scale
 * Base scales:
 * - Day: 100px/day
 * - Week: 20px/day
 * - Month: 5px/day
 * - Quarter: 2px/day
 */
export function getPixelsPerDay(zoomLevel: ZoomLevel, visualScale: number = 1.0): number {
  const baseScales: Record<ZoomLevel, number> = {
    day: 100,
    week: 20,
    month: 5,
    quarter: 2
  };

  return baseScales[zoomLevel] * visualScale;
}

/**
 * Calculate total timeline width in pixels
 */
export function calculateTimelineWidth(
  startDate: Date,
  endDate: Date,
  pixelsPerDay: number
): number {
  const dayCount = differenceInDays(endDate, startDate);
  return dayCount * pixelsPerDay;
}

/**
 * Calculate X position for an event based on its date
 * Uses linear interpolation with UTC millisecond timestamps
 */
export function calculateEventX(
  eventDate: Date,
  startDate: Date,
  endDate: Date,
  pixelsPerDay: number
): number {
  const eventMs = eventDate.getTime();
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  // Clamp event to timeline boundaries
  const clampedEventMs = Math.max(startMs, Math.min(eventMs, endMs));

  // Calculate position as fraction of total range
  const normalizedPosition = (clampedEventMs - startMs) / (endMs - startMs);

  // Convert to pixels
  const dayCount = differenceInDays(endDate, startDate);
  const totalWidth = dayCount * pixelsPerDay;

  return normalizedPosition * totalWidth;
}

/**
 * Calculate event positions with stacking logic
 * Groups events by date, alternates above/below, stacks same-date events
 */
export function calculateEventPositions(
  events: any[],
  startDate: Date,
  endDate: Date,
  pixelsPerDay: number
): TimelineEventCard[] {
  // Group events by date (YYYY-MM-DD format)
  const eventsByDate = new Map<string, any[]>();

  events.forEach(event => {
    const eventDate = new Date(event.date);
    const dateKey = eventDate.toISOString().split('T')[0];

    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  const positions: TimelineEventCard[] = [];

  // Process each date group
  eventsByDate.forEach((dateEvents, dateKey) => {
    const eventDate = new Date(dateKey);
    const xPosition = calculateEventX(eventDate, startDate, endDate, pixelsPerDay);

    // Sort by time (earliest at bottom - per clarification requirement)
    const sortedEvents = [...dateEvents].sort((a, b) => {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });

    // Calculate positions for each event in the group
    sortedEvents.forEach((event, index) => {
      // Alternate above/below centerline
      const isAbove = index % 2 === 0;
      const position: EventPosition = isAbove ? 'above' : 'below';

      // Stack index determines vertical offset
      const stackIndex = Math.floor(index / 2);
      const yOffset = stackIndex * (EVENT_CARD_HEIGHT + STACK_SPACING);

      positions.push({
        eventId: event.id,
        title: event.title.substring(0, 50), // Truncate to 50 chars
        date: eventDate,
        time: event.time,
        priority: event.priority,
        status: event.status,
        categoryColor: event.categoryColor || '#6366f1', // fallback color
        xPosition,
        yPosition: yOffset,
        position,
        stackIndex
      });
    });
  });

  return positions;
}

/**
 * Generate date ticks for timeline axis based on granularity
 */
export function generateAxisTicks(
  startDate: Date,
  endDate: Date,
  granularity: Granularity,
  pixelsPerDay: number
): Array<{ date: Date; label: string; x: number; isPrimary: boolean }> {
  const ticks: Array<{ date: Date; label: string; x: number; isPrimary: boolean }> = [];
  let currentDate = new Date(startDate);

  // Determine increment function based on granularity
  const incrementFn = {
    hour: (date: Date) => new Date(date.getTime() + 60 * 60 * 1000),
    day: (date: Date) => addDays(date, 1),
    week: (date: Date) => addWeeks(date, 1),
    month: (date: Date) => addMonths(date, 1)
  }[granularity];

  while (currentDate <= endDate) {
    const x = calculateEventX(currentDate, startDate, endDate, pixelsPerDay);

    // Format label based on granularity
    let label: string;
    let isPrimary = true;

    switch (granularity) {
      case 'hour':
        label = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        isPrimary = currentDate.getHours() % 6 === 0; // Mark 6-hour intervals
        break;
      case 'day':
        label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        isPrimary = currentDate.getDate() === 1; // Mark first of month
        break;
      case 'week':
        label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        isPrimary = currentDate.getDate() <= 7; // Mark first week of month
        break;
      case 'month':
        label = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        isPrimary = currentDate.getMonth() % 3 === 0; // Mark quarters
        break;
    }

    ticks.push({ date: currentDate, label, x, isPrimary });
    currentDate = incrementFn(currentDate);
  }

  return ticks;
}
