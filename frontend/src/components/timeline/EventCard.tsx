import { EventWithDetails } from '../../types/Event';
import { format } from 'date-fns';

interface EventCardProps {
  event: EventWithDetails;
  onClick?: () => void;
}

function EventCard({ event, onClick }: EventCardProps) {
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
    <div
      onClick={onClick}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftColor: event.categoryColor, borderLeftWidth: '4px' }}
    >
      {/* Event Title */}
      <h3 className="mb-2 font-semibold text-gray-900">{event.title}</h3>

      {/* Event Date */}
      <p className="mb-2 text-sm text-gray-600">
        {format(new Date(event.date), 'MMM dd, yyyy')}
      </p>

      {/* Event Description */}
      {event.description && (
        <p className="mb-3 line-clamp-2 text-sm text-gray-700">{event.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {/* Category */}
        <span
          className="rounded-full px-2 py-1 text-xs font-medium"
          style={{ backgroundColor: event.categoryColor + '20', color: event.categoryColor }}
        >
          {event.categoryName}
        </span>

        {/* Status */}
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
          {event.status}
        </span>

        {/* Priority */}
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(event.priority)}`}>
          {event.priority}
        </span>
      </div>

      {/* Assigned Person */}
      {event.assignedPerson && (
        <p className="mt-3 text-xs text-gray-500">Assigned to: {event.assignedPerson}</p>
      )}
    </div>
  );
}

export default EventCard;
