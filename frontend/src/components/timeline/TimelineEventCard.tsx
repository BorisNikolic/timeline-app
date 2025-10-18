// TimelineEventCard Component
// Compact event card with connector line for timeline view

import React from 'react';
import type { TimelineEventCardProps } from '../../types/timeline';
import '../../styles/timeline-animations.css';

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  position,
  xPosition,
  yPosition,
  categoryColor,
  onClick
}) => {
  const isAbove = position === 'above';

  return (
    <div
      className="timeline-event-card absolute"
      style={{
        left: `${xPosition - 90}px`, // Center card on date (180px width / 2)
        [isAbove ? 'bottom' : 'top']: `${yPosition + 60}px` // Offset from centerline
      }}
    >
      {/* Connector line (vertical dotted line to axis) */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{
          width: '2px',
          height: `${yPosition + 40}px`,
          background: `repeating-linear-gradient(
            to bottom,
            ${categoryColor}80,
            ${categoryColor}80 4px,
            transparent 4px,
            transparent 8px
          )`,
          [isAbove ? 'top' : 'bottom']: '100%'
        }}
        aria-hidden="true"
      />

      {/* Event Card */}
      <div
        onClick={onClick}
        className="
          cursor-pointer bg-white border-2 rounded-lg shadow-md
          hover:shadow-lg transition-all duration-200
          w-[180px] p-3
        "
        style={{
          borderLeftColor: categoryColor,
          borderLeftWidth: '4px'
        }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
      >
        {/* Title */}
        <div className="font-semibold text-sm text-gray-900 truncate mb-1">
          {event.title}
        </div>

        {/* Date */}
        <div className="text-xs text-gray-600 mb-2">
          {new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
          {event.time && ` • ${event.time}`}
        </div>

        {/* Priority & Status badges */}
        <div className="flex gap-2 items-center">
          {/* Priority badge */}
          <span
            className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              ${event.priority === 'High' ? 'bg-red-100 text-red-700' : ''}
              ${event.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${event.priority === 'Low' ? 'bg-green-100 text-green-700' : ''}
            `}
          >
            {event.priority}
          </span>

          {/* Status icon */}
          <span
            className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              ${event.status === 'Not Started' ? 'bg-gray-100 text-gray-700' : ''}
              ${event.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}
              ${event.status === 'Completed' ? 'bg-green-100 text-green-700' : ''}
            `}
          >
            {event.status === 'Not Started' && '○'}
            {event.status === 'In Progress' && '◐'}
            {event.status === 'Completed' && '●'}
          </span>
        </div>
      </div>
    </div>
  );
};
