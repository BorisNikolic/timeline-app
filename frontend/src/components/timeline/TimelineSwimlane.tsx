// TimelineSwimlane Component
// Category lane with positioned event cards

import React, { useMemo, useState } from 'react';
import type { TimelineSwimlaneProps, ZoomLevel } from '../../types/timeline';
import { TimelineEventCard } from './TimelineEventCard';
import { calculateEventPositions, getCardConfigForZoom } from '../../utils/timelineCalculations';

/**
 * Calculate the maximum number of events on any single date
 * This determines how many cards need to stack vertically
 */
function calculateMaxEventsPerDate(events: any[]): number {
  if (events.length === 0) return 0;

  const eventsByDate = new Map<string, number>();
  events.forEach(event => {
    const dateKey = event.date.split('T')[0]; // Extract YYYY-MM-DD
    eventsByDate.set(dateKey, (eventsByDate.get(dateKey) || 0) + 1);
  });

  return Math.max(...eventsByDate.values());
}

/**
 * Calculate dynamic lane height based on max stacking depth and zoom level
 * Uses actual card dimensions from config to ensure stacked cards fit
 * - Empty (0 events): collapsed by default
 * - Height based on actual stack dimensions (stackOffsetY * count + cardHeight)
 */
function calculateLaneHeight(maxStackDepth: number, zoomLevel: ZoomLevel = 'week'): number {
  if (maxStackDepth === 0) return 48; // Collapsed height

  // Get actual card dimensions for this zoom level
  const cardConfig = getCardConfigForZoom(zoomLevel);
  const { height: cardHeight, stackOffsetY } = cardConfig;

  // Calculate total stack height: (n-1) offsets + one full card height
  // Stack goes: card0 at 0, card1 at stackOffsetY, card2 at 2*stackOffsetY, etc.
  const visibleCards = Math.min(maxStackDepth, 10); // Cap at MAX_STACK_COUNT
  const totalStackHeight = (visibleCards - 1) * stackOffsetY + cardHeight;

  // Add padding: cards are centered, so we need space above and below
  // The stack extends upward from centerline, plus some bottom padding
  const padding = 40; // Buffer for visual breathing room
  const laneHeight = totalStackHeight + padding;

  // Minimum heights per zoom level for good appearance
  const minHeight = zoomLevel === 'day' ? 120 : 96;

  return Math.max(minHeight, laneHeight);
}

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
  // All categories start expanded, empty categories are always collapsed (no toggle)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Empty categories are always collapsed and cannot be expanded
  const isEmpty = events.length === 0;
  const effectivelyCollapsed = isEmpty || isCollapsed;

  // Calculate max stacking depth (max events on same date)
  const maxStackDepth = useMemo(() => calculateMaxEventsPerDate(events), [events]);

  // Calculate dynamic height based on max stacking depth and zoom level
  const laneHeight = useMemo(() => {
    if (effectivelyCollapsed) return 48;
    return calculateLaneHeight(maxStackDepth, zoomLevel);
  }, [maxStackDepth, effectivelyCollapsed, zoomLevel]);
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
      className="relative border-b-2 border-gray-300 timeline-swimlane-bg transition-all duration-300"
      style={{
        '--swimlane-bg-color': hexToRgba(category.color, 0.03),
        width: '100%',
        height: `${laneHeight}px`
      } as React.CSSProperties}
    >
      {/* Category header */}
      <div
        className={`sticky left-0 z-20 px-3 border-r-4 w-48 flex items-center ${isCollapsed ? 'py-2' : 'py-3'}`}
        style={{
          float: 'left',
          backgroundColor: hexToRgba(category.color, 0.1),
          borderRightColor: category.color,
          height: '100%'
        }}
      >
        <div className="flex items-center gap-2 w-full">
          {isEmpty ? (
            /* Empty category - collapsed only, no toggle */
            <>
              {/* Category color indicator */}
              <div
                className="w-4 h-4 rounded shadow-sm flex-shrink-0 opacity-50"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />

              {/* Category name */}
              <div className="font-semibold text-sm text-gray-400 truncate flex-1">
                {category.name}
              </div>

              <span className="text-xs text-gray-400 whitespace-nowrap">0 events</span>
            </>
          ) : (
            /* Category with events - collapsible */
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-2 w-full group hover:bg-black/5 rounded -mx-1 px-1 py-0.5 transition-colors"
              title={isCollapsed ? 'Click to expand' : 'Click to collapse'}
            >
              {/* Chevron indicator */}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>

              {/* Category color indicator */}
              <div
                className="w-5 h-5 rounded-md shadow-sm flex-shrink-0"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />

              {/* Category name and event count */}
              <div className="text-left min-w-0 flex-1">
                <div className="font-semibold text-sm text-gray-900 truncate">
                  {category.name}
                </div>
                {!isCollapsed && (
                  <div className="text-xs text-gray-500">
                    {events.length} event{events.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {isCollapsed && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Swimlane content area (for event cards) - hidden when collapsed */}
      {!effectivelyCollapsed && (
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: 'var(--category-header-width, 192px)',
            right: 0,
            zIndex: 1
          }}
        >
        {/* Event cards - positioned from top, stacking downward */}
        {eventPositions.map((eventPos) => {
          // Check if this is an overflow indicator or cluster
          const isOverflow = eventPos.eventId.startsWith('overflow-');
          const isCluster = eventPos.eventId.startsWith('cluster-');

          // Find original event, or use the position data for overflow/cluster indicators
          const originalEvent = (isOverflow || isCluster)
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
              zoomLevel={zoomLevel}
              onClick={() => {
                // Don't trigger click for overflow indicators
                if (!isOverflow && !isCluster) {
                  onEventClick(eventPos.eventId);
                }
              }}
              onClusterEventClick={(eventId) => {
                // Handle clicking an event within a cluster popover
                onEventClick(eventId);
              }}
            />
          );
        })}
        </div>
      )}
    </div>
  );
};
