// Timeline View Calculations
// Date range, positioning, and scale utility functions

import { startOfDay, subWeeks, addMonths, addDays, addWeeks } from 'date-fns';
import type { ZoomLevel, Granularity, EventPosition, TimelineEventCard, CardVariant, CardConfig, ClusteredEventInfo } from '../types/timeline';

// Constants
export const EVENT_CARD_HEIGHT = 80; // pixels
export const STACK_SPACING = 8; // pixels between stacked cards
export const MAX_STACK_COUNT = 10; // Maximum events to stack before showing overflow indicator
export const CATEGORY_HEADER_WIDTH_PX = 192; // Match Tailwind w-48 (12rem = 192px)
export const TIMELINE_END_BUFFER_PX = 150; // Buffer at end of timeline to ensure last-day events are fully visible

// Zoom level to granularity mapping
export const ZOOM_TO_GRANULARITY: Record<ZoomLevel, Granularity> = {
  day: 'hour',      // Day view shows hourly ticks
  week: 'day',      // Week view shows daily ticks
  month: 'week',    // Month view shows weekly ticks
  quarter: 'month', // Quarter view shows monthly ticks
  year: 'month'     // Year view shows monthly ticks
};

// Zoom level to card variant mapping
export const ZOOM_TO_CARD_VARIANT: Record<ZoomLevel, CardVariant> = {
  day: 'full',      // Full cards with all details
  week: 'mini',     // Mini cards with title + priority dot
  month: 'mini',    // Mini cards for better scanability (changed from dot)
  quarter: 'dot',   // Compact dots with tooltip
  year: 'dot'       // Compact dots with tooltip
};

// Card configuration for each variant
export const CARD_CONFIGS: Record<CardVariant, CardConfig> = {
  full: {
    variant: 'full',
    width: 120,
    height: 80,
    stackOffsetX: 15,
    stackOffsetY: 30
  },
  mini: {
    variant: 'mini',
    width: 80,
    height: 40,
    stackOffsetX: 10,
    stackOffsetY: 20
  },
  dot: {
    variant: 'dot',
    width: 24,
    height: 24,
    stackOffsetX: 10,
    stackOffsetY: 12
  }
};

/**
 * Get card variant based on zoom level
 */
export function getCardVariant(zoomLevel: ZoomLevel): CardVariant {
  return ZOOM_TO_CARD_VARIANT[zoomLevel];
}

/**
 * Get card configuration based on variant
 */
export function getCardConfig(variant: CardVariant): CardConfig {
  return CARD_CONFIGS[variant];
}

/**
 * Get card configuration directly from zoom level
 */
export function getCardConfigForZoom(zoomLevel: ZoomLevel): CardConfig {
  const variant = getCardVariant(zoomLevel);
  return getCardConfig(variant);
}

/**
 * Parse a date string as local midnight
 * Handles both YYYY-MM-DD format and full ISO strings with timezone
 * @param dateString Date string in YYYY-MM-DD format or ISO string
 * @returns Date object at local midnight
 */
function parseLocalDate(dateString: string): Date {
  // Check if it's a full ISO string with time component
  if (dateString.includes('T')) {
    // Parse the full ISO string first to get correct local date
    const date = new Date(dateString);
    // Extract local date components (not UTC!)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Return local midnight of the local date
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  // For date-only strings (YYYY-MM-DD), append T00:00:00 for local interpretation
  return new Date(dateString + 'T00:00:00');
}

/**
 * Calculate date range for timeline based on actual events
 * Padding: 2 weeks before earliest event, 1 month after latest event
 * Returns null if no events exist
 */
export function calculateEventBasedDateRange(events: any[]): { startDate: Date; endDate: Date } | null {
  if (!events || events.length === 0) {
    return null; // Signal empty state
  }

  // Find earliest and latest event dates (parse as local midnight to avoid timezone shifts)
  const eventDates = events.map(e => parseLocalDate(e.date));
  const earliestDate = new Date(Math.min(...eventDates.map(d => d.getTime())));
  const latestDate = new Date(Math.max(...eventDates.map(d => d.getTime())));

  // Add padding: 2 weeks before first, 1 month after last
  const startDate = subWeeks(startOfDay(earliestDate), 2);
  const endDate = addMonths(startOfDay(latestDate), 1);

  return { startDate, endDate };
}

/**
 * Get pixels per day based on zoom level and visual scale
 * Base scales:
 * - Day: 100px/day
 * - Week: 20px/day
 * - Month: 5px/day
 * - Quarter: 2px/day
 * - Year: 1px/day
 */
export function getPixelsPerDay(zoomLevel: ZoomLevel, visualScale: number = 1.0): number {
  const baseScales: Record<ZoomLevel, number> = {
    day: 100,
    week: 20,
    month: 5,
    quarter: 2,
    year: 1
  };

  return baseScales[zoomLevel] * visualScale;
}

/**
 * Calculate total timeline width in pixels
 * Uses millisecond-based calculation for consistency with event positioning
 */
export function calculateTimelineWidth(
  startDate: Date,
  endDate: Date,
  pixelsPerDay: number
): number {
  const totalMs = endDate.getTime() - startDate.getTime();
  const totalDays = totalMs / (1000 * 60 * 60 * 24);
  return totalDays * pixelsPerDay;
}

/**
 * Calculate X position for an event based on its date
 * Uses linear interpolation with UTC millisecond timestamps
 * Consistent millisecond-based calculation for precise alignment
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

  // Calculate using consistent millisecond-based math
  const totalMs = endMs - startMs;
  const eventOffset = clampedEventMs - startMs;
  const totalDays = totalMs / (1000 * 60 * 60 * 24);
  const totalWidth = totalDays * pixelsPerDay;

  return (eventOffset / totalMs) * totalWidth;
}

/**
 * Calculate event card width based on duration (start time to end time)
 * Returns width in pixels based on the current timeline scale
 */
export function calculateEventWidth(
  startTime?: string,
  endTime?: string,
  pixelsPerDay: number = 20
): number {
  const DEFAULT_WIDTH = 120; // Default width for events without duration
  const MIN_WIDTH = 80; // Minimum width to ensure title readability

  // If no start or end time, use default width
  if (!startTime || !endTime) {
    return DEFAULT_WIDTH;
  }

  // Parse times (HH:MM format)
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Convert to minutes since midnight
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Calculate duration in hours
  const durationHours = (endMinutes - startMinutes) / 60;

  // If duration is invalid or negative, use default
  if (durationHours <= 0) {
    return DEFAULT_WIDTH;
  }

  // Calculate width based on duration
  // pixelsPerDay / 24 = pixelsPerHour
  const pixelsPerHour = pixelsPerDay / 24;
  const calculatedWidth = durationHours * pixelsPerHour;

  // Ensure minimum width for readability
  return Math.max(MIN_WIDTH, calculatedWidth);
}

/**
 * Calculate event positions with cascading stack layout
 * Groups events by date and positions them with diagonal cascading
 * Stack offsets are zoom-aware based on card variant
 */
export function calculateEventPositions(
  events: any[],
  startDate: Date,
  endDate: Date,
  pixelsPerDay: number,
  zoomLevel: ZoomLevel = 'month'
): TimelineEventCard[] {
  // Performance monitoring (development only)
  if (import.meta.env.MODE !== 'production') {
    performance.mark('calc-positions-start');
  }

  // Get zoom-aware card configuration for stack offsets
  const cardConfig = getCardConfigForZoom(zoomLevel);

  // Group events by date (YYYY-MM-DD format)
  const eventsByDate = new Map<string, any[]>();

  events.forEach(event => {
    // Extract date part directly from the original date string to avoid timezone issues
    // event.date can be "2025-10-21" or "2025-10-21T00:00:00.000Z"
    const dateKey = event.date.split('T')[0];

    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  const positions: TimelineEventCard[] = [];

  // Get current card variant to determine if we should cluster
  const variant = getCardVariant(zoomLevel);
  const shouldCluster = variant === 'dot';

  // Process each date group
  eventsByDate.forEach((dateEvents, dateKey) => {
    // Parse as local midnight to ensure consistent timezone handling
    const eventDate = parseLocalDate(dateEvents[0].date);
    // Calculate X position for the date (this is the left edge position, not center)
    const dateX = calculateEventX(eventDate, startDate, endDate, pixelsPerDay);

    // Calculate date-based z-index: later dates get higher z-index so they appear on top when overlapping
    const daysFromStart = Math.max(0, Math.floor((eventDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dateZIndexOffset = daysFromStart * 10; // 10 z-index units per day

    // Sort by time (earliest first)
    const sortedEvents = [...dateEvents].sort((a, b) => {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });

    // For dot variant: cluster all events on same date into a single dot with count badge
    if (shouldCluster && sortedEvents.length > 1) {
      // Create clustered event info for tooltip
      const clusteredEvents: ClusteredEventInfo[] = sortedEvents.map(event => ({
        eventId: event.id,
        title: event.title,
        priority: event.priority,
        status: event.status
      }));

      // Use first event's priority for the cluster color (or highest priority)
      const highestPriority = sortedEvents.reduce((highest, event) => {
        const priorityRank = { High: 3, Medium: 2, Low: 1 };
        return priorityRank[event.priority as keyof typeof priorityRank] > priorityRank[highest as keyof typeof priorityRank]
          ? event.priority
          : highest;
      }, sortedEvents[0].priority);

      // Create single cluster position
      positions.push({
        eventId: `cluster-${dateKey}`,
        title: sortedEvents[0].title, // First event title for fallback
        date: eventDate,
        time: sortedEvents[0].time,
        priority: highestPriority,
        status: sortedEvents[0].status,
        categoryColor: sortedEvents[0].categoryColor || '#6366f1',
        xPosition: dateX,
        yPosition: 0,
        position: 'above',
        stackIndex: 0,
        zIndex: 15 + dateZIndexOffset, // Later dates have higher z-index
        width: cardConfig.width,
        isCluster: true,
        clusterCount: sortedEvents.length,
        clusteredEvents
      });
      return; // Skip individual event processing for this date
    }

    const maxVisible = 10; // Maximum events to show before overflow

    // Position events with overlapping vertical stacks
    const eventsToShow = sortedEvents.slice(0, maxVisible);

    const totalCardsInStack = eventsToShow.length;

    eventsToShow.forEach((event, index) => {
      // Cascading stack: BOTTOM card is in FRONT (highest z-index)
      // Each card above it is positioned higher but with LOWER z-index (behind)
      const stackIndex = index; // First card = 0 (bottom/front), last card = 3 (top/back)

      // Diagonal cascade: each card shifts right AND up from previous card
      // Use zoom-aware stack offsets from card config
      const xPosition = dateX + (stackIndex * cardConfig.stackOffsetX);
      const yOffset = stackIndex * cardConfig.stackOffsetY; // Higher cards offset more

      // z-index: later dates on top, within same date bottom card has highest
      const zIndex = 10 + dateZIndexOffset + (totalCardsInStack - stackIndex);

      // All cards positioned above centerline for cascading downward effect
      const position: EventPosition = 'above';

      // Calculate card width based on duration (or use zoom-aware default)
      const width = calculateEventWidth(event.time, event.endTime, pixelsPerDay) || cardConfig.width;

      positions.push({
        eventId: event.id,
        title: event.title.substring(0, 50), // Truncate to 50 chars
        date: eventDate,
        time: event.time,
        priority: event.priority,
        status: event.status,
        categoryColor: event.categoryColor || '#6366f1', // fallback color
        xPosition, // Left edge aligned with date position
        yPosition: yOffset,
        position,
        stackIndex,
        zIndex,
        width
      });
    });

    // Add overflow indicator if there are more events than maxVisible
    if (sortedEvents.length > maxVisible) {
      const overflowCount = sortedEvents.length - maxVisible;

      // Position overflow at top of cascade (use zoom-aware offsets)
      const stackIndex = maxVisible; // Top of stack (highest)
      const yOffset = stackIndex * cardConfig.stackOffsetY;
      const xOffset = dateX + (stackIndex * cardConfig.stackOffsetX);

      // Overflow should have lowest z-index within its date, but still respect date ordering
      const zIndex = 10 + dateZIndexOffset + (totalCardsInStack + 1 - stackIndex);

      // Overflow indicator uses zoom-aware width
      const width = cardConfig.width;

      positions.push({
        eventId: `overflow-${dateKey}`,
        title: `+${overflowCount} more...`,
        date: eventDate,
        time: undefined,
        priority: 'Low' as const,
        status: 'Not Started' as const,
        categoryColor: '#9CA3AF', // Gray color for overflow
        xPosition: xOffset, // Left edge aligned with date position
        yPosition: yOffset,
        position: 'above',
        stackIndex,
        zIndex,
        width
      });
    }
  });

  // Performance measurement (development only)
  if (import.meta.env.MODE !== 'production') {
    performance.mark('calc-positions-end');
    performance.measure('calc-positions', 'calc-positions-start', 'calc-positions-end');
    const measure = performance.getEntriesByName('calc-positions')[0];
    if (measure && measure.duration > 100) {
      console.warn(`⚠️ Position calculation took ${measure.duration.toFixed(2)}ms (target: <100ms)`);
    }
  }

  return positions;
}

/**
 * Generate date ticks for timeline axis based on granularity
 */
export function generateAxisTicks(
  startDate: Date,
  endDate: Date,
  granularity: Granularity,
  pixelsPerDay: number,
  visualScale: number = 1.0
): Array<{ date: Date; label: string; monthLabel?: string; x: number; isPrimary: boolean }> {
  const ticks: Array<{ date: Date; label: string; monthLabel?: string; x: number; isPrimary: boolean }> = [];
  let currentDate = new Date(startDate);
  let previousMonth: number | null = null; // Track previous tick's month

  // For Day view (hour granularity), use 6-hour intervals when visualScale <= 7.5
  const useReducedHourly = granularity === 'hour' && visualScale <= 7.5;
  const hourIncrement = useReducedHourly ? 6 : 1;

  // Determine increment function based on granularity
  const incrementFn = {
    hour: (date: Date) => new Date(date.getTime() + (hourIncrement * 60 * 60 * 1000)),
    day: (date: Date) => addDays(date, 1),
    week: (date: Date) => addWeeks(date, 1),
    month: (date: Date) => addMonths(date, 1)
  }[granularity];

  // Align start to appropriate boundary for cleaner ticks
  if (useReducedHourly) {
    // Align to nearest 6-hour mark (0, 6, 12, 18)
    const hours = currentDate.getHours();
    const alignedHour = Math.floor(hours / 6) * 6;
    currentDate = new Date(currentDate);
    currentDate.setHours(alignedHour, 0, 0, 0);
  }

  while (currentDate <= endDate) {
    const x = calculateEventX(currentDate, startDate, endDate, pixelsPerDay);

    // Format label based on granularity
    let label: string;
    let monthLabel: string | undefined;
    let isPrimary = true;

    switch (granularity) {
      case 'hour':
        label = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        if (useReducedHourly) {
          // In 6-hour mode, mark midnight and noon as primary
          isPrimary = currentDate.getHours() === 0 || currentDate.getHours() === 12;
        } else {
          // In hourly mode, mark 6-hour intervals as primary
          isPrimary = currentDate.getHours() % 6 === 0;
        }
        break;
      case 'day':
        // Always show day number
        label = currentDate.getDate().toString();
        // Show month name below on 1st
        if (currentDate.getDate() === 1) {
          monthLabel = currentDate.toLocaleDateString('en-US', { month: 'short' });
          isPrimary = true;
        } else {
          isPrimary = false;
        }
        break;
      case 'week':
        // Always show day number
        label = currentDate.getDate().toString();

        // Check if we've entered a new month (first tick of the month)
        const currentMonth = currentDate.getMonth();
        if (previousMonth === null || currentMonth !== previousMonth) {
          // This is the first tick in a new month, show month name below
          monthLabel = currentDate.toLocaleDateString('en-US', { month: 'short' });
          isPrimary = true;
          previousMonth = currentMonth;
        } else {
          isPrimary = currentDate.getDate() <= 7; // Mark first week of month
        }
        break;
      case 'month':
        // Show just the month abbreviation
        label = currentDate.toLocaleDateString('en-US', { month: 'short' });
        isPrimary = currentDate.getMonth() % 3 === 0; // Mark quarters
        break;
    }

    ticks.push({ date: currentDate, label, monthLabel, x, isPrimary });
    currentDate = incrementFn(currentDate);
  }

  return ticks;
}

/**
 * Development-only alignment validation
 * Logs console warnings when axis tick positions don't match event positions
 * @param axisTicks Array of axis tick objects with date and x position
 * @param eventPositions Array of timeline event cards with calculated positions
 * @param tolerance Acceptable pixel difference (default: 2px per SC-001)
 */
export function validateAxisEventAlignment(
  axisTicks: Array<{ date: Date; x: number }>,
  eventPositions: TimelineEventCard[],
  tolerance: number = 2
): void {
  if (import.meta.env.MODE === 'production') return;

  // Group events by date
  const eventsByDate = new Map<string, TimelineEventCard[]>();
  eventPositions.forEach(event => {
    const dateKey = event.date.toISOString().split('T')[0];
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  // Check each axis tick against events on that date
  axisTicks.forEach(tick => {
    const dateKey = tick.date.toISOString().split('T')[0];
    const eventsOnDate = eventsByDate.get(dateKey);

    if (eventsOnDate && eventsOnDate.length > 0) {
      // Check bottom-most event (stackIndex 0)
      const bottomEvent = eventsOnDate.find(e => e.stackIndex === 0);
      if (bottomEvent) {
        const drift = Math.abs(tick.x - bottomEvent.xPosition);
        if (drift > tolerance) {
          console.warn(
            `⚠️ Alignment drift detected on ${dateKey}:`,
            `\n  Axis tick X: ${tick.x.toFixed(2)}px`,
            `\n  Event X: ${bottomEvent.xPosition.toFixed(2)}px`,
            `\n  Drift: ${drift.toFixed(2)}px (tolerance: ±${tolerance}px)`,
            `\n  Event:`, bottomEvent.title
          );
        }
      }
    }
  });
}
