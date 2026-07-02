/**
 * ThemeContext — dark (default) / light theme with a persisted in-app toggle.
 *
 * const { t, mode, toggle, setMode } = useTheme();
 *   t      -> active token set (see theme/tokens.js)
 *   mode   -> 'dark' | 'light'
 *   toggle -> flip between dark/light (persisted)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../theme/tokens';

const STORAGE_KEY = '@pyramid_theme_mode';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('dark');

  // Restore persisted preference (default stays dark).
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v === 'dark' || v === 'light') setModeState(v);
    }).catch(() => {});
  }, []);

  const setMode = useCallback((next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setModeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ t: themes[mode], mode, toggle, setMode }), [mode, toggle, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

export default ThemeContext;
