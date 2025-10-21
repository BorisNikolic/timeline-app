/**
 * Date preset utilities for quick date selection
 * Used by QuickDatePresets component (User Story 5)
 */

export interface DatePreset {
  label: string;
  getValue: () => Date;
}

/**
 * Calculate date with days offset
 */
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Available date presets for quick selection
 * FR-008: Next Month uses +30 days (not calendar month)
 */
export const datePresets: DatePreset[] = [
  {
    label: 'Today',
    getValue: () => new Date()
  },
  {
    label: 'Tomorrow',
    getValue: () => addDays(new Date(), 1)
  },
  {
    label: 'Next Week',
    getValue: () => addDays(new Date(), 7)
  },
  {
    label: 'Next Month',
    getValue: () => addDays(new Date(), 30) // FR-008: Use 30 days, not calendar month
  }
];

/**
 * Format date as ISO string for API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get date preset by label
 */
export const getPresetByLabel = (label: string): DatePreset | undefined => {
  return datePresets.find(preset => preset.label === label);
};
