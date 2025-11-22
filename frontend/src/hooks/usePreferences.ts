/**
 * User Preferences Hook
 * Feature: 001-multi-timeline-system (User Story 4)
 *
 * Provides data fetching and mutations for user preferences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesApi } from '../services/timelinesApi';
import { useTimelineStore } from '../stores/timelineStore';

// Query key factory
export const preferencesKeys = {
  all: ['preferences'] as const,
  current: () => [...preferencesKeys.all, 'current'] as const,
};

/**
 * Fetch current user's preferences
 */
export function usePreferences() {
  return useQuery({
    queryKey: preferencesKeys.current(),
    queryFn: () => preferencesApi.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if preferences don't exist
  });
}

/**
 * Update user preferences (specifically lastTimelineId)
 */
export function useUpdateLastTimeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timelineId: string | null) =>
      preferencesApi.setLastTimeline(timelineId),
    onSuccess: (newPreferences) => {
      // Update the cache with new preferences
      queryClient.setQueryData(preferencesKeys.current(), newPreferences);
    },
    onError: (error) => {
      console.error('Failed to update last timeline preference:', error);
      // Silently fail - not critical
    },
  });
}

/**
 * Combined hook for syncing timeline selection with backend preferences
 * Automatically saves the last timeline to preferences when switching
 */
export function useTimelineSelection() {
  const { currentTimelineId, setCurrentTimeline, clearCurrentTimeline } =
    useTimelineStore();
  const updateLastTimeline = useUpdateLastTimeline();

  const selectTimeline = async (
    timelineId: string,
    role?: 'Admin' | 'Editor' | 'Viewer'
  ) => {
    // Update local state immediately (optimistic)
    setCurrentTimeline(timelineId, role);

    // Sync to backend (fire and forget)
    updateLastTimeline.mutate(timelineId);
  };

  const clearSelection = async () => {
    clearCurrentTimeline();
    updateLastTimeline.mutate(null);
  };

  return {
    currentTimelineId,
    selectTimeline,
    clearSelection,
    isSyncing: updateLastTimeline.isPending,
  };
}
