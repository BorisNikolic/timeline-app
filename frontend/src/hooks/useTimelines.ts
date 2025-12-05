/**
 * Timeline hooks for React Query
 * Feature: 001-multi-timeline-system
 *
 * Provides data fetching and mutations for timeline operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelinesApi, preferencesApi } from '../services/timelinesApi';
import {
  CreateTimelineDto,
  UpdateTimelineDto,
} from '../types/timeline';
import { useTimelineStore, useCurrentTimeline } from '../stores/timelineStore';
import { toast } from '../utils/toast';
import { dashboardKeys } from './useDashboard';

// Query key factory for consistent cache management
export const timelineKeys = {
  all: ['timelines'] as const,
  lists: () => [...timelineKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...timelineKeys.lists(), filters] as const,
  details: () => [...timelineKeys.all, 'detail'] as const,
  detail: (id: string) => [...timelineKeys.details(), id] as const,
  templates: () => [...timelineKeys.all, 'templates'] as const,
};

/**
 * Fetch all accessible timelines
 */
export function useTimelines(includeArchived = false) {
  return useQuery({
    queryKey: timelineKeys.list({ includeArchived }),
    queryFn: () => timelinesApi.getAll(includeArchived),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single timeline by ID
 */
export function useTimeline(timelineId?: string) {
  const currentId = useCurrentTimeline();
  const id = timelineId || currentId;

  return useQuery({
    queryKey: timelineKeys.detail(id!),
    queryFn: () => timelinesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a new timeline
 */
export function useCreateTimeline() {
  const queryClient = useQueryClient();
  const { setCurrentTimeline } = useTimelineStore();

  return useMutation({
    mutationFn: (data: CreateTimelineDto) => timelinesApi.create(data),
    onSuccess: (newTimeline) => {
      // Invalidate the list to include the new timeline
      queryClient.invalidateQueries({ queryKey: timelineKeys.lists() });
      // Also invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      // Optionally switch to the new timeline
      setCurrentTimeline(newTimeline.id, 'Admin');

      // Update user preference
      preferencesApi.setLastTimeline(newTimeline.id).catch(() => {
        // Silently fail - not critical
      });

      toast.success(`Timeline "${newTimeline.name}" created`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create timeline');
    },
  });
}

/**
 * Update a timeline
 */
export function useUpdateTimeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      expectedUpdatedAt,
    }: {
      id: string;
      data: UpdateTimelineDto;
      expectedUpdatedAt?: string;
    }) => timelinesApi.update(id, data, expectedUpdatedAt),
    onSuccess: (updatedTimeline) => {
      // Update the cache with the new data
      queryClient.setQueryData(
        timelineKeys.detail(updatedTimeline.id),
        updatedTimeline
      );

      // Invalidate the list to reflect changes
      queryClient.invalidateQueries({ queryKey: timelineKeys.lists() });
      // Also invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      toast.success('Timeline updated');
    },
    onError: (error: Error) => {
      if (error.message.includes('modified by another user')) {
        toast.error('Timeline was updated by someone else. Please refresh and try again.');
      } else {
        toast.error(error.message || 'Failed to update timeline');
      }
    },
  });
}

/**
 * Delete a timeline
 */
export function useDeleteTimeline() {
  const queryClient = useQueryClient();
  const { currentTimelineId, clearCurrentTimeline } = useTimelineStore();

  return useMutation({
    mutationFn: (id: string) => timelinesApi.delete(id),
    onSuccess: (_data, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: timelineKeys.detail(deletedId) });

      // Invalidate the list
      queryClient.invalidateQueries({ queryKey: timelineKeys.lists() });
      // Also invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      // Clear current timeline if it was deleted
      if (currentTimelineId === deletedId) {
        clearCurrentTimeline();
      }

      toast.success('Timeline deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete timeline');
    },
  });
}

/**
 * Fetch all templates
 */
export function useTemplates() {
  return useQuery({
    queryKey: timelineKeys.templates(),
    queryFn: () => timelinesApi.getTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes - templates change less frequently
  });
}

/**
 * Toggle template status
 */
export function useSetTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isTemplate }: { id: string; isTemplate: boolean }) =>
      timelinesApi.setTemplate(id, isTemplate),
    onSuccess: (updatedTimeline) => {
      // Update detail cache
      queryClient.setQueryData(
        timelineKeys.detail(updatedTimeline.id),
        updatedTimeline
      );

      // Invalidate lists and templates
      queryClient.invalidateQueries({ queryKey: timelineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: timelineKeys.templates() });
      // Also invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      const action = updatedTimeline.isTemplate ? 'added to' : 'removed from';
      toast.success(`Timeline ${action} templates`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template status');
    },
  });
}

/**
 * Unarchive a timeline
 */
export function useUnarchiveTimeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timelinesApi.unarchive(id),
    onSuccess: (updatedTimeline) => {
      // Update detail cache
      queryClient.setQueryData(
        timelineKeys.detail(updatedTimeline.id),
        updatedTimeline
      );

      // Invalidate the list
      queryClient.invalidateQueries({ queryKey: timelineKeys.lists() });
      // Also invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      toast.success(`Timeline "${updatedTimeline.name}" unarchived`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unarchive timeline');
    },
  });
}
