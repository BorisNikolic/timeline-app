/**
 * ThemeToggle — floating sun/moon button (top-right) that flips light/dark.
 * variant="hero" sits over the dark hero gradient; "auto" adapts to the theme surface.
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { IconSun, IconMoon } from './Icons';

export function ThemeToggle({ variant = 'auto', style }) {
  const { t, mode, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  const onHero = variant === 'hero';
  const bg = onHero ? 'rgba(10,8,22,0.34)' : (mode === 'dark' ? 'rgba(10,8,22,0.34)' : 'rgba(255,253,248,0.78)');
  const border = onHero || mode === 'dark' ? 'rgba(247,243,234,0.26)' : t.hairlineStrong;
  const iconColor = onHero || mode === 'dark' ? '#F7F3EA' : t.ink;
  const Icon = mode === 'dark' ? IconSun : IconMoon;

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Toggle light or dark theme"
      style={[styles.btn, { top: insets.top + 6, backgroundColor: bg, borderColor: border }, style]}
    >
      <Icon size={18} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 14,
    zIndex: 25,
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default ThemeToggle;
