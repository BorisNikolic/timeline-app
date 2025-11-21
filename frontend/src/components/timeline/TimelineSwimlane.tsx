// TimelineSwimlane Component
// Category lane with positioned event cards

import React, { useMemo } from 'react';
import type { TimelineSwimlaneProps } from '../../types/timeline';
import { TimelineEventCard } from './TimelineEventCard';
import { calculateEventPositions } from '../../utils/timelineCalculations';

export const TimelineSwimlane: React.FC<TimelineSwimlaneProps> = ({
  category,
  events,
  startDate,
  endDate,
  zoomLevel,
  visualScale: _visualScale,
  pixelsPerDay,
  onEventClick
}) => {
  // Calculate positions for all events in this swimlane
  const eventPositions = useMemo(() => {
    // Add category color to events for TimelineEventCard
    const eventsWithColor = events.map(event => ({
      ...event,
      categoryColor: category.color
    }));

    return calculateEventPositions(eventsWithColor, startDate, endDate, pixelsPerDay, zoomLevel);
  }, [events, startDate, endDate, pixelsPerDay, zoomLevel, category.color]);

  // Helper function to convert hex color to rgba with opacity
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      className="relative border-b-2 border-gray-300 timeline-swimlane-bg"
      style={{
        '--swimlane-bg-color': hexToRgba(category.color, 0.03),
        minWidth: '100%'
      } as React.CSSProperties}
    >
      {/* Category header */}
      <div
        className="sticky left-0 z-20 px-4 py-3 border-r-4 w-48"
        style={{
          float: 'left',
          backgroundColor: hexToRgba(category.color, 0.1),
          borderRightColor: category.color
        }}
      >
        <div className="flex items-center gap-2">
          {/* Category color indicator */}
          <div
            className="w-5 h-5 rounded-md shadow-sm"
            style={{ backgroundColor: category.color }}
            aria-hidden="true"
          />

          {/* Category name */}
          <div>
            <div className="font-semibold text-sm text-gray-900">
              {category.name}
            </div>
            <div className="text-xs text-gray-500">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Swimlane content area (for event cards) */}
      <div
        className="relative h-48 md:h-56 lg:h-64"
        style={{
          marginLeft: 'var(--category-header-width, 192px)',
          minWidth: '100%',
          zIndex: 1
        }}
      >
        {/* Centerline */}
        <div
          className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"
          style={{ transform: 'translateY(-50%)' }}
          aria-hidden="true"
        />

        {/* Event cards */}
        {eventPositions.map((eventPos) => {
          // Check if this is an overflow indicator
          const isOverflow = eventPos.eventId.startsWith('overflow-');

          // Find original event, or use the position data for overflow indicators
          const originalEvent = isOverflow
            ? eventPos
            : events.find(e => e.id === eventPos.eventId);

          if (!originalEvent) return null;

          return (
            <TimelineEventCard
              key={eventPos.eventId}
              event={originalEvent}
              position={eventPos.position}
              xPosition={eventPos.xPosition}
              yPosition={eventPos.yPosition}
              categoryColor={category.color}
              stackIndex={eventPos.stackIndex}
              zIndex={eventPos.zIndex}
              width={eventPos.width}
              onClick={() => {
                // Don't trigger click for overflow indicators
                if (!isOverflow) {
                  onEventClick(eventPos.eventId);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
