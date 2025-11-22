import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { eventsApi, handleApiError, CreateEventDto, UpdateEventDto } from '../services/api-client';

// Query key factory for events (T106)
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: { timelineId?: string; startDate?: string; endDate?: string }) =>
    [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

/**
 * Fetch all events (legacy - non-scoped)
 */
export function useEvents(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: eventKeys.list({ startDate, endDate }),
    queryFn: () => eventsApi.getAll(startDate, endDate),
  });
}

/**
 * Fetch events by timeline ID (T106)
 */
export function useTimelineEvents(
  timelineId: string | null | undefined,
  options?: { startDate?: string; endDate?: string; sortBy?: string; status?: string; priority?: string; categoryId?: string }
) {
  return useQuery({
    queryKey: eventKeys.list({ timelineId: timelineId || undefined, ...options }),
    queryFn: () => eventsApi.getByTimeline(timelineId!, options),
    enabled: !!timelineId,
  });
}

/**
 * Fetch single event by ID
 */
export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create new event (legacy - non-scoped)
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventDto) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event created successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

/**
 * Create event in a specific timeline (T106)
 */
export function useCreateTimelineEvent(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventDto) => eventsApi.createInTimeline(timelineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event created successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

/**
 * Update event (legacy - non-scoped)
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) => eventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event updated successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

/**
 * Update event in a specific timeline (T106)
 */
export function useUpdateTimelineEvent(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventDto }) =>
      eventsApi.updateInTimeline(timelineId, eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event updated successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

/**
 * Delete event (legacy - non-scoped)
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event deleted successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

/**
 * Delete event from a specific timeline (T106)
 */
export function useDeleteTimelineEvent(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteFromTimeline(timelineId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event deleted successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}
