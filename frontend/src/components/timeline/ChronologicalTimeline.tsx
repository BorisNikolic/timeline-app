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
import { ScrollIndicatorBadge } from '../shared/ScrollIndicatorBadge';
import { useTimelineViewState } from '../../hooks/useTimelineViewState';
import {
  calculateEventBasedDateRange,
  getPixelsPerDay,
  calculateTimelineWidth,
  calculateEventX,
  CATEGORY_HEADER_WIDTH_PX
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
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [hiddenCategoriesCount, setHiddenCategoriesCount] = useState(0);

  // Timeline view state (persisted in localStorage)
  const {
    zoomLevel,
    visualScale,
    setZoomLevel,
    setVisualScale
  } = useTimelineViewState();

  // Calculate date range based on actual events
  const dateRange = useMemo(() => {
    return calculateEventBasedDateRange(events);
  }, [events]);

  // Calculate scale and timeline width
  const pixelsPerDay = useMemo(() => {
    return getPixelsPerDay(zoomLevel, visualScale);
  }, [zoomLevel, visualScale]);

  const timelineWidth = useMemo(() => {
    if (!dateRange) return 0;
    return calculateTimelineWidth(dateRange.startDate, dateRange.endDate, pixelsPerDay);
  }, [dateRange, pixelsPerDay]);

  // Calculate TODAY line position
  const todayPosition = useMemo(() => {
    if (!dateRange) return 0;
    const today = startOfDay(new Date());
    return calculateEventX(today, dateRange.startDate, dateRange.endDate, pixelsPerDay);
  }, [dateRange, pixelsPerDay]);

  // Scroll to TODAY on mount
  useEffect(() => {
    if (!scrollContainerRef.current || events.length === 0 || todayPosition === 0) return;

    // Center on TODAY with a slight delay to ensure layout is ready
    const timer = setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const containerWidth = scrollContainerRef.current.clientWidth;
      const targetScroll = Math.max(0, todayPosition - containerWidth / 2);
      scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timer);
  }, [events.length, todayPosition]); // Run when events load or today position changes

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px = md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // IntersectionObserver for "Jump to Today" button visibility
  useEffect(() => {
    if (!todayLineRef.current || !scrollContainerRef.current || events.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // Consider TODAY visible if it's reasonably in view (>30% visible)
          setTodayLineVisible(entry.isIntersecting && entry.intersectionRatio > 0.3);
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '-100px 0px', // Only consider visible if not too close to edges
        threshold: [0, 0.3, 0.5, 1.0]
      }
    );

    observer.observe(todayLineRef.current);

    return () => observer.disconnect();
  }, [events.length]); // Re-observe when events load

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

  // Scroll indicator tracking
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || swimlanes.length === 0) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollBottom = scrollTop + clientHeight;

      // Check if near bottom (within 50px)
      const isNearBottom = scrollHeight - scrollBottom < 50;

      // Calculate visible swimlanes
      const SWIMLANE_HEIGHT = 256; // Approximate height
      const visibleCount = Math.ceil(clientHeight / SWIMLANE_HEIGHT);
      const totalCount = swimlanes.length;
      const scrolledCount = Math.floor(scrollTop / SWIMLANE_HEIGHT);
      const hiddenCount = Math.max(0, totalCount - (scrolledCount + visibleCount));

      setHiddenCategoriesCount(hiddenCount);
      setShowScrollIndicator(!isNearBottom && hiddenCount > 0);
    };

    // Initial check
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [swimlanes.length]);

  // Calculate total height for NOW line
  const totalHeight = swimlanes.length * 256 + 64; // swimlane height + axis height

  // Extract dates early (before empty state check), but safely handle null case
  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;

  // Handle empty state
  if (!dateRange || !startDate || !endDate) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-gray-200 rounded-lg">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium text-gray-700 mb-2">No events to display</p>
        <p className="text-sm text-gray-500">Add events to see them in the timeline view</p>
      </div>
    );
  }

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
        className="timeline-scroll-container overflow-x-auto overflow-y-auto border border-gray-200 rounded-lg bg-white"
        style={{ maxHeight: '80vh' }}
      >
        <div
          className="relative"
          style={{
            width: `${timelineWidth}px`,
            minWidth: '100%',
            '--category-header-width': '192px'
          } as React.CSSProperties}
        >
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
              zoomLevel={zoomLevel}
              visualScale={visualScale}
              pixelsPerDay={pixelsPerDay}
              onEventClick={onEventClick}
            />
          ))}

          {/* TODAY Line */}
          <div ref={todayLineRef} style={{ position: 'absolute', left: `${todayPosition + CATEGORY_HEADER_WIDTH_PX}px`, top: 0, width: '1px', height: `${totalHeight}px` }}>
            <TimelineNowLine
              xPosition={0}
              height={totalHeight}
            />
          </div>
        </div>
      </div>

      {/* Jump to Today Button - Always visible on mobile, conditional on desktop */}
      <JumpToTodayButton
        isVisible={isMobile || !todayLineVisible}
        onJumpToToday={handleJumpToToday}
      />

      {/* Scroll Indicator Badge */}
      <ScrollIndicatorBadge
        count={hiddenCategoriesCount}
        isVisible={showScrollIndicator}
        itemType="categories"
      />
    </div>
  );
};
