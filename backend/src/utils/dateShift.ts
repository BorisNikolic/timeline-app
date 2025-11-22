/**
 * Date Shifting Utility
 * Feature: 001-multi-timeline-system (User Story 6)
 *
 * Calculates date offsets for copying timelines to new date ranges
 */

import { differenceInDays, addDays, parseISO, format } from 'date-fns';

/**
 * Calculate the number of days between two dates
 */
export function calculateDayOffset(
  originalStartDate: string,
  newStartDate: string
): number {
  const originalDate = parseISO(originalStartDate);
  const newDate = parseISO(newStartDate);
  return differenceInDays(newDate, originalDate);
}

/**
 * Shift a date by a given number of days
 */
export function shiftDate(dateString: string, dayOffset: number): string {
  const date = parseISO(dateString);
  const shiftedDate = addDays(date, dayOffset);
  return format(shiftedDate, 'yyyy-MM-dd');
}

/**
 * Shift multiple dates by the same offset
 */
export function shiftDates(
  dates: string[],
  dayOffset: number
): string[] {
  return dates.map((date) => shiftDate(date, dayOffset));
}

/**
 * Calculate the date range for a copied timeline
 * Preserves the original duration
 */
export function calculateNewDateRange(
  originalStartDate: string,
  originalEndDate: string,
  newStartDate: string
): { startDate: string; endDate: string } {
  const duration = differenceInDays(
    parseISO(originalEndDate),
    parseISO(originalStartDate)
  );

  const newEndDate = addDays(parseISO(newStartDate), duration);

  return {
    startDate: newStartDate,
    endDate: format(newEndDate, 'yyyy-MM-dd'),
  };
}

/**
 * Validate that the new date range is valid
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): { valid: boolean; error?: string } {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isNaN(start.getTime())) {
    return { valid: false, error: 'Invalid start date' };
  }

  if (isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid end date' };
  }

  if (end < start) {
    return { valid: false, error: 'End date must be after start date' };
  }

  return { valid: true };
}
