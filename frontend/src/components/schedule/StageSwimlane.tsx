/**
 * StageSwimlane - Single stage/category row for Festival Schedule
 * Contains event bars positioned by start time
 */

import { StageSwimlaneProps } from './types';
import { getTimelineWidth } from './utils';
import EventBar from './EventBar';

export default function StageSwimlane({
  categoryName,
  categoryColor,
  events,
  config,
  onEventClick,
}: StageSwimlaneProps) {
  const timelineWidth = getTimelineWidth(config);

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="flex border-b border-gray-200">
      {/* Stage label (sticky left) */}
      <div
        className="sticky left-0 z-10 w-40 flex-shrink-0 flex items-center px-3 py-2 border-r border-gray-200 backdrop-blur-sm"
        style={{
          backgroundColor: `${categoryColor}40`, // 40 = ~25% opacity for more visibility
        }}
      >
        <div
          className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
        <span className="text-sm font-medium text-gray-900 truncate">
          {categoryName}
        </span>
      </div>

      {/* Timeline area with events */}
      <div
        className="relative bg-gray-50 flex-1"
        style={{
          minWidth: `${timelineWidth}px`,
          minHeight: `${config.swimlaneHeight}px`,
        }}
      >
        {/* Event bars */}
        <div
          className="absolute inset-0 flex items-center"
          style={{ padding: `${(config.swimlaneHeight - config.eventBarHeight) / 2}px 0` }}
        >
          {sortedEvents.map((event) => (
            <EventBar
              key={event.id}
              event={event}
              config={config}
              onClick={() => onEventClick(event)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
