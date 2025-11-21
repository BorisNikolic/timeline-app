import { EventWithDetails } from '../../types/Event';
import { format } from 'date-fns';
import QuickStatusDropdown from '../events/QuickStatusDropdown';

interface EventCardProps {
  event: EventWithDetails;
  onClick?: () => void;
}

function EventCard({ event, onClick }: EventCardProps) {
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

  // User Story 2: Visual Priority Indicators
  // Returns priority-specific border color (left border)
  const getPriorityBorderColor = (priority: string): string => {
    switch (priority) {
      case 'High':
        return '#ef4444'; // Tailwind red-500
      case 'Medium':
        return '#eab308'; // Tailwind yellow-500
      case 'Low':
        return '#d1d5db'; // Tailwind gray-300
      default:
        return '#d1d5db';
    }
  };

  // User Story 2: Visual Priority Indicators
  // Returns priority-specific background color (subtle tint)
  const getPriorityBackgroundColor = (priority: string): string => {
    switch (priority) {
      case 'High':
        return 'bg-red-50';
      case 'Medium':
        return 'bg-yellow-50';
      case 'Low':
        return 'bg-gray-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow-md ${getPriorityBackgroundColor(event.priority)}`}
      style={{
        borderLeftColor: getPriorityBorderColor(event.priority),
        borderLeftWidth: '4px'
      }}
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

        {/* Status - Quick Status Toggle (User Story 1) */}
        <QuickStatusDropdown
          eventId={event.id}
          currentStatus={event.status}
        />

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
