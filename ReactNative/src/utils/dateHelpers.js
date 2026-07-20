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

// Sets starting before this hour count as the previous night's tail, not a new
// festival day (e.g. a 00:00 closing after-party belongs to the last day).
const NIGHT_CUTOFF_H = 6;

/**
 * Festival days for display/navigation: the unique event dates, minus any trailing
 * date that has NO daytime/evening programme (only after-midnight sets). Such a
 * date is the tail of the previous night — e.g. a lone 00:00 "after party" dated on
 * the next calendar day — and must not show up as its own festival day (which would
 * both stretch the headline range and misplace the 3·6·9 closing anchor).
 * Mid-festival late-night sets (dated on their own day) are left untouched.
 */
export function getFestivalDays(events) {
  const days = getUniqueDates(events);
  if (!events || days.length < 2) return days;
  const hasDaytime = (dayDate) => {
    const key = formatDateForApi(dayDate);
    return events.some(e => {
      if ((e.date || '').split('T')[0] !== key) return false;
      const h = parseInt((e.time || '12:00').split(':')[0], 10);
      return h >= NIGHT_CUTOFF_H;
    });
  };
  const out = [...days];
  while (out.length >= 2 && !hasDaytime(out[out.length - 1])) out.pop();
  return out;
}

/**
 * Format a festival date range from a sorted Date[] (e.g. "3 – 9 August 2026").
 */
export function formatDateRange(dates) {
  if (!dates || !dates.length) return '';
  const a = dates[0];
  const b = dates[dates.length - 1];
  if (dates.length === 1) return format(a, 'd MMMM yyyy');
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const sameYear = a.getFullYear() === b.getFullYear();
  if (sameMonth) return `${format(a, 'd')} – ${format(b, 'd MMMM yyyy')}`;
  if (sameYear) return `${format(a, 'd MMM')} – ${format(b, 'd MMM yyyy')}`;
  return `${format(a, 'd MMM yyyy')} – ${format(b, 'd MMM yyyy')}`;
}

/**
 * The three "power days" (3·6·9 motif) anchored to the festival's first, middle,
 * and last day. Returns a map of `yyyy-MM-dd` -> label.
 */
export function getPowerDays(dates) {
  const out = {};
  if (!dates || !dates.length) return out;
  const key = d => format(d, 'yyyy-MM-dd');
  const last = dates.length - 1;
  out[key(dates[0])] = 'Opening';
  out[key(dates[last])] = 'Closing';
  const mid = key(dates[Math.floor(last / 2)]);
  if (dates.length >= 3 && !out[mid]) out[mid] = 'Solstice';
  return out;
}

// Re-export date-fns utilities we use
export { isToday, isSameDay, addDays, subDays };
