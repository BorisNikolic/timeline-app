/**
 * Current Timeline Hook
 * Feature: 001-multi-timeline-system (User Story 4)
 *
 * Provides access to the currently selected timeline context
 * Combines Zustand store state with React Query data
 */

import { useMemo } from 'react';
import { useTimelineStore, useCurrentTimeline as useCurrentTimelineId } from '../stores/timelineStore';
import { useTimeline } from './useTimelines';
import { MemberRole } from '../types/timeline';

/**
 * Get current timeline ID (simple selector)
 * Re-exported from timelineStore for convenience
 */
export { useCurrentTimeline as useCurrentTimelineId } from '../stores/timelineStore';

/**
 * Get current timeline with full data
 * Uses React Query for data fetching and caching
 */
export function useCurrentTimeline() {
  const currentId = useCurrentTimelineId();
  const { data: timeline, isLoading, error } = useTimeline(currentId || undefined);
  const { currentTimelineRole, setCurrentTimeline, setCurrentTimelineRole, clearCurrentTimeline } =
    useTimelineStore();

  return useMemo(
    () => ({
      // Data
      timeline,
      timelineId: currentId,
      role: currentTimelineRole,

      // Loading states
      isLoading,
      error,
      hasTimeline: !!currentId,

      // Actions
      setCurrentTimeline,
      setCurrentTimelineRole,
      clearCurrentTimeline,
    }),
    [
      timeline,
      currentId,
      currentTimelineRole,
      isLoading,
      error,
      setCurrentTimeline,
      setCurrentTimelineRole,
      clearCurrentTimeline,
    ]
  );
}

/**
 * Check if current user can perform an action based on role
 */
export function useCanPerformAction(requiredRole: MemberRole): boolean {
  const { role } = useCurrentTimeline();

  if (!role) return false;

  const roleHierarchy: Record<MemberRole, number> = {
    Viewer: 1,
    Editor: 2,
    Admin: 3,
  };

  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can edit in current timeline (Editor or Admin)
 */
export function useCanEdit(): boolean {
  return useCanPerformAction('Editor');
}

/**
 * Check if user is Admin in current timeline
 */
export function useIsAdmin(): boolean {
  return useCanPerformAction('Admin');
}

/**
 * Hook to get timeline context for API calls
 * Returns null if no timeline selected (useful for conditional fetching)
 */
export function useTimelineContext() {
  const currentId = useCurrentTimelineId();
  const { currentTimelineRole } = useTimelineStore();

  if (!currentId) return null;

  return {
    timelineId: currentId,
    role: currentTimelineRole,
  };
}
