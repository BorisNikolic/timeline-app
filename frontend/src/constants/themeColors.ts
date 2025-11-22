/**
 * Theme Color Constants (T109)
 * Feature: 001-multi-timeline-system
 *
 * Predefined timeline colors for consistent UI across the app
 */

export type ThemeColor = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'yellow' | 'pink' | 'teal';

// Color values for UI display
export const THEME_COLOR_VALUES: Record<ThemeColor, string> = {
  blue: '#3B82F6',
  green: '#22C55E',
  purple: '#A855F7',
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#EAB308',
  pink: '#EC4899',
  teal: '#14B8A6',
};

// Light variants for backgrounds
export const THEME_COLOR_LIGHT: Record<ThemeColor, string> = {
  blue: '#DBEAFE',
  green: '#DCFCE7',
  purple: '#F3E8FF',
  red: '#FEE2E2',
  orange: '#FFEDD5',
  yellow: '#FEF9C3',
  pink: '#FCE7F3',
  teal: '#CCFBF1',
};

// Dark variants for text/borders
export const THEME_COLOR_DARK: Record<ThemeColor, string> = {
  blue: '#1D4ED8',
  green: '#16A34A',
  purple: '#7E22CE',
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#CA8A04',
  pink: '#DB2777',
  teal: '#0D9488',
};

// Color picker options with display names
export const THEME_COLOR_OPTIONS: Array<{
  value: ThemeColor;
  label: string;
  color: string;
}> = [
  { value: 'blue', label: 'Blue', color: THEME_COLOR_VALUES.blue },
  { value: 'green', label: 'Green', color: THEME_COLOR_VALUES.green },
  { value: 'purple', label: 'Purple', color: THEME_COLOR_VALUES.purple },
  { value: 'red', label: 'Red', color: THEME_COLOR_VALUES.red },
  { value: 'orange', label: 'Orange', color: THEME_COLOR_VALUES.orange },
  { value: 'yellow', label: 'Yellow', color: THEME_COLOR_VALUES.yellow },
  { value: 'pink', label: 'Pink', color: THEME_COLOR_VALUES.pink },
  { value: 'teal', label: 'Teal', color: THEME_COLOR_VALUES.teal },
];

// Default color for new timelines
export const DEFAULT_THEME_COLOR: ThemeColor = 'blue';

// Get color value from theme color name
export function getThemeColorValue(color: ThemeColor | string): string {
  return THEME_COLOR_VALUES[color as ThemeColor] || THEME_COLOR_VALUES.blue;
}

// Get light variant from theme color name
export function getThemeColorLight(color: ThemeColor | string): string {
  return THEME_COLOR_LIGHT[color as ThemeColor] || THEME_COLOR_LIGHT.blue;
}

// Get dark variant from theme color name
export function getThemeColorDark(color: ThemeColor | string): string {
  return THEME_COLOR_DARK[color as ThemeColor] || THEME_COLOR_DARK.blue;
}
