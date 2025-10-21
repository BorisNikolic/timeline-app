import { create } from 'zustand';

/**
 * Zustand Store for Bulk Selection State (User Story 8)
 *
 * Shared global state for bulk selection mode across components.
 * This ensures BulkSelectionControls and EventList share the same state.
 */

interface BulkSelectionStore {
  // State
  selectedEventIds: Set<string>;
  isSelectionMode: boolean;

  // Actions
  toggleEventSelection: (eventId: string) => void;
  selectAll: (eventIds: string[]) => void;
  clearSelection: () => void;
  enableSelectionMode: () => void;
  disableSelectionMode: () => void;
}

export const useBulkSelectionStore = create<BulkSelectionStore>((set) => ({
  // Initial state
  selectedEventIds: new Set<string>(),
  isSelectionMode: false,

  // Actions
  toggleEventSelection: (eventId: string) =>
    set((state) => {
      const newSelection = new Set(state.selectedEventIds);
      if (newSelection.has(eventId)) {
        newSelection.delete(eventId);
      } else {
        newSelection.add(eventId);
      }
      return { selectedEventIds: newSelection };
    }),

  selectAll: (eventIds: string[]) =>
    set({ selectedEventIds: new Set(eventIds) }),

  clearSelection: () =>
    set({ selectedEventIds: new Set() }),

  enableSelectionMode: () =>
    set({ isSelectionMode: true }),

  disableSelectionMode: () =>
    set({ isSelectionMode: false, selectedEventIds: new Set() }),
}));
