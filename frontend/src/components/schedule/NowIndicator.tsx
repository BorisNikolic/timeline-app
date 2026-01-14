/**
 * NowIndicator - Current time vertical line for Festival Schedule
 */

import { useEffect, useState } from 'react';
import { NowIndicatorProps } from './types';
import { getCurrentTimeDecimal } from './utils';

export default function NowIndicator({ config }: NowIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeDecimal());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeDecimal());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate position
  const hoursFromStart = currentTime - config.dayStartHour;

  // Don't render if outside visible range
  if (hoursFromStart < 0 || currentTime >= config.dayEndHour) {
    return null;
  }

  const leftPx = hoursFromStart * config.pixelsPerHour;

  // Format current time for label
  const hours = Math.floor(currentTime);
  const minutes = Math.round((currentTime - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeLabel = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;

  return (
    <div
      className="absolute top-0 bottom-0 z-20 pointer-events-none"
      style={{ left: `${leftPx}px` }}
    >
      {/* Time label at top */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded whitespace-nowrap">
        {timeLabel}
      </div>

      {/* Vertical line */}
      <div className="w-0.5 h-full bg-red-500" />

      {/* Triangle indicator at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #ef4444',
        }}
      />
    </div>
  );
}
