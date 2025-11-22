/**
 * CreateTimelineModal component
 * Feature: 001-multi-timeline-system
 *
 * Modal for creating a new timeline, with optional template selection
 */

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TimelineForm } from './TimelineForm';
import TemplateSelector from './TemplateSelector';
import { useCreateTimeline, timelineKeys } from '../../hooks/useTimelines';
import { timelinesApi } from '../../services/timelinesApi';
import { useTimelineStore } from '../../stores/timelineStore';
import { CreateTimelineDto, TimelineWithStats, CopyTimelineDto } from '../../types/timeline';
import { toast } from '../../utils/toast';

interface CreateTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTimelineModal({ isOpen, onClose }: CreateTimelineModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { setCurrentTimeline } = useTimelineStore();
  const { mutate: createTimeline, isPending: isCreating } = useCreateTimeline();

  // Track selected template
  const [selectedTemplate, setSelectedTemplate] = useState<TimelineWithStats | null>(null);

  // Mutation for copying from template
  const copyFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: CopyTimelineDto }) =>
      timelinesApi.copy(templateId, data),
    onSuccess: (newTimeline) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.lists() });
      setCurrentTimeline(newTimeline.id, 'Admin');
      toast.success(`Timeline "${newTimeline.name}" created from template`);
      onClose();
      // Reset selection for next time
      setSelectedTemplate(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create timeline from template');
    },
  });

  const isPending = isCreating || copyFromTemplateMutation.isPending;

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPending) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isPending]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isPending) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, isPending]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (data: CreateTimelineDto) => {
    if (selectedTemplate) {
      // Copy from template with the new name and dates
      const copyData: CopyTimelineDto = {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        includeCategories: true,
        includeEvents: true,
        includeAssignments: false, // Don't copy assignments - new team
      };
      copyFromTemplateMutation.mutate({
        templateId: selectedTemplate.id,
        data: copyData,
      });
    } else {
      // Create blank timeline
      createTimeline(data, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const handleTemplateSelect = (template: TimelineWithStats | null) => {
    setSelectedTemplate(template);
  };

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
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Timeline
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedTemplate
                ? `Based on template: ${selectedTemplate.name}`
                : 'Set up a new timeline for your festival or project'}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Template Selector */}
            <TemplateSelector
              onSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?.id}
            />

            {/* Timeline Form */}
            <TimelineForm
              onSubmit={handleSubmit}
              onCancel={onClose}
              isLoading={isPending}
              submitLabel={selectedTemplate ? 'Create from Template' : 'Create Timeline'}
              initialData={selectedTemplate ? {
                themeColor: selectedTemplate.themeColor,
              } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTimelineModal;
