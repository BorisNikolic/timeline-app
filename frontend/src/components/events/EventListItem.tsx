import { EventWithDetails } from '../../types/Event';
import { format } from 'date-fns';

interface EventListItemProps {
  event: EventWithDetails;
  onClick: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

function EventListItem({
  event,
  onClick,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
}: EventListItemProps) {
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

  // Handle checkbox change separately from row click
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event detail modal from opening
    onToggleSelection?.();
  };

  return (
    <div
      onClick={isSelectionMode ? undefined : onClick}
      className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:shadow-md'
      }`}
    >
      {/* Checkbox (T070) - 24px minimum for mobile touch targets */}
      {isSelectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
          aria-label={`Select ${event.title}`}
        />
      )}

      {/* Category Indicator */}
      <div
        className="h-12 w-1 flex-shrink-0 rounded-full"
        style={{ backgroundColor: event.categoryColor }}
      />

      {/* Event Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {format(new Date(event.date), 'MMM dd, yyyy')}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <span
              className="rounded-full px-2 py-1 text-xs font-medium"
              style={{ backgroundColor: event.categoryColor + '20', color: event.categoryColor }}
            >
              {event.categoryName}
            </span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(event.priority)}`}>
              {event.priority}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">{event.description}</p>
        )}

        {/* Assigned Person */}
        {event.assignedPerson && (
          <p className="mt-2 text-xs text-gray-500">
            Assigned to: {event.assignedPerson}
          </p>
        )}
      </div>
    </div>
  );
}

export default EventListItem;
