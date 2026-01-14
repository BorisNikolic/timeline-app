import { Fragment, useEffect } from 'react';
import EventForm from './EventForm';
import { CreateEventDto, EventWithDetails, UpdateEventDto } from '../../types/Event';
import { TimelineStatus } from '../../types/timeline';
import { useCreateTimelineEvent, useUpdateTimelineEvent } from '../../hooks/useEvents';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  timelineId: string; // Required - events must belong to a timeline
  event?: EventWithDetails; // If provided, we're in edit mode
  duplicateData?: CreateEventDto; // If provided, we're duplicating an event
  timelineStatus?: TimelineStatus; // Timeline status for retrospective fields
}

function EventModal({ isOpen, onClose, timelineId, event, duplicateData, timelineStatus }: EventModalProps) {
  const createEvent = useCreateTimelineEvent(timelineId);
  const updateEvent = useUpdateTimelineEvent(timelineId);
  const isEditMode = !!event;
  const isDuplicateMode = !!duplicateData;

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (data: CreateEventDto) => {
    if (isEditMode) {
      // Edit mode - update existing event
      await updateEvent.mutateAsync({ eventId: event.id, data: data as UpdateEventDto });
    } else {
      // Create mode - create new event
      await createEvent.mutateAsync(data);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Event' : isDuplicateMode ? 'Duplicate Event' : 'Create New Event'}
          </h2>
          <EventForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isEditMode ? updateEvent.isPending : createEvent.isPending}
            mode={isEditMode ? 'edit' : 'create'}
            timelineStatus={timelineStatus}
            timelineId={timelineId}
            initialData={
              isEditMode
                ? {
                    title: event.title,
                    date: event.date.split('T')[0], // Ensure YYYY-MM-DD format
                    time: event.time,
                    endTime: event.endTime,
                    description: event.description,
                    categoryId: event.categoryId,
                    assignedPerson: event.assignedPerson,
                    status: event.status,
                    priority: event.priority,
                    retroNotes: event.retroNotes,
                    outcomeTag: event.outcomeTag,
                  }
                : isDuplicateMode
                ? duplicateData
                : undefined
            }
          />
        </div>
      </div>
    </Fragment>
  );
}

export default EventModal;
