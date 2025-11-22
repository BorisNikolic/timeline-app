import { useState, useMemo, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import CategoryLane from './CategoryLane';
import EventDetailView from '../events/EventDetailView';
import EventModal from '../events/EventModal';
import EventList from '../events/EventList';
import DeleteConfirmDialog from '../shared/DeleteConfirmDialog';
import { ScrollIndicatorBadge } from '../shared/ScrollIndicatorBadge';
import { EventWithDetails, CreateEventDto } from '../../types/Event';
import { TimelineStatus } from '../../types/timeline';
import { useEvents } from '../../hooks/useEvents';
import { useCategories } from '../../hooks/useCategories';
import { useDeleteEvent } from '../../hooks/useEvents';
import { useTimelineRole } from '../../hooks/useTimelineRole';

interface TimelineProps {
  events?: EventWithDetails[];
  timelineId?: string; // Optional - needed for event modal operations
  timelineStatus?: TimelineStatus; // Optional - needed for retrospective fields
}

function Timeline({ events: propsEvents, timelineId, timelineStatus }: TimelineProps) {
  const { data: fetchedEvents = [], isLoading, error } = useEvents();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Use props events if provided (for search filtering), otherwise use fetched events
  const events = propsEvents || fetchedEvents;
  const deleteEvent = useDeleteEvent();

  // Role-based permissions
  const { canEdit } = useTimelineRole(timelineId);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicateEventData, setDuplicateEventData] = useState<CreateEventDto | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [hiddenCategoriesCount, setHiddenCategoriesCount] = useState(0);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);

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

  // Scroll indicator tracking for category lanes (when not using virtual scrolling)
  useEffect(() => {
    const container = categoriesContainerRef.current;
    if (!container || categories.length === 0) {
      setShowScrollIndicator(false);
      return;
    }

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollBottom = scrollTop + clientHeight;

      // Check if container is actually scrollable
      if (scrollHeight <= clientHeight) {
        setShowScrollIndicator(false);
        setHiddenCategoriesCount(0);
        return;
      }

      // Calculate how much content is hidden below
      const contentBelow = scrollHeight - scrollBottom;

      // Check if near bottom (within 50px)
      const isNearBottom = contentBelow < 50;

      // Show indicator if there's significant content below and we're not at bottom
      if (!isNearBottom && contentBelow > 100) {
        // Estimate how many categories are below based on average visible height
        const avgCategoryHeight = scrollHeight / categories.length;
        const estimatedHiddenCategories = Math.max(1, Math.ceil(contentBelow / avgCategoryHeight));
        setHiddenCategoriesCount(estimatedHiddenCategories);
        setShowScrollIndicator(true);
      } else {
        setShowScrollIndicator(false);
        setHiddenCategoriesCount(0);
      }
    };

    // Initial check
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [categories.length]);

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
          canEdit={canEdit}
        />
      </div>
    );
  };

  // Render events grouped by category lanes with virtual scrolling
  return (
    <div className="space-y-6 relative">
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
        <div
          ref={categoriesContainerRef}
          className="space-y-6 max-h-[80vh] overflow-y-auto"
        >
          {categories.map((category) => {
            const categoryEvents = eventsByCategory.get(category.id) || [];
            return (
              <CategoryLane
                key={category.id}
                categoryName={category.name}
                categoryColor={category.color}
                events={categoryEvents}
                onEventClick={setSelectedEvent}
                canEdit={canEdit}
              />
            );
          })}
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && !isEditModalOpen && (
        <EventDetailView
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={canEdit ? handleEditEvent : undefined}
          onDelete={canEdit ? handleDeleteClick : undefined}
          onDuplicate={canEdit ? handleDuplicate : undefined}
        />
      )}

      {/* Edit event modal */}
      {timelineId && (
        <EventModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          timelineId={timelineId}
          event={selectedEvent || undefined}
          timelineStatus={timelineStatus}
        />
      )}

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
      {timelineId && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setDuplicateEventData(null);
          }}
          timelineId={timelineId}
          duplicateData={duplicateEventData || undefined}
        />
      )}

      {/* Event List View */}
      {events.length > 0 && (
        <EventList
          events={events}
          onEventClick={setSelectedEvent}
          showOutcomeFilter={timelineStatus === 'Completed' || timelineStatus === 'Archived'}
        />
      )}

      {/* Scroll Indicator Badge */}
      <ScrollIndicatorBadge
        count={hiddenCategoriesCount}
        isVisible={showScrollIndicator}
        itemType="categories"
      />
    </div>
  );
}

export default Timeline;
