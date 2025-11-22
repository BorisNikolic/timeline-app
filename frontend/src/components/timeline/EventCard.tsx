import { EventWithDetails } from '../../types/Event';
import { format } from 'date-fns';
import QuickStatusDropdown from '../events/QuickStatusDropdown';
import OutcomeTagBadge from '../shared/OutcomeTagBadge';

interface EventCardProps {
  event: EventWithDetails;
  onClick?: () => void;
  canEdit?: boolean;
}

function EventCard({ event, onClick, canEdit = true }: EventCardProps) {
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

        {/* Status - Quick Status Toggle (User Story 1) - only for editors */}
        {canEdit ? (
          <QuickStatusDropdown
            eventId={event.id}
            currentStatus={event.status}
          />
        ) : (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
            event.status === 'Completed' ? 'bg-green-100 text-green-800' :
            event.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {event.status}
          </span>
        )}

        {/* Priority */}
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(event.priority)}`}>
          {event.priority}
        </span>

        {/* Outcome Tag (US8: Retrospective) */}
        {event.outcomeTag && (
          <OutcomeTagBadge tag={event.outcomeTag} size="sm" />
        )}
      </div>

      {/* Assigned Person */}
      {event.assignedPerson && (
        <p className="mt-3 text-xs text-gray-500">Assigned to: {event.assignedPerson}</p>
      )}

      {/* Retro Notes Preview (US8: Retrospective) */}
      {event.retroNotes && (
        <div
          className="mt-3 text-xs text-purple-600 line-clamp-1 cursor-help"
          title={event.retroNotes}
        >
          <span className="inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {event.retroNotes}
          </span>
        </div>
      )}
    </div>
  );
}

export default EventCard;
