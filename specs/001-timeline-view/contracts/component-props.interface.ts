/**
 * Component Props Interface Contracts for Chronological Timeline View
 *
 * This file defines TypeScript interfaces for all component props in the timeline view feature.
 * These interfaces serve as contracts between components and ensure type safety.
 *
 * @module TimelineComponentProps
 * @since 2025-10-18
 */

import { Event, Category } from '../../types/models';

// ============================================
// Type Aliases
// ============================================

export type ViewMode = 'category' | 'timeline';
export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';
export type EventPosition = 'above' | 'below';

// ============================================
// ViewToggle Component
// ============================================

/**
 * Props for ViewToggle component
 *
 * Renders tab switcher between Category View and Timeline View
 */
export interface ViewToggleProps {
  /** Currently selected view mode */
  currentView: ViewMode;

  /** Callback when user changes view mode */
  onViewChange: (view: ViewMode) => void;

  /** Optional CSS class names */
  className?: string;
}

// ============================================
// ChronologicalTimeline Component
// ============================================

/**
 * Props for ChronologicalTimeline component (main orchestrator)
 *
 * Renders the complete chronological timeline with all swimlanes, controls, and markers
 */
export interface ChronologicalTimelineProps {
  /** Array of events to display (fetched from React Query) */
  events: Event[];

  /** Array of categories for swimlanes (fetched from React Query) */
  categories: Category[];

  /** Callback when user clicks on an event card */
  onEventClick: (eventId: string) => void;

  /** Optional CSS class names */
  className?: string;
}

// ============================================
// TimelineAxis Component
// ============================================

/**
 * Props for TimelineAxis component
 *
 * Renders horizontal date ruler with tick marks and labels
 */
export interface TimelineAxisProps {
  /** Left boundary of timeline (e.g., 2 weeks before today) */
  startDate: Date;

  /** Right boundary of timeline (e.g., 2 months after today) */
  endDate: Date;

  /** Current zoom level (determines tick granularity) */
  zoomLevel: ZoomLevel;

  /** Visual scaling factor (0.5x to 2.0x) */
  visualScale: number;

  /** Pixels per day calculation for positioning */
  pixelsPerDay: number;

  /** Optional CSS class names */
  className?: string;
}

// ============================================
// TimelineSwimlane Component
// ============================================

/**
 * Props for TimelineSwimlane component
 *
 * Renders a single category lane with positioned events
 */
export interface TimelineSwimlaneProps {
  /** Category data (name, color, etc.) */
  category: Category;

  /** Events belonging to this category */
  events: Event[];

  /** Timeline start date for position calculations */
  startDate: Date;

  /** Timeline end date for position calculations */
  endDate: Date;

  /** Visual scaling factor */
  visualScale: number;

  /** Pixels per day for positioning events */
  pixelsPerDay: number;

  /** Callback when user clicks on an event */
  onEventClick: (eventId: string) => void;

  /** Optional CSS class names */
  className?: string;
}

// ============================================
// TimelineEventCard Component
// ============================================

/**
 * Props for TimelineEventCard component
 *
 * Renders a single event card with positioning and styling
 */
export interface TimelineEventCardProps {
  /** Event data to display */
  event: Event;

  /** Position relative to swimlane centerline */
  position: EventPosition;

  /** Horizontal position in pixels from timeline start */
  xPosition: number;

  /** Vertical offset in pixels from centerline */
  yPosition: number;

  /** Category color for visual coding (HEX format) */
  categoryColor: string;

  /** Callback when card is clicked */
  onClick: () => void;

  /** Optional CSS class names */
  className?: string;
}

// ============================================
// ZoomControls Component
// ============================================

/**
 * Props for ZoomControls component
 *
 * Renders time range and visual scale controls
 */
export interface ZoomControlsProps {
  /** Current time range zoom level */
  currentZoomLevel: ZoomLevel;

  /** Current visual scale (0.5x to 2.0x) */
  currentVisualScale: number;

  /** Callback when zoom level changes */
  onZoomLevelChange: (level: ZoomLevel) => void;

  /** Callback when visual scale changes */
  onVisualScaleChange: (scale: number) => void;

  /** Optional CSS class names */
  className?: string;
}

// ============================================
// JumpToTodayButton Component
// ============================================

/**
 * Props for JumpToTodayButton component
 *
 * Renders floating button to scroll to current date
 */
export interface JumpToTodayButtonProps {
  /** Whether button should be visible (based on TODAY line viewport visibility) */
  isVisible: boolean;

  /** Callback when button is clicked */
  onJumpToToday: () => void;

  /** Optional CSS class names */
  className?: string;
}

// ============================================
// TimelineNowLine Component
// ============================================

/**
 * Props for TimelineNowLine component
 *
 * Renders animated vertical line at current date
 */
export interface TimelineNowLineProps {
  /** Horizontal position in pixels from timeline start */
  xPosition: number;

  /** Height of the line (spans all swimlanes) */
  height: number;

  /** Optional CSS class names */
  className?: string;
}

// ============================================
// Hook Return Types
// ============================================

/**
 * Return type for useTimelineViewState hook
 */
export interface UseTimelineViewStateReturn {
  /** Current view mode */
  viewMode: ViewMode;

  /** Current zoom level */
  zoomLevel: ZoomLevel;

  /** Current visual scale */
  visualScale: number;

  /** Current scroll position */
  scrollPosition: number;

  /** Set view mode */
  setViewMode: (mode: ViewMode) => void;

  /** Set zoom level */
  setZoomLevel: (level: ZoomLevel) => void;

  /** Set visual scale */
  setVisualScale: (scale: number) => void;

  /** Set scroll position */
  setScrollPosition: (position: number) => void;

  /** Reset all state to defaults */
  resetState: () => void;
}

/**
 * Return type for useScrollRestoration hook
 */
export interface UseScrollRestorationReturn {
  /** Manually clear saved scroll position */
  clearSavedPosition: () => void;

  /** Manually save current scroll position */
  saveCurrentPosition: () => void;
}

// ============================================
// Utility Types
// ============================================

/**
 * Positioned event with calculated coordinates
 */
export interface PositionedEvent {
  eventId: string;
  x: number;
  y: number;
  position: EventPosition;
  stackIndex: number;
}

/**
 * Axis tick mark
 */
export interface AxisTick {
  date: Date;
  label: string;
  x: number;
  isPrimary: boolean;
}

/**
 * Date range for timeline
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}
