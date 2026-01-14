/**
 * Pyramid Festival Theme
 *
 * Main theme export combining colors, typography, and spacing
 * Usage: import { theme, colors, typography } from './theme';
 */

import colors from './colors';
import typography from './typography';
import spacingModule from './spacing';

const { spacing, borderRadius, shadows, layout } = spacingModule;

// Combined theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
};

// Re-export individual modules
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadows, layout } from './spacing';

// Common component styles
export const componentStyles = {
  // Primary button (teal)
  buttonPrimary: {
    backgroundColor: colors.primary.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
    ...shadows.md,
  },
  buttonPrimaryText: {
    color: colors.neutral.white,
    ...typography.textStyles.button,
  },

  // Secondary button (outline)
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary.teal,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
  },
  buttonSecondaryText: {
    color: colors.primary.teal,
    ...typography.textStyles.button,
  },

  // Accent button (coral)
  buttonAccent: {
    backgroundColor: colors.accent.coral,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
    ...shadows.md,
  },
  buttonAccentText: {
    color: colors.neutral.white,
    ...typography.textStyles.button,
  },

  // Card styles
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  cardDark: {
    backgroundColor: colors.background.cardDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.lg,
  },

  // Input styles
  input: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.grayLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: layout.inputHeight,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
  },
  inputFocused: {
    borderColor: colors.primary.teal,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },

  // Container styles
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  screenContainerDark: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  contentContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.neutral.grayLightest,
    marginVertical: spacing.md,
  },
  dividerDark: {
    height: 1,
    backgroundColor: colors.alpha.white20,
    marginVertical: spacing.md,
  },
};

export default theme;
