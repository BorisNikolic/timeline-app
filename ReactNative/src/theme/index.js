/**
 * Pyramid Festival Theme
 *
 * Main theme export combining colors, typography, and spacing
 * Usage: import { theme, colors, typography } from './theme';
 */

import colorsModule from './colors';
import typographyModule from './typography';
import spacingModule from './spacing';

const { spacing, borderRadius, shadows, layout } = spacingModule;

// Export individual modules with explicit references
export const colors = colorsModule;
export const typography = typographyModule;
export { spacing, borderRadius, shadows, layout };

// Combined theme object
export const theme = {
  colors: colorsModule,
  typography: typographyModule,
  spacing,
  borderRadius,
  shadows,
  layout,
};

// Common component styles
export const componentStyles = {
  // Primary button (teal)
  buttonPrimary: {
    backgroundColor: colorsModule.primary.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
    ...shadows.md,
  },
  buttonPrimaryText: {
    color: colorsModule.neutral.white,
    ...typographyModule.textStyles.button,
  },

  // Secondary button (outline)
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colorsModule.primary.teal,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
  },
  buttonSecondaryText: {
    color: colorsModule.primary.teal,
    ...typographyModule.textStyles.button,
  },

  // Accent button (coral)
  buttonAccent: {
    backgroundColor: colorsModule.accent.coral,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
    ...shadows.md,
  },
  buttonAccentText: {
    color: colorsModule.neutral.white,
    ...typographyModule.textStyles.button,
  },

  // Card styles
  card: {
    backgroundColor: colorsModule.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  cardDark: {
    backgroundColor: colorsModule.background.cardDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.lg,
  },

  // Input styles
  input: {
    backgroundColor: colorsModule.neutral.white,
    borderWidth: 1,
    borderColor: colorsModule.neutral.grayLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: layout.inputHeight,
    fontSize: typographyModule.fontSizes.md,
    color: colorsModule.text.primary,
  },
  inputFocused: {
    borderColor: colorsModule.primary.teal,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colorsModule.semantic.error,
  },

  // Container styles
  screenContainer: {
    flex: 1,
    backgroundColor: colorsModule.background.light,
  },
  screenContainerDark: {
    flex: 1,
    backgroundColor: colorsModule.background.dark,
  },
  contentContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colorsModule.neutral.grayLightest,
    marginVertical: spacing.md,
  },
  dividerDark: {
    height: 1,
    backgroundColor: colorsModule.alpha.white20,
    marginVertical: spacing.md,
  },
};

export default theme;
