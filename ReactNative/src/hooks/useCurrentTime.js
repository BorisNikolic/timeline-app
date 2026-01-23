/**
 * Hook for real-time current time updates
 */

import { useState, useEffect } from 'react';

/**
 * Returns current time that updates every minute
 */
export function useCurrentTime(intervalMs = 60000) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return currentTime;
}
