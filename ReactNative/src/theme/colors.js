/**
 * Pyramid Festival Color Palette
 *
 * Extracted from pyramidfestival.com design system
 * Inspired by the vibrant geometric/tribal artwork
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    navy: '#323550',        // Deep navy - main dark background
    navyDark: '#1E1E3F',    // Darker navy - header/hero background
    teal: '#4592AA',        // Primary teal - buttons, links, accents
    tealLight: '#4CADC9',   // Lighter teal - hover states, highlights
    tealBright: '#5BBAD5',  // Brightest teal - active states
  },

  // Accent Colors (from geometric artwork)
  accent: {
    coral: '#E85A4F',       // Vibrant coral/red-orange
    coralDark: '#D64A3F',   // Darker coral for pressed states
    golden: '#E9A035',      // Golden amber/yellow
    goldenLight: '#F5B94E', // Lighter gold
    cream: '#F5F0E6',       // Warm cream/off-white
    burgundy: '#8B3A3A',    // Dark burgundy (floral elements)
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    offWhite: '#F9F9F9',    // Light backgrounds
    grayLightest: '#EEEEEE',
    grayLight: '#DDDDDD',
    gray: '#999999',        // Secondary text
    grayDark: '#666666',
    charcoal: '#343434',    // Primary text on light bg
    black: '#111111',
  },

  // Semantic Colors
  semantic: {
    success: '#4CAF50',
    warning: '#E9A035',     // Using brand golden
    error: '#E85A4F',       // Using brand coral
    info: '#4592AA',        // Using brand teal
  },

  // Background Colors
  background: {
    dark: '#1E1E3F',        // Dark screens
    darkAlt: '#323550',     // Slightly lighter dark
    light: '#F9F9F9',       // Light screens
    lightAlt: '#FFFFFF',    // Pure white sections
    card: '#FFFFFF',        // Card backgrounds
    cardDark: '#2A2A4A',    // Cards on dark background
  },

  // Text Colors
  text: {
    primary: '#343434',       // Main text on light bg
    secondary: '#666666',     // Secondary text on light bg
    tertiary: '#999999',      // Tertiary/muted text
    inverse: '#FFFFFF',       // Text on dark bg
    inverseSecondary: '#EEEEEE', // Secondary text on dark bg
    accent: '#4592AA',        // Highlighted/link text
  },

  // Gradient definitions (for use with expo-linear-gradient)
  gradients: {
    navyToTeal: ['#1E1E3F', '#323550', '#4592AA'],
    coralToGolden: ['#E85A4F', '#E9A035'],
    tealFade: ['#4592AA', '#5BBAD5'],
  },

  // Transparency variants
  alpha: {
    black60: 'rgba(0, 0, 0, 0.6)',
    black40: 'rgba(0, 0, 0, 0.4)',
    black20: 'rgba(0, 0, 0, 0.2)',
    white80: 'rgba(255, 255, 255, 0.8)',
    white60: 'rgba(255, 255, 255, 0.6)',
    white20: 'rgba(255, 255, 255, 0.2)',
    teal20: 'rgba(69, 146, 170, 0.2)',
    navy80: 'rgba(30, 30, 63, 0.8)',
  },
};

// Quick access aliases
export const { primary, accent, neutral, semantic, background, text, gradients, alpha } = colors;

export default colors;
