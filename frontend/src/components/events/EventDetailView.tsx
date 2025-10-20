import { useEffect } from 'react';
import { EventWithDetails } from '../../types/Event';
import { format } from 'date-fns';

interface EventDetailViewProps {
  event: EventWithDetails;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function EventDetailView({ event, onClose, onEdit, onDelete }: EventDetailViewProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Created {format(new Date(event.createdAt), 'MMM dd, yyyy')} by {event.createdByName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Event Details */}
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <p className="mt-1 text-base text-gray-900">
              {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
              {event.time && <span className="ml-2 text-indigo-600">at {event.time}</span>}
            </p>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: event.categoryColor }}
              />
              <span className="text-base text-gray-900">{event.categoryName}</span>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <span className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(event.priority)}`}>
                {event.priority}
              </span>
            </div>
          </div>

          {/* Assigned Person */}
          {event.assignedPerson && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned To</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-base text-gray-900">{event.assignedPerson}</span>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Updated</label>
            <p className="mt-1 text-sm text-gray-500">
              {format(new Date(event.updatedAt), 'MMM dd, yyyy \'at\' h:mm a')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              Delete Event
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Edit Event
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetailView;
