/**
 * Pyramid Festival Spacing & Layout
 *
 * Consistent spacing system using an 8px base grid
 */

// Base spacing unit (8px)
const BASE = 8;

// Spacing scale
export const spacing = {
  none: 0,
  xs: BASE * 0.5,    // 4px
  sm: BASE,          // 8px
  md: BASE * 2,      // 16px
  lg: BASE * 3,      // 24px
  xl: BASE * 4,      // 32px
  '2xl': BASE * 5,   // 40px
  '3xl': BASE * 6,   // 48px
  '4xl': BASE * 8,   // 64px
  '5xl': BASE * 10,  // 80px
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows (iOS and Android)
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
};

// Layout constants
export const layout = {
  // Screen padding
  screenPaddingHorizontal: spacing.md,
  screenPaddingVertical: spacing.lg,

  // Component heights
  buttonHeight: 48,
  buttonHeightSmall: 36,
  inputHeight: 48,
  headerHeight: 56,
  tabBarHeight: 60,

  // Max widths
  maxContentWidth: 600,
  maxCardWidth: 400,

  // Icon sizes
  iconSizeSmall: 16,
  iconSizeMedium: 24,
  iconSizeLarge: 32,
  iconSizeXLarge: 48,
};

export default {
  spacing,
  borderRadius,
  shadows,
  layout,
};
