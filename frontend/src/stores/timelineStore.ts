import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { MemberRole } from '../types/timeline';

interface TimelineState {
  // Current selected timeline
  currentTimelineId: string | null;

  // Current user's role in the timeline (cached for quick permission checks)
  currentTimelineRole: MemberRole | null;

  // Actions
  setCurrentTimeline: (id: string, role?: MemberRole) => void;
  setCurrentTimelineRole: (role: MemberRole) => void;
  clearCurrentTimeline: () => void;
}

/**
 * Zustand store for managing current timeline context
 *
 * Features:
 * - Persisted to localStorage (survives page refresh)
 * - Redux DevTools integration for debugging
 * - Selective subscriptions (components only re-render when their slice changes)
 *
 * Usage:
 *   const { currentTimelineId, setCurrentTimeline } = useTimelineStore();
 *   const timelineId = useCurrentTimeline(); // Selector for just the ID
 */
export const useTimelineStore = create<TimelineState>()(
  devtools(
    persist(
      (set) => ({
        currentTimelineId: null,
        currentTimelineRole: null,

        setCurrentTimeline: (id, role) =>
          set(
            { currentTimelineId: id, currentTimelineRole: role ?? null },
            false,
            'setCurrentTimeline'
          ),

        setCurrentTimelineRole: (role) =>
          set({ currentTimelineRole: role }, false, 'setCurrentTimelineRole'),

        clearCurrentTimeline: () =>
          set(
            { currentTimelineId: null, currentTimelineRole: null },
            false,
            'clearCurrentTimeline'
          ),
      }),
      {
        name: 'timeline-storage',
        // Only persist the timeline ID, not the role (role should be fetched fresh)
        partialize: (state) => ({ currentTimelineId: state.currentTimelineId }),
      }
    ),
    { name: 'TimelineStore' }
  )
);

// Selector hooks for optimized re-renders

/**
 * Get current timeline ID
 */
export const useCurrentTimeline = () =>
  useTimelineStore((state) => state.currentTimelineId);

/**
 * Get current timeline role
 */
export const useCurrentTimelineRole = () =>
  useTimelineStore((state) => state.currentTimelineRole);

/**
 * Check if user has at least the specified role
 */
export const useHasMinimumRole = (requiredRole: MemberRole): boolean => {
  const currentRole = useTimelineStore((state) => state.currentTimelineRole);

  if (!currentRole) return false;

  const roleHierarchy: Record<MemberRole, number> = {
    Viewer: 1,
    Editor: 2,
    Admin: 3,
  };

  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
};

/**
 * Check if current user can edit (Editor or Admin)
 */
export const useCanEdit = () => useHasMinimumRole('Editor');

/**
 * Check if current user is Admin
 */
export const useIsAdmin = () => useHasMinimumRole('Admin');
