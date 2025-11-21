// Timeline View Type Definitions
// Derived from specs/001-timeline-view/contracts/component-props.interface.ts

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type Granularity = 'hour' | 'day' | 'week' | 'month';
export type EventPosition = 'above' | 'below';
export type ViewMode = 'category' | 'timeline';

// TimelineViewState - Client-side state (persisted in localStorage)
export interface TimelineViewState {
  viewMode: ViewMode;
  zoomLevel: ZoomLevel;
  visualScale: number;
  scrollPosition: number;
  timestamp: number;
}

// CategorySwimlane - View Model (derived from Category + Event entities)
export interface CategorySwimlane {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  eventCount: number;
  events: Event[];
  sortOrder: number;
}

// TimelineEventCard - View Model (derived from Event with positioning)
export interface TimelineEventCard {
  eventId: string;
  title: string;
  date: Date;
  time?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  categoryColor: string;
  xPosition: number;
  yPosition: number;
  position: EventPosition;
  stackIndex: number;
  zIndex: number;
  width: number;
}

// AxisTick - Date marker with label and position
export interface AxisTick {
  date: Date;
  label: string;
  x: number;
  isPrimary: boolean;
}

// TimeAxis - View Model (computed from TimelineViewState)
export interface TimeAxis {
  startDate: Date;
  endDate: Date;
  granularity: Granularity;
  tickPositions: AxisTick[];
  pixelsPerDay: number;
}

// TodayMarker - Current date indicator
export interface TodayMarker {
  date: Date;
  xPosition: number;
  isVisible: boolean;
}

// Component Props Interfaces

export interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export interface ChronologicalTimelineProps {
  events: any[]; // Use existing Event type from project
  categories: any[]; // Use existing Category type from project
  onEventClick: (eventId: string) => void;
}

export interface TimelineAxisProps {
  startDate: Date;
  endDate: Date;
  zoomLevel: ZoomLevel;
  visualScale: number;
  pixelsPerDay: number;
}

export interface TimelineSwimlaneProps {
  category: any; // Use existing Category type
  events: any[]; // Use existing Event type
  startDate: Date;
  endDate: Date;
  zoomLevel: ZoomLevel;
  visualScale: number;
  pixelsPerDay: number;
  onEventClick: (eventId: string) => void;
}

export interface TimelineEventCardProps {
  event: any; // Use existing Event type
  position: EventPosition;
  xPosition: number;
  yPosition: number;
  categoryColor: string;
  stackIndex: number;
  zIndex: number;
  width: number;
  onClick: () => void;
}

export interface ZoomControlsProps {
  currentZoomLevel: ZoomLevel;
  currentVisualScale: number;
  onZoomLevelChange: (level: ZoomLevel) => void;
  onVisualScaleChange: (scale: number) => void;
}

export interface JumpToTodayButtonProps {
  isVisible: boolean;
  onJumpToToday: () => void;
}

export interface TimelineNowLineProps {
  xPosition: number;
  height: number;
}

// CSS Custom Properties Type Extension
// Allows TypeScript to recognize custom CSS properties in inline styles
declare module 'react' {
  interface CSSProperties {
    '--category-header-width'?: string;
    '--timeline-origin-x'?: string;
    '--timeline-width'?: string;
  }
}
