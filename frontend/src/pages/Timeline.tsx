import { useState } from 'react';
import Timeline from '../components/timeline/Timeline';
import EventModal from '../components/events/EventModal';
import ExportMenu from '../components/export/ExportMenu';
import { ViewToggle } from '../components/timeline/ViewToggle';
import { ChronologicalTimeline } from '../components/timeline/ChronologicalTimeline';
import { useTimelineViewState } from '../hooks/useTimelineViewState';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import EventDetailView from '../components/events/EventDetailView';
import DeleteConfirmDialog from '../components/shared/DeleteConfirmDialog';
import { useDeleteEvent } from '../hooks/useEvents';
import { EventWithDetails } from '../types/Event';

function TimelinePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Timeline view state
  const { viewMode, setViewMode } = useTimelineViewState();

  // Data hooks
  const { data: events = [], isLoading } = useEvents();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const deleteEvent = useDeleteEvent();

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

  const handleEventClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Event button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your festival events on the timeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu />
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            + Add Event
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <ViewToggle
        currentView={viewMode}
        onViewChange={setViewMode}
      />

      {/* Conditional Timeline View */}
      {viewMode === 'category' ? (
        <Timeline />
      ) : (
        <ChronologicalTimeline
          events={events}
          categories={categories}
          onEventClick={handleEventClick}
        />
      )}

      {/* Event Modal for adding new events */}
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Event detail modal */}
      {selectedEvent && !isEditModalOpen && (
        <EventDetailView
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteClick}
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
    </div>
  );
}

export default TimelinePage;
