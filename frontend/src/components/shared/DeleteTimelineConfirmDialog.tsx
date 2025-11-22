/**
 * DeleteTimelineConfirmDialog component
 * Feature: 001-multi-timeline-system
 *
 * Confirmation dialog for deleting a timeline
 */

import { useEffect, useRef, useState } from 'react';

interface DeleteTimelineConfirmDialogProps {
  isOpen: boolean;
  timelineName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteTimelineConfirmDialog({
  isOpen,
  timelineName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteTimelineConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset confirm text when dialog opens
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      // Focus input after a short delay
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const canDelete = confirmText.toLowerCase() === 'delete';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
        >
          {/* Header */}
          <div className="bg-red-50 px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800">
                  Delete Timeline
                </h3>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{timelineName}</span>?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              This action cannot be undone. All events, categories, and member
              associations will be permanently deleted.
            </p>

            <div className="mt-4">
              <label
                htmlFor="confirmDelete"
                className="block text-sm font-medium text-gray-700"
              >
                Type <span className="font-semibold">delete</span> to confirm
              </label>
              <input
                ref={inputRef}
                type="text"
                id="confirmDelete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                placeholder="delete"
                disabled={isDeleting}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canDelete || isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Timeline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteTimelineConfirmDialog;
