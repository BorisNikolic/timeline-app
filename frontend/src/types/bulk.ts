/**
 * TypeScript types for bulk operations
 * Used by BulkSelectionControls and useBulkEventUpdate (User Story 8)
 */

import { EventStatus } from './Event';

/**
 * State for bulk selection mode
 */
export interface BulkSelectionState {
  selectedEventIds: Set<string>;
  isSelectionMode: boolean;
}

/**
 * Actions for bulk selection reducer
 */
export type BulkSelectionAction =
  | { type: 'TOGGLE_EVENT'; eventId: string }
  | { type: 'SELECT_ALL'; eventIds: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ENABLE_SELECTION_MODE' }
  | { type: 'DISABLE_SELECTION_MODE' };

/**
 * Result of bulk update operation
 */
export interface BulkUpdateResult {
  succeeded: number;
  failed: number;
  total: number;
  errors?: Array<{ eventId: string; error: string }>;
}

/**
 * Options for bulk status update
 */
export interface BulkStatusUpdateOptions {
  eventIds: string[];
  newStatus: EventStatus;
}

/**
 * Reducer for bulk selection state
 */
export const bulkSelectionReducer = (
  state: BulkSelectionState,
  action: BulkSelectionAction
): BulkSelectionState => {
  switch (action.type) {
    case 'TOGGLE_EVENT': {
      const newSelection = new Set(state.selectedEventIds);
      if (newSelection.has(action.eventId)) {
        newSelection.delete(action.eventId);
      } else {
        newSelection.add(action.eventId);
      }
      return {
        ...state,
        selectedEventIds: newSelection
      };
    }

    case 'SELECT_ALL':
      return {
        ...state,
        selectedEventIds: new Set(action.eventIds)
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedEventIds: new Set()
      };

    case 'ENABLE_SELECTION_MODE':
      return {
        ...state,
        isSelectionMode: true
      };

    case 'DISABLE_SELECTION_MODE':
      return {
        ...state,
        isSelectionMode: false,
        selectedEventIds: new Set()
      };

    default:
      return state;
  }
};

/**
 * Initial state for bulk selection
 */
export const initialBulkSelectionState: BulkSelectionState = {
  selectedEventIds: new Set(),
  isSelectionMode: false
};
