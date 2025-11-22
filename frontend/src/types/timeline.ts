// ============================================================================
// Multi-Timeline System Types (Feature: 001-multi-timeline-system)
// ============================================================================

// Enums matching database types
export type TimelineStatus = 'Planning' | 'Active' | 'Completed' | 'Archived';
export type MemberRole = 'Admin' | 'Editor' | 'Viewer';
export type OutcomeTag = 'Went Well' | 'Needs Improvement' | 'Failed';

// Valid theme colors (matches database constraint)
export const TIMELINE_COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'teal'] as const;
export type TimelineColor = typeof TIMELINE_COLORS[number];

// Color values for UI display
export const TIMELINE_COLOR_VALUES: Record<TimelineColor, string> = {
  blue: '#3B82F6',
  green: '#22C55E',
  purple: '#A855F7',
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#EAB308',
  pink: '#EC4899',
  teal: '#14B8A6',
};

// Timeline entity (multi-timeline system)
export interface TimelineEntity {
  id: string;
  name: string;
  description: string | null;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
  themeColor: TimelineColor;
  status: TimelineStatus;
  isTemplate: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Timeline with aggregated statistics
export interface TimelineWithStats extends TimelineEntity {
  memberCount: number;
  eventCount: number;
  completedEventCount: number;
  completionPercentage: number;
  userRole?: MemberRole;
}

// Timeline member (junction table)
export interface TimelineMember {
  id: string;
  timelineId: string;
  userId: string;
  role: MemberRole;
  invitedBy: string | null;
  joinedAt: string;
}

// Member with user details (for member list display)
export interface TimelineMemberWithUser extends TimelineMember {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// User preference for last active timeline
export interface UserPreference {
  id: string;
  userId: string;
  lastTimelineId: string | null;
  updatedAt: string;
}

// DTOs for create/update operations
export interface CreateTimelineDto {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  themeColor?: TimelineColor;
}

export interface UpdateTimelineDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  themeColor?: TimelineColor;
  status?: TimelineStatus;
}

export interface CopyTimelineDto {
  name: string;
  startDate: string;
  endDate: string;
  includeCategories?: boolean;
  includeEvents?: boolean;
  includeAssignments?: boolean;
}

export interface InviteMemberDto {
  userId: string;
  role: MemberRole;
}

export interface UpdateMemberRoleDto {
  role: MemberRole;
}

// ============================================================================
// Dashboard Types (Feature: 001-multi-timeline-system - User Story 3)
// ============================================================================

// Timeline card for dashboard display
export interface TimelineCard {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  themeColor: TimelineColor;
  status: TimelineStatus;
  userRole: MemberRole;
  memberCount: number;
  eventCount: number;
  eventsByStatus: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  completionPercentage: number;
  updatedAt: string;
}

// Dashboard response with grouped timelines
export interface DashboardResponse {
  timelines: TimelineCard[];
  grouped: {
    active: TimelineCard[];
    planning: TimelineCard[];
    completed: TimelineCard[];
  };
  archivedCount: number;
}

// Aggregate statistics across all timelines
export interface DashboardStats {
  totalTimelines: number;
  activeTimelines: number;
  totalEvents: number;
  completedEvents: number;
  overallCompletion: number;
  timelinesAsAdmin: number;
  timelinesAsEditor: number;
  timelinesAsViewer: number;
}

// Dashboard filter options
export interface DashboardFilters {
  status?: TimelineStatus;
  year?: number;
  role?: MemberRole;
  sortBy?: 'startDate' | 'name' | 'updatedAt' | 'completion';
  sortOrder?: 'asc' | 'desc';
}

// Archive filter options (US9)
export interface ArchiveFilters {
  page?: number;
  limit?: number;
  year?: number;
  search?: string;
}

// Archive response with pagination (US9)
export interface ArchiveResponse {
  timelines: TimelineCard[];
  total: number;
  page: number;
  totalPages: number;
}

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  Viewer: 1,
  Editor: 2,
  Admin: 3,
};

// Helper to check if a role has minimum required permission
export function hasMinimumRole(userRole: MemberRole, requiredRole: MemberRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Status transition rules
export const VALID_STATUS_TRANSITIONS: Record<TimelineStatus, TimelineStatus[]> = {
  Planning: ['Active', 'Archived'],
  Active: ['Completed', 'Archived'],
  Completed: ['Archived'],
  Archived: ['Completed'], // Unarchive returns to Completed
};

export function isValidStatusTransition(from: TimelineStatus, to: TimelineStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}

// Status display config for UI
export const STATUS_CONFIG: Record<TimelineStatus, { label: string; color: string; bgColor: string }> = {
  Planning: { label: 'Planning', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  Active: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  Completed: { label: 'Completed', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  Archived: { label: 'Archived', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

// Role display config for UI
export const ROLE_CONFIG: Record<MemberRole, { label: string; color: string; bgColor: string }> = {
  Admin: { label: 'Admin', color: 'text-red-700', bgColor: 'bg-red-100' },
  Editor: { label: 'Editor', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  Viewer: { label: 'Viewer', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

// ============================================================================
// Timeline View Type Definitions (Visual Timeline Component)
// ============================================================================
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
