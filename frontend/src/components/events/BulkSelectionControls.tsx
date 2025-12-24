import { useState } from 'react';
import { EventStatus } from '../../types/Event';
import { useBulkEventUpdate } from '../../hooks/useBulkEventUpdate';
import DeleteConfirmDialog from '../shared/DeleteConfirmDialog';

interface BulkSelectionControlsProps {
  /**
   * All visible event IDs (after filtering) for "Select All" functionality
   */
  visibleEventIds: string[];

  /**
   * Whether bulk operations are available (disabled in timeline view)
   */
  isAvailable?: boolean;
}

/**
 * Bulk Selection Controls Component (User Story 8 - P3)
 *
 * Provides:
 * - Enable/Disable selection mode button (T069)
 * - Select All / Clear Selection buttons (T075)
 * - "Mark Selected as..." dropdown for bulk status updates (T071)
 * - Selected count display
 *
 * @example
 * <BulkSelectionControls
 *   visibleEventIds={filteredEvents.map(e => e.id)}
 *   isAvailable={isListView}
 * />
 */
export function BulkSelectionControls({
  visibleEventIds,
  isAvailable = true,
}: BulkSelectionControlsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    isSelectionMode,
    selectedCount,
    isUpdating,
    enableSelectionMode,
    disableSelectionMode,
    selectAll,
    clearSelection,
    bulkUpdateStatus,
    bulkDelete,
  } = useBulkEventUpdate();

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    await bulkDelete();
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // T074: Disable bulk mode in timeline view
  if (!isAvailable) {
    return (
      <div className="text-sm text-gray-500 italic">
        Switch to List View to use bulk operations
      </div>
    );
  }

  // Not in selection mode - show enable button
  if (!isSelectionMode) {
    return (
      <button
        onClick={enableSelectionMode}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        aria-label="Enable selection mode"
      >
        Enable Selection Mode
      </button>
    );
  }

  // In selection mode - show full controls
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      {/* Selected count */}
      <div className="text-sm font-medium text-blue-900">
        {selectedCount} event{selectedCount !== 1 ? 's' : ''} selected
      </div>

      {/* Select All button (T075) */}
      <button
        onClick={() => selectAll(visibleEventIds)}
        className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
        disabled={selectedCount === visibleEventIds.length}
        aria-label="Select all events"
      >
        Select All ({visibleEventIds.length})
      </button>

      {/* Clear Selection button (T075) */}
      <button
        onClick={clearSelection}
        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
        disabled={selectedCount === 0}
        aria-label="Clear selection"
      >
        Clear Selection
      </button>

      {/* Mark Selected as... dropdown (T071) */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Mark selected as:</span>
          <select
            onChange={(e) => {
              const newStatus = e.target.value as EventStatus;
              if (newStatus) {
                bulkUpdateStatus(newStatus);
                e.target.value = ''; // Reset select after action
              }
            }}
            disabled={isUpdating}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Select new status for bulk update"
            defaultValue=""
          >
            <option value="" disabled>
              Choose status...
            </option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      )}

      {/* Delete Selected button */}
      {selectedCount > 0 && (
        <button
          onClick={handleDeleteClick}
          disabled={isUpdating}
          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Delete ${selectedCount} selected event${selectedCount !== 1 ? 's' : ''}`}
        >
          Delete Selected ({selectedCount})
        </button>
      )}

      {/* Disable Selection Mode button */}
      <button
        onClick={disableSelectionMode}
        className="ml-auto px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
        aria-label="Disable selection mode"
      >
        Done
      </button>

      {/* Loading indicator */}
      {isUpdating && (
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Updating...</span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Selected Events"
        message={`Are you sure you want to delete ${selectedCount} event${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedCount} Event${selectedCount !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isUpdating}
      />
    </div>
  );
}
