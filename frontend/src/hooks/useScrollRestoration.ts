// useScrollRestoration Hook
// Manages horizontal scroll position persistence with localStorage

import { useEffect, useLayoutEffect, useRef, RefObject } from 'react';

interface UseScrollRestorationOptions {
  storageKey: string;
  enabled: boolean;
  defaultPosition?: number;
  saveThrottle?: number;
}

const DEFAULT_THROTTLE_MS = 150;

/**
 * Custom hook for persisting and restoring scroll position
 * Uses useLayoutEffect for flicker-free restoration
 * Handles Safari Private Mode and quota exceeded errors
 */
export function useScrollRestoration(
  scrollContainerRef: RefObject<HTMLElement>,
  options: UseScrollRestorationOptions
) {
  const {
    storageKey,
    enabled,
    defaultPosition = 0,
    saveThrottle = DEFAULT_THROTTLE_MS
  } = options;

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // RESTORATION: useLayoutEffect (before paint, flicker-free)
  useLayoutEffect(() => {
    if (!enabled || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const savedPosition = getSavedScrollPosition(storageKey);

    if (savedPosition !== null) {
      // Restore saved position immediately (no animation)
      container.scrollTo({ left: savedPosition, behavior: 'instant' as any });
    } else if (defaultPosition !== 0) {
      // Use default position with smooth scroll
      container.scrollTo({ left: defaultPosition, behavior: 'smooth' });
    }
  }, [enabled, storageKey, defaultPosition]); // Intentionally minimal deps

  // PERSISTENCE: useEffect (after paint, throttled)
  useEffect(() => {
    if (!enabled || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;

    const handleScroll = () => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Throttle saves to avoid excessive writes
      saveTimeoutRef.current = setTimeout(() => {
        if (container) {
          saveScrollPosition(storageKey, container.scrollLeft);
        }
      }, saveThrottle);
    };

    // Use passive listener for better scroll performance
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, storageKey, saveThrottle]); // Intentionally minimal deps
}

/**
 * Get saved scroll position from localStorage
 * Returns null if not found or invalid
 */
function getSavedScrollPosition(storageKey: string): number | null {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const position = parseInt(saved, 10);
      // Validate that it's a valid number
      if (!isNaN(position) && position >= 0) {
        return position;
      }
    }
  } catch (error) {
    // Handle Safari Private Mode or other localStorage errors
    console.warn('Failed to read scroll position from localStorage:', error);
  }
  return null;
}

/**
 * Save scroll position to localStorage
 * Handles quota exceeded errors gracefully
 */
function saveScrollPosition(storageKey: string, position: number): void {
  try {
    localStorage.setItem(storageKey, position.toString());
  } catch (error) {
    console.warn('Failed to save scroll position to localStorage:', error);

    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        // Clear old scroll positions and retry
        clearOldScrollPositions();
        localStorage.setItem(storageKey, position.toString());
      } catch (retryError) {
        console.error('Failed to save scroll position after clearing storage:', retryError);
      }
    }
  }
}

/**
 * Clear old scroll position entries to free up space
 * Keeps only the most recent scroll positions
 */
function clearOldScrollPositions(): void {
  try {
    const scrollKeys: string[] = [];

    // Find all scroll position keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('scroll')) {
        scrollKeys.push(key);
      }
    }

    // Remove oldest entries (keep only last 5)
    if (scrollKeys.length > 5) {
      scrollKeys.slice(0, -5).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  } catch (error) {
    console.error('Failed to clear old scroll positions:', error);
  }
}
