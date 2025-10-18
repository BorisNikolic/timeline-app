import { Fragment } from 'react';
import EventForm from './EventForm';
import { CreateEventDto, EventWithDetails, UpdateEventDto } from '../../types/Event';
import { useCreateEvent, useUpdateEvent } from '../../hooks/useEvents';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventWithDetails; // If provided, we're in edit mode
}

function EventModal({ isOpen, onClose, event }: EventModalProps) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const isEditMode = !!event;

  const handleSubmit = async (data: CreateEventDto) => {
    if (isEditMode) {
      // Edit mode - update existing event
      await updateEvent.mutateAsync({ id: event.id, data: data as UpdateEventDto });
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h2>
          <EventForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isEditMode ? updateEvent.isPending : createEvent.isPending}
            initialData={isEditMode ? {
              title: event.title,
              date: event.date,
              description: event.description,
              categoryId: event.categoryId,
              assignedPerson: event.assignedPerson,
              status: event.status,
              priority: event.priority,
            } : undefined}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default EventModal;
