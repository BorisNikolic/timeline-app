// Timeline types for Multi-Timeline System
// Feature: 001-multi-timeline-system

// Enums matching database types
export type TimelineStatus = 'Planning' | 'Active' | 'Completed' | 'Archived';
export type MemberRole = 'Admin' | 'Editor' | 'Viewer';
export type OutcomeTag = 'Went Well' | 'Needs Improvement' | 'Failed';

// Valid theme colors (matches database constraint)
export const TIMELINE_COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'teal'] as const;
export type TimelineColor = typeof TIMELINE_COLORS[number];

// Timeline entity
export interface Timeline {
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
export interface TimelineWithStats extends Timeline {
  memberCount: number;
  eventCount: number;
  completedEventCount: number;
  completionPercentage: number;
  userRole?: MemberRole; // Current user's role in this timeline
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
