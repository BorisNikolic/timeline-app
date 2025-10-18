import { useState, Fragment } from 'react';
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
import CategoryManagement from '../components/categories/CategoryManagement';

function TimelinePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);

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
          <button
            onClick={() => setIsCategoryManagementOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Manage Categories
          </button>
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

      {/* Category Management Modal */}
      {isCategoryManagementOpen && (
        <Fragment>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsCategoryManagementOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                <button
                  onClick={() => setIsCategoryManagementOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CategoryManagement />
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
}

export default TimelinePage;
