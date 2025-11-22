import { EventWithDetails } from '../../types/Event';
import EventCard from './EventCard';

interface CategoryLaneProps {
  categoryName: string;
  categoryColor: string;
  events: EventWithDetails[];
  onEventClick: (event: EventWithDetails) => void;
  canEdit?: boolean;
}

function CategoryLane({ categoryName, categoryColor, events, onEventClick, canEdit = true }: CategoryLaneProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Category Header */}
      <div className="mb-3 flex items-center gap-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: categoryColor }}
        />
        <h2 className="text-lg font-semibold text-gray-900">{categoryName}</h2>
        <span className="text-sm text-gray-500">({events.length})</span>
      </div>

      {/* Horizontal Scrollable Event Lane */}
      <div className="relative">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (
                <div key={event.id} className="w-80 flex-shrink-0">
                  <EventCard event={event} onClick={() => onEventClick(event)} canEdit={canEdit} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryLane;
