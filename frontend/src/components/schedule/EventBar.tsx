/**
 * EventBar - Horizontal event bar for Festival Schedule
 * Width = duration, position = start time
 */

import { EventBarProps } from './types';
import { formatTimeForDisplay } from './utils';

export default function EventBar({ event, config, onClick }: EventBarProps) {
  const { leftPx = 0, widthPx = config.pixelsPerHour } = event;

  // Determine if bar is wide enough to show full content
  const isCompact = widthPx < 120;
  const isVeryCompact = widthPx < 60;

  // Format time range
  const timeRange = event.time && event.endTime
    ? `${formatTimeForDisplay(event.time)} - ${formatTimeForDisplay(event.endTime)}`
    : event.time
      ? formatTimeForDisplay(event.time)
      : '';

  return (
    <div
      className="absolute rounded-md cursor-pointer transition-all duration-150 hover:brightness-110 hover:shadow-md overflow-hidden group"
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        height: `${config.eventBarHeight}px`,
        backgroundColor: event.categoryColor || '#6366f1',
      }}
      onClick={onClick}
      title={`${event.title}\n${timeRange}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Content container */}
      <div className="h-full flex flex-col justify-center px-2 py-1 text-white">
        {/* Event title */}
        <span
          className={`font-medium truncate ${isCompact ? 'text-xs' : 'text-sm'}`}
        >
          {event.title}
        </span>

        {/* Time range (hidden on very compact bars) */}
        {!isVeryCompact && timeRange && (
          <span className="text-xs opacity-80 truncate">
            {timeRange}
          </span>
        )}
      </div>

      {/* Hover indicator */}
      <div
        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
