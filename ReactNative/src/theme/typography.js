/**
 * Pyramid Festival Typography
 *
 * Based on pyramidfestival.com which uses Open Sans
 * For React Native, we'll use system fonts with similar characteristics
 * or can load custom fonts via expo-font
 */

import { Platform } from 'react-native';

// Font families
// Note: To use Open Sans, install expo-google-fonts:
// npx expo install @expo-google-fonts/open-sans expo-font
export const fontFamilies = {
  // System font stacks (works out of the box)
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),

  // Custom font names (after loading with expo-font)
  // Uncomment after installing @expo-google-fonts/open-sans
  // openSansRegular: 'OpenSans_400Regular',
  // openSansMedium: 'OpenSans_500Medium',
  // openSansSemiBold: 'OpenSans_600SemiBold',
  // openSansBold: 'OpenSans_700Bold',
};

// Font weights
export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Font sizes (using a modular scale)
export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

// Line heights (relative to font size)
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// Letter spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

// Pre-defined text styles
export const textStyles = {
  // Headings
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.xl * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Body text
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  bodySmall: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.normal,
  },

  // UI text
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.md * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.sm * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
  },

  // Special styles
  hero: {
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
    letterSpacing: letterSpacing.wide,
  },
  link: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    textDecorationLine: 'underline',
  },
};

export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  textStyles,
};

export default typography;
