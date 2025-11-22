/**
 * Copy Timeline Modal Component
 * Feature: 001-multi-timeline-system (User Story 6)
 *
 * Modal wrapper for the copy timeline form
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timelinesApi } from '../../services/timelinesApi';
import { timelineKeys } from '../../hooks/useTimelines';
import { CopyTimelineDto, TimelineWithStats } from '../../types/timeline';
import { toast } from '../../utils/toast';
import CopyTimelineForm from './CopyTimelineForm';

interface CopyTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTimeline: TimelineWithStats;
}

export default function CopyTimelineModal({
  isOpen,
  onClose,
  sourceTimeline,
}: CopyTimelineModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  const copyMutation = useMutation({
    mutationFn: (data: CopyTimelineDto) =>
      timelinesApi.copy(sourceTimeline.id, data),
    onSuccess: (newTimeline) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.lists() });
      toast.success(`Timeline "${newTimeline.name}" created successfully`);
      onClose();
      navigate(`/timeline/${newTimeline.id}/settings`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to copy timeline');
    },
  });

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !copyMutation.isPending) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, copyMutation.isPending]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !copyMutation.isPending) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="copy-timeline-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id="copy-timeline-title" className="text-lg font-semibold text-gray-900">
            Copy Timeline
          </h2>
          <button
            onClick={onClose}
            disabled={copyMutation.isPending}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <CopyTimelineForm
            sourceTimeline={sourceTimeline}
            onSubmit={(data) => copyMutation.mutate(data)}
            onCancel={onClose}
            isLoading={copyMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
