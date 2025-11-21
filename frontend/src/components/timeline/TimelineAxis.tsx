// TimelineAxis Component
// Horizontal date ruler with ticks based on zoom level

import React, { useMemo } from 'react';
import type { TimelineAxisProps } from '../../types/timeline';
import { generateAxisTicks, ZOOM_TO_GRANULARITY, CATEGORY_HEADER_WIDTH_PX } from '../../utils/timelineCalculations';

export const TimelineAxis: React.FC<TimelineAxisProps> = ({
  startDate,
  endDate,
  zoomLevel,
  visualScale,
  pixelsPerDay
}) => {
  // Generate ticks based on zoom level and visual scale
  const ticks = useMemo(() => {
    const granularity = ZOOM_TO_GRANULARITY[zoomLevel];
    return generateAxisTicks(startDate, endDate, granularity, pixelsPerDay, visualScale);
  }, [startDate, endDate, zoomLevel, pixelsPerDay, visualScale]);

  return (
    <div className="sticky top-0 z-30 relative h-24 bg-gray-50 border-b border-gray-200">
      {/* Tick marks and labels */}
      {ticks.map((tick, index) => (
        <div
          key={`tick-${index}-${tick.date.getTime()}`}
          className="absolute top-0 flex flex-col"
          style={{ left: `${tick.x + CATEGORY_HEADER_WIDTH_PX}px` }}
        >
          {/* Tick mark - positioned at exact x coordinate */}
          <div
            className={`
              w-px bg-gray-400
              ${tick.isPrimary ? 'h-8' : 'h-4'}
            `}
            style={{ position: 'relative', left: 0 }}
          />

          {/* Day number label - centered beneath tick mark */}
          <span
            className={`
              text-xs mt-1 whitespace-nowrap
              ${tick.isPrimary ? 'font-semibold text-gray-900' : 'text-gray-600'}
            `}
            style={{ position: 'relative', left: '0.5px', transform: 'translateX(-50%)' }}
          >
            {tick.label}
          </span>

          {/* Month label (only for 1st of month) - centered beneath tick mark */}
          {tick.monthLabel && (
            <span
              className="text-xs font-bold text-gray-900 whitespace-nowrap"
              style={{ position: 'relative', left: '0.5px', transform: 'translateX(-50%)' }}
            >
              {tick.monthLabel}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
