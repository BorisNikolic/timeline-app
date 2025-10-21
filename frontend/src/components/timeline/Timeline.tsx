import { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import EventCard from './EventCard';
import CategoryLane from './CategoryLane';
import EventDetailView from '../events/EventDetailView';
import EventModal from '../events/EventModal';
import EventList from '../events/EventList';
import DeleteConfirmDialog from '../shared/DeleteConfirmDialog';
import { EventWithDetails, CreateEventDto } from '../../types/Event';
import { useEvents } from '../../hooks/useEvents';
import { useCategories } from '../../hooks/useCategories';
import { useDeleteEvent } from '../../hooks/useEvents';

interface TimelineProps {
  events?: EventWithDetails[];
}

function Timeline({ events: propsEvents }: TimelineProps) {
  const { data: fetchedEvents = [], isLoading, error } = useEvents();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Use props events if provided (for search filtering), otherwise use fetched events
  const events = propsEvents || fetchedEvents;
  const deleteEvent = useDeleteEvent();
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicateEventData, setDuplicateEventData] = useState<CreateEventDto | null>(null);

  const handleEditEvent = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedEvent) {
      await deleteEvent.mutateAsync(selectedEvent.id);
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleDuplicate = (eventData: CreateEventDto) => {
    setDuplicateEventData(eventData);
    setSelectedEvent(null); // Close the detail view
    setIsModalOpen(true); // Open modal with duplicated data
  };

  // Group events by category
  const eventsByCategory = useMemo(() => {
    const grouped = new Map<string, EventWithDetails[]>();

    events.forEach((event) => {
      const categoryId = event.categoryId;
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, []);
      }
      grouped.get(categoryId)!.push(event);
    });

    return grouped;
  }, [events]);

  if (isLoading || categoriesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">Failed to load events</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="mb-2 text-lg font-medium">No events yet</p>
          <p className="text-sm">Click "Add Event" to create your first event</p>
        </div>
      </div>
    );
  }

  // Virtual scrolling row renderer for category lanes
  const CategoryRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const category = categories[index];
    const categoryEvents = eventsByCategory.get(category.id) || [];

    return (
      <div style={style}>
        <CategoryLane
          categoryName={category.name}
          categoryColor={category.color}
          events={categoryEvents}
          onEventClick={setSelectedEvent}
        />
      </div>
    );
  };

  // Render events grouped by category lanes with virtual scrolling
  return (
    <div className="space-y-6">
      {/* Virtual scrolling for category lanes when we have many categories */}
      {categories.length > 10 ? (
        <List
          height={600}
          itemCount={categories.length}
          itemSize={200}
          width="100%"
        >
          {CategoryRow}
        </List>
      ) : (
        categories.map((category) => {
          const categoryEvents = eventsByCategory.get(category.id) || [];
          return (
            <CategoryLane
              key={category.id}
              categoryName={category.name}
              categoryColor={category.color}
              events={categoryEvents}
              onEventClick={setSelectedEvent}
            />
          );
        })
      )}

      {/* Event detail modal */}
      {selectedEvent && !isEditModalOpen && (
        <EventDetailView
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteClick}
          onDuplicate={handleDuplicate}
        />
      )}

      {/* Edit event modal */}
      <EventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent || undefined}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deleteEvent.isPending}
      />

      {/* Duplicate event modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDuplicateEventData(null);
        }}
        duplicateData={duplicateEventData || undefined}
      />

      {/* Event List View */}
      {events.length > 0 && (
        <EventList
          events={events}
          onEventClick={setSelectedEvent}
        />
      )}
    </div>
  );
}

export default Timeline;
