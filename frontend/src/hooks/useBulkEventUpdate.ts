import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EventStatus } from '../types/Event';
import { BulkUpdateResult } from '../types/bulk';
import { toast } from '../utils/toast';
import apiClient from '../services/api-client';
import { useBulkSelectionStore } from '../store/bulkSelectionStore';

/**
 * Bulk Event Update Hook (User Story 8 - P3)
 * Provides bulk selection state and status update functionality
 *
 * Features:
 * - Track selected events with Set for O(1) lookups
 * - Bulk status updates with partial success handling (Promise.allSettled)
 * - Optimistic UI updates via React Query cache invalidation
 * - Detailed feedback for success/failure counts
 *
 * Uses Zustand store for global state shared across components
 */
export function useBulkEventUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Get state and actions from Zustand store (shared globally)
  const {
    selectedEventIds,
    isSelectionMode,
    toggleEventSelection,
    selectAll,
    clearSelection,
    enableSelectionMode,
    disableSelectionMode,
  } = useBulkSelectionStore();

  /**
   * Bulk update status with Promise.allSettled for partial success handling (T068)
   *
   * @param newStatus - New status to apply to selected events
   * @returns Result object with success/failure counts
   */
  const bulkUpdateStatus = useCallback(
    async (newStatus: EventStatus): Promise<BulkUpdateResult> => {
      const eventIds = Array.from(selectedEventIds);

      if (eventIds.length === 0) {
        toast.error('No events selected');
        return { succeeded: 0, failed: 0, total: 0 };
      }

      setIsUpdating(true);

      try {
        // Create array of PATCH requests
        const promises = eventIds.map((id) =>
          apiClient.patch(`/api/events/${id}`, { status: newStatus })
            .then(() => ({ eventId: id, success: true }))
            .catch((error) => ({ eventId: id, success: false, error: error.message }))
        );

        // Execute all requests in parallel with Promise.allSettled
        const results = await Promise.allSettled(promises);

        // Count successes and failures
        let succeeded = 0;
        let failed = 0;
        const errors: Array<{ eventId: string; error: string }> = [];

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            if (result.value.success) {
              succeeded++;
            } else {
              failed++;
              errors.push({
                eventId: result.value.eventId,
                error: result.value.error || 'Unknown error',
              });
            }
          } else {
            failed++;
          }
        });

        // Show appropriate toast messages (T072)
        if (succeeded > 0 && failed === 0) {
          toast.success(`Updated ${succeeded} event${succeeded > 1 ? 's' : ''} successfully`);
        } else if (succeeded > 0 && failed > 0) {
          toast.info(`Updated ${succeeded} of ${eventIds.length} events (${failed} failed)`);
        } else {
          toast.error(`Failed to update ${failed} event${failed > 1 ? 's' : ''}`);
        }

        // Invalidate React Query cache to refetch events
        queryClient.invalidateQueries({ queryKey: ['events'] });

        // Clear selection after successful operation
        clearSelection();

        return {
          succeeded,
          failed,
          total: eventIds.length,
          errors: errors.length > 0 ? errors : undefined,
        };
      } catch (error) {
        toast.error('Bulk update failed');
        return {
          succeeded: 0,
          failed: selectedEventIds.size,
          total: selectedEventIds.size,
        };
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedEventIds, queryClient, clearSelection]
  );

  return {
    // State
    selectedEventIds,
    isSelectionMode,
    selectedCount: selectedEventIds.size,
    isUpdating,

    // Actions
    toggleEventSelection,
    selectAll,
    clearSelection,
    enableSelectionMode,
    disableSelectionMode,
    bulkUpdateStatus,
  };
}
