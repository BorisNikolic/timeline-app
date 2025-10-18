// ChronologicalTimeline Component
// Main orchestrator for chronological timeline view

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { startOfDay } from 'date-fns';
import type { ChronologicalTimelineProps } from '../../types/timeline';
import { TimelineAxis } from './TimelineAxis';
import { TimelineNowLine } from './TimelineNowLine';
import { TimelineSwimlane } from './TimelineSwimlane';
import { ZoomControls } from './ZoomControls';
import { JumpToTodayButton } from './JumpToTodayButton';
import { useTimelineViewState } from '../../hooks/useTimelineViewState';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';
import {
  calculateDefaultDateRange,
  getPixelsPerDay,
  calculateTimelineWidth,
  calculateEventX
} from '../../utils/timelineCalculations';
import '../../styles/timeline-animations.css';

export const ChronologicalTimeline: React.FC<ChronologicalTimelineProps> = ({
  events,
  categories,
  onEventClick
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayLineRef = useRef<HTMLDivElement>(null);
  const [todayLineVisible, setTodayLineVisible] = useState(true);

  // Timeline view state (persisted in localStorage)
  const {
    zoomLevel,
    visualScale,
    setZoomLevel,
    setVisualScale
  } = useTimelineViewState();

  // Calculate date range (2 weeks before, 2 months after today)
  const { startDate, endDate } = useMemo(() => {
    return calculateDefaultDateRange();
  }, []);

  // Calculate scale and timeline width
  const pixelsPerDay = useMemo(() => {
    return getPixelsPerDay(zoomLevel, visualScale);
  }, [zoomLevel, visualScale]);

  const timelineWidth = useMemo(() => {
    return calculateTimelineWidth(startDate, endDate, pixelsPerDay);
  }, [startDate, endDate, pixelsPerDay]);

  // Calculate TODAY line position
  const todayPosition = useMemo(() => {
    const today = startOfDay(new Date());
    return calculateEventX(today, startDate, endDate, pixelsPerDay);
  }, [startDate, endDate, pixelsPerDay]);

  // Default scroll position (center on TODAY line)
  const defaultScrollPosition = useMemo(() => {
    if (!scrollContainerRef.current) return 0;
    const containerWidth = scrollContainerRef.current.clientWidth;
    return Math.max(0, todayPosition - containerWidth / 2);
  }, [todayPosition]);

  // Scroll restoration (persist scroll position)
  useScrollRestoration(scrollContainerRef, {
    storageKey: 'timeline-scroll-position',
    enabled: events.length > 0, // Only enable after data loads
    defaultPosition: defaultScrollPosition
  });

  // IntersectionObserver for "Jump to Today" button visibility
  useEffect(() => {
    if (!todayLineRef.current || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setTodayLineVisible(entry.isIntersecting);
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px',
        threshold: [0, 1]
      }
    );

    observer.observe(todayLineRef.current);

    return () => observer.disconnect();
  }, []);

  // Jump to TODAY handler
  const handleJumpToToday = () => {
    if (!scrollContainerRef.current) return;

    const containerWidth = scrollContainerRef.current.clientWidth;
    const targetScroll = Math.max(0, todayPosition - containerWidth / 2);

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Derive category swimlanes (sorted alphabetically)
  const swimlanes = useMemo(() => {
    return categories
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((category) => ({
        category,
        events: events.filter(event => event.categoryId === category.id)
      }));
  }, [categories, events]);

  // Calculate total height for NOW line
  const totalHeight = swimlanes.length * 256 + 64; // swimlane height + axis height

  return (
    <div className="flex flex-col gap-4">
      {/* Zoom Controls */}
      <ZoomControls
        currentZoomLevel={zoomLevel}
        currentVisualScale={visualScale}
        onZoomLevelChange={setZoomLevel}
        onVisualScaleChange={setVisualScale}
      />

      {/* Timeline Container */}
      <div
        ref={scrollContainerRef}
        className="timeline-scroll-container overflow-x-auto overflow-y-visible border border-gray-200 rounded-lg bg-white"
        style={{ maxHeight: '70vh' }}
      >
        <div className="relative" style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
          {/* Timeline Axis */}
          <TimelineAxis
            startDate={startDate}
            endDate={endDate}
            zoomLevel={zoomLevel}
            visualScale={visualScale}
            pixelsPerDay={pixelsPerDay}
          />

          {/* Category Swimlanes */}
          {swimlanes.map(({ category, events: categoryEvents }) => (
            <TimelineSwimlane
              key={category.id}
              category={category}
              events={categoryEvents}
              startDate={startDate}
              endDate={endDate}
              visualScale={visualScale}
              pixelsPerDay={pixelsPerDay}
              onEventClick={onEventClick}
            />
          ))}

          {/* TODAY Line */}
          <div ref={todayLineRef} style={{ position: 'absolute', left: `${todayPosition}px`, top: 0, width: '1px', height: `${totalHeight}px` }}>
            <TimelineNowLine
              xPosition={0}
              height={totalHeight}
            />
          </div>
        </div>
      </div>

      {/* Jump to Today Button */}
      <JumpToTodayButton
        isVisible={!todayLineVisible}
        onJumpToToday={handleJumpToToday}
      />

      {/* Empty state */}
      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No events to display</p>
          <p className="text-sm mt-2">Add events to see them in the timeline view</p>
        </div>
      )}
    </div>
  );
};
