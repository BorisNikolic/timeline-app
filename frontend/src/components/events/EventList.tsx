import { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { EventWithDetails, EventStatus, EventPriority } from '../../types/Event';
import EventListItem from './EventListItem';

interface EventListProps {
  events: EventWithDetails[];
  onEventClick: (event: EventWithDetails) => void;
}

type SortOption = 'date' | 'urgency' | 'priority';

function EventList({ events, onEventClick }: EventListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<EventPriority | 'all'>('all');

  // Apply filters
  let filteredEvents = [...events];

  if (filterStatus !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.status === filterStatus);
  }

  if (filterPriority !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.priority === filterPriority);
  }

  // Apply sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'urgency': {
        const now = new Date().getTime();
        const diffA = Math.abs(new Date(a.date).getTime() - now);
        const diffB = Math.abs(new Date(b.date).getTime() - now);
        return diffA - diffB;
      }
      case 'priority': {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      case 'date':
      default:
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">Event List</h2>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="date">Date</option>
            <option value="urgency">Urgency</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            id="status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EventStatus | 'all')}
            className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value={EventStatus.NotStarted}>Not Started</option>
            <option value={EventStatus.InProgress}>In Progress</option>
            <option value={EventStatus.Completed}>Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="priority" className="text-sm font-medium text-gray-700">
            Priority:
          </label>
          <select
            id="priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as EventPriority | 'all')}
            className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value={EventPriority.High}>High</option>
            <option value={EventPriority.Medium}>Medium</option>
            <option value={EventPriority.Low}>Low</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          Showing {sortedEvents.length} of {events.length} events
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No events match your filters</p>
          </div>
        ) : sortedEvents.length > 50 ? (
          // Use virtual scrolling for 50+ events to maintain performance
          <List
            height={600}
            itemCount={sortedEvents.length}
            itemSize={120}
            width="100%"
          >
            {({ index, style }) => (
              <div style={style} className="px-1 py-1.5">
                <EventListItem
                  event={sortedEvents[index]}
                  onClick={() => onEventClick(sortedEvents[index])}
                />
              </div>
            )}
          </List>
        ) : (
          sortedEvents.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default EventList;
