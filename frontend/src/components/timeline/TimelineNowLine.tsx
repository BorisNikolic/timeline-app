// TimelineNowLine Component
// Animated vertical line indicating current date (TODAY)

import React from 'react';
import type { TimelineNowLineProps } from '../../types/timeline';
import '../../styles/timeline-animations.css';

export const TimelineNowLine: React.FC<TimelineNowLineProps> = ({
  xPosition,
  height
}) => {
  return (
    <div
      className="timeline-today-line absolute top-0 z-10"
      style={{
        left: `${xPosition}px`,
        width: '3px',
        height: `${height}px`,
        backgroundColor: '#FF6B6B',
        borderRadius: '2px'
      }}
      aria-label="Current date indicator"
    >
      {/* TODAY label */}
      <div
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap"
        style={{ boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)' }}
      >
        TODAY
      </div>
    </div>
  );
};
