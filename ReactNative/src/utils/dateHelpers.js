/**
 * Date and time formatting utilities
 */

import { format, parseISO, isToday, isSameDay, addDays, subDays } from 'date-fns';

/**
 * Format time string "HH:mm" to "h:mm AM/PM"
 */
export function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Format date for display (e.g., "Mon, Aug 3")
 */
export function formatDateShort(date) {
  return format(date, 'EEE, MMM d');
}

/**
 * Format date for display (e.g., "Monday, August 3, 2026")
 */
export function formatDateLong(date) {
  return format(date, 'EEEE, MMMM d, yyyy');
}

/**
 * Format date as YYYY-MM-DD for API/comparison
 */
export function formatDateForApi(date) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse ISO date string to Date object
 */
export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  // Handle both ISO strings and YYYY-MM-DD
  const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00');
  return date;
}

/**
 * Check if event is happening now
 */
export function isEventHappeningNow(event, currentTime = new Date()) {
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
      // Current time is after midnight
      return currentDecimal + 24 >= startDecimal && currentDecimal + 24 <= endDecimal;
    }
  }

  return currentDecimal >= startDecimal && currentDecimal <= endDecimal;
}

/**
 * Get time until event starts (in minutes)
 * Returns negative if event has passed
 */
export function getMinutesUntilEvent(event, currentTime = new Date()) {
  const eventDate = parseDate(event.date);
  if (!event.time) return null;

  const [hours, minutes] = event.time.split(':').map(Number);
  const eventStart = new Date(eventDate);
  eventStart.setHours(hours, minutes, 0, 0);

  return Math.round((eventStart - currentTime) / (1000 * 60));
}

/**
 * Format "time until" for display
 */
export function formatTimeUntil(minutes) {
  if (minutes === null) return '';
  if (minutes < 0) return 'Started';
  if (minutes === 0) return 'Starting now';
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `in ${hours}h`;
  return `in ${hours}h ${mins}min`;
}

/**
 * Format "ends in" for display
 */
export function formatEndsIn(event, currentTime = new Date()) {
  if (!event.endTime) return '';

  const eventDate = parseDate(event.date);
  const [hours, minutes] = event.endTime.split(':').map(Number);
  const eventEnd = new Date(eventDate);
  eventEnd.setHours(hours, minutes, 0, 0);

  // Handle overnight events
  if (event.time) {
    const [startHours] = event.time.split(':').map(Number);
    if (hours < startHours) {
      eventEnd.setDate(eventEnd.getDate() + 1);
    }
  }

  const diffMinutes = Math.round((eventEnd - currentTime) / (1000 * 60));
  if (diffMinutes <= 0) return 'Ending now';
  if (diffMinutes < 60) return `ends in ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  if (mins === 0) return `ends in ${diffHours}h`;
  return `ends in ${diffHours}h ${mins}min`;
}

/**
 * Group events by hour for section list display
 */
export function groupEventsByHour(events) {
  const groups = {};

  events.forEach(event => {
    if (!event.time) return;
    const hour = event.time.split(':')[0];
    const hourKey = `${hour}:00`;
    if (!groups[hourKey]) {
      groups[hourKey] = [];
    }
    groups[hourKey].push(event);
  });

  // Sort by time within each group
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  });

  // Convert to array format for SectionList
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, data]) => ({
      title: formatTime(time),
      data,
    }));
}

/**
 * Get unique dates from events
 */
export function getUniqueDates(events) {
  const dateSet = new Set();
  events.forEach(event => {
    if (event.date) {
      const dateStr = event.date.split('T')[0];
      dateSet.add(dateStr);
    }
  });
  return Array.from(dateSet)
    .map(d => new Date(d + 'T00:00:00'))
    .sort((a, b) => a - b);
}

// Re-export date-fns utilities we use
export { isToday, isSameDay, addDays, subDays };
