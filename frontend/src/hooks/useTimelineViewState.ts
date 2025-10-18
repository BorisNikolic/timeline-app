// useTimelineViewState Hook
// Manages timeline view state with localStorage persistence

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimelineViewState, ViewMode, ZoomLevel } from '../types/timeline';

const STORAGE_KEY = 'timeline-view-state';
const SAVE_THROTTLE_MS = 150;

// Default state
const DEFAULT_STATE: TimelineViewState = {
  viewMode: 'category',
  zoomLevel: 'month',
  visualScale: 1.0,
  scrollPosition: 0,
  timestamp: Date.now()
};

/**
 * Custom hook for managing timeline view state with localStorage persistence
 * Handles view mode, zoom level, visual scale, and scroll position
 */
export function useTimelineViewState() {
  const [state, setState] = useState<TimelineViewState>(() => {
    // Load initial state from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate parsed state
        if (isValidState(parsed)) {
          return { ...parsed, timestamp: Date.now() };
        }
      }
    } catch (error) {
      console.warn('Failed to load timeline view state from localStorage:', error);
    }
    return DEFAULT_STATE;
  });

  // Throttled save to localStorage
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update state and persist
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save timeline view state to localStorage:', error);

        // Handle quota exceeded error
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          try {
            // Clear old state and retry
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          } catch (retryError) {
            console.error('Failed to save after clearing storage:', retryError);
          }
        }
      }
    }, SAVE_THROTTLE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  // Setter functions
  const setViewMode = useCallback((viewMode: ViewMode) => {
    setState(prev => ({
      ...prev,
      viewMode,
      timestamp: Date.now()
    }));
  }, []);

  const setZoomLevel = useCallback((zoomLevel: ZoomLevel) => {
    setState(prev => ({
      ...prev,
      zoomLevel,
      timestamp: Date.now()
    }));
  }, []);

  const setVisualScale = useCallback((visualScale: number) => {
    // Clamp visual scale between 0.5 and 10.0
    const clampedScale = Math.max(0.5, Math.min(10.0, visualScale));
    setState(prev => ({
      ...prev,
      visualScale: clampedScale,
      timestamp: Date.now()
    }));
  }, []);

  const setScrollPosition = useCallback((scrollPosition: number) => {
    // Ensure non-negative scroll position
    const clampedPosition = Math.max(0, scrollPosition);
    setState(prev => ({
      ...prev,
      scrollPosition: clampedPosition,
      timestamp: Date.now()
    }));
  }, []);

  // Reset to defaults
  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return {
    // State
    viewMode: state.viewMode,
    zoomLevel: state.zoomLevel,
    visualScale: state.visualScale,
    scrollPosition: state.scrollPosition,
    timestamp: state.timestamp,

    // Setters
    setViewMode,
    setZoomLevel,
    setVisualScale,
    setScrollPosition,
    reset
  };
}

/**
 * Validate that loaded state matches expected structure
 */
function isValidState(obj: any): obj is TimelineViewState {
  if (!obj || typeof obj !== 'object') return false;

  const validViewModes: ViewMode[] = ['category', 'timeline'];
  const validZoomLevels: ZoomLevel[] = ['day', 'week', 'month', 'quarter'];

  return (
    validViewModes.includes(obj.viewMode) &&
    validZoomLevels.includes(obj.zoomLevel) &&
    typeof obj.visualScale === 'number' &&
    obj.visualScale >= 0.5 &&
    obj.visualScale <= 10.0 &&
    typeof obj.scrollPosition === 'number' &&
    obj.scrollPosition >= 0
  );
}
