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
  visualScale,
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

    return calculateEventPositions(eventsWithColor, startDate, endDate, pixelsPerDay);
  }, [events, startDate, endDate, pixelsPerDay, category.color]);

  return (
    <div className="relative border-b border-gray-200">
      {/* Category header */}
      <div
        className="sticky left-0 z-20 bg-white px-4 py-3 border-r border-gray-200 w-48"
        style={{ float: 'left' }}
      >
        <div className="flex items-center gap-2">
          {/* Category color indicator */}
          <div
            className="w-4 h-4 rounded"
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
      <div className="relative h-48 md:h-56 lg:h-64 ml-48">
        {/* Centerline */}
        <div
          className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"
          style={{ transform: 'translateY(-50%)' }}
          aria-hidden="true"
        />

        {/* Event cards */}
        {eventPositions.map((eventPos) => {
          const originalEvent = events.find(e => e.id === eventPos.eventId);
          if (!originalEvent) return null;

          return (
            <TimelineEventCard
              key={eventPos.eventId}
              event={originalEvent}
              position={eventPos.position}
              xPosition={eventPos.xPosition}
              yPosition={eventPos.yPosition}
              categoryColor={category.color}
              onClick={() => onEventClick(eventPos.eventId)}
            />
          );
        })}
      </div>
    </div>
  );
};
