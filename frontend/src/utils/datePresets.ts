/**
 * Date preset utilities for quick date selection
 * Used by QuickDatePresets component (User Story 5)
 */

export interface DatePreset {
  label: string;
  daysOffset: number;
}

/**
 * Calculate date with days offset from a base date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Available date presets for quick selection
 * FR-008: Next Month uses +30 days (not calendar month)
 * Offsets are relative to the current form date (not today)
 */
export const datePresets: DatePreset[] = [
  { label: 'Today', daysOffset: 0 },
  { label: 'Tomorrow', daysOffset: 1 },
  { label: 'Next Week', daysOffset: 7 },
  { label: 'Next Month', daysOffset: 30 }
];

/**
 * Get preset date value relative to a base date
 * @param preset - The date preset
 * @param baseDate - The base date to calculate from (defaults to today)
 */
export const getPresetValue = (preset: DatePreset, baseDate?: Date): Date => {
  const base = baseDate || new Date();
  return addDays(base, preset.daysOffset);
};

/**
 * Format date as YYYY-MM-DD for API using local timezone
 * Note: Using getFullYear/getMonth/getDate to avoid UTC conversion issues
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get date preset by label
 */
export const getPresetByLabel = (label: string): DatePreset | undefined => {
  return datePresets.find(preset => preset.label === label);
};
