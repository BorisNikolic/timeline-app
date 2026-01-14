/**
 * Utility functions for the Festival Schedule Gantt view
 */

import { ScheduleConfig, ScheduleEvent } from './types';
import { EventWithDetails } from '../../types/Event';

/**
 * Convert time string "HH:MM" to pixel position
 */
export function timeToPixels(time: string | undefined, config: ScheduleConfig): number {
  if (!time) return 0;

  const [hours, minutes] = time.split(':').map(Number);
  const hoursFromStart = hours - config.dayStartHour + minutes / 60;
  return Math.max(0, hoursFromStart * config.pixelsPerHour);
}

/**
 * Parse time string to decimal hours (e.g., "14:30" -> 14.5)
 */
export function timeToDecimalHours(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
}

/**
 * Check if an event is overnight (endTime < startTime means it crosses midnight)
 */
export function isOvernightEvent(startTime: string, endTime: string): boolean {
  return timeToDecimalHours(endTime) < timeToDecimalHours(startTime);
}

/**
 * Calculate event bar width from start and end times
 * Handles overnight events where endTime < startTime (crosses midnight)
 */
export function durationToWidth(
  startTime: string | undefined,
  endTime: string | undefined,
  config: ScheduleConfig
): number {
  if (!startTime || !endTime) {
    // Default width for events without duration (1 hour)
    return config.pixelsPerHour;
  }

  const startDecimal = timeToDecimalHours(startTime);
  let endDecimal = timeToDecimalHours(endTime);

  // Handle overnight events: if endTime < startTime, add 24 hours
  if (endDecimal < startDecimal) {
    endDecimal += 24;
  }

  const durationHours = endDecimal - startDecimal;
  const width = durationHours * config.pixelsPerHour;

  // Minimum width to ensure visibility
  return Math.max(width, config.pixelsPerHour / 2);
}

/**
 * Get total timeline width in pixels
 */
export function getTimelineWidth(config: ScheduleConfig): number {
  return (config.dayEndHour - config.dayStartHour) * config.pixelsPerHour;
}

/**
 * Convert events to schedule events with positioning
 */
export function toScheduleEvents(
  events: EventWithDetails[],
  config: ScheduleConfig
): ScheduleEvent[] {
  return events.map(event => ({
    ...event,
    leftPx: timeToPixels(event.time, config),
    widthPx: durationToWidth(event.time, event.endTime, config),
  }));
}

/**
 * Filter events for a specific date
 */
export function getEventsForDate(events: EventWithDetails[], date: Date): EventWithDetails[] {
  const dateStr = formatDateForComparison(date);
  return events.filter(event => {
    const eventDateStr = event.date.split('T')[0]; // Handle ISO strings
    return eventDateStr === dateStr;
  });
}

/**
 * Format date as YYYY-MM-DD for comparison
 */
export function formatDateForComparison(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (e.g., "Friday, January 20, 2025")
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display (e.g., "10:30" -> "10:30 AM")
 */
export function formatTimeForDisplay(time: string | undefined): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Get current time as decimal hours (e.g., 14.5 for 2:30 PM)
 */
export function getCurrentTimeDecimal(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

/**
 * Get hour labels for the time grid
 * Handles extended hours (24+) for overnight events
 */
export function getHourLabels(config: ScheduleConfig): { hour: number; label: string; isNextDay: boolean }[] {
  const labels: { hour: number; label: string; isNextDay: boolean }[] = [];

  for (let hour = config.dayStartHour; hour < config.dayEndHour; hour++) {
    const isNextDay = hour >= 24;
    const normalizedHour = hour % 24; // Convert 25 -> 1, 26 -> 2, etc.
    const period = normalizedHour >= 12 ? 'PM' : 'AM';
    const displayHour = normalizedHour % 12 || 12;

    labels.push({
      hour,
      label: isNextDay ? `${displayHour} AM` : `${displayHour} ${period}`,
      isNextDay,
    });
  }

  return labels;
}

/**
 * Group events by category
 */
export function groupEventsByCategory(
  events: ScheduleEvent[]
): Map<string, ScheduleEvent[]> {
  const grouped = new Map<string, ScheduleEvent[]>();

  events.forEach(event => {
    const existing = grouped.get(event.categoryId) || [];
    grouped.set(event.categoryId, [...existing, event]);
  });

  return grouped;
}

/**
 * Get all unique dates that have events
 */
export function getUniqueDatesWithEvents(events: EventWithDetails[]): Date[] {
  const dateSet = new Set<string>();

  events.forEach(event => {
    const dateStr = event.date.split('T')[0];
    dateSet.add(dateStr);
  });

  return Array.from(dateSet)
    .map(dateStr => new Date(dateStr + 'T00:00:00'))
    .sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Navigate to previous/next day
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}
