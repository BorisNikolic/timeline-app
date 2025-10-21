import { useState, Fragment, useRef } from 'react';
import Timeline from '../components/timeline/Timeline';
import EventModal from '../components/events/EventModal';
import ExportMenu, { ExportMenuRef } from '../components/export/ExportMenu';
import { ViewToggle } from '../components/timeline/ViewToggle';
import { ChronologicalTimeline } from '../components/timeline/ChronologicalTimeline';
import { useTimelineViewState } from '../hooks/useTimelineViewState';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import EventDetailView from '../components/events/EventDetailView';
import DeleteConfirmDialog from '../components/shared/DeleteConfirmDialog';
import { useDeleteEvent } from '../hooks/useEvents';
import { EventWithDetails, CreateEventDto } from '../types/Event';
import CategoryManagement from '../components/categories/CategoryManagement';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import StatusDashboardWidget from '../components/dashboard/StatusDashboardWidget';
import EventSearchInput from '../components/search/EventSearchInput';
import { useEventSearch } from '../hooks/useEventSearch';

function TimelinePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [duplicateEventData, setDuplicateEventData] = useState<CreateEventDto | null>(null);
  const exportMenuRef = useRef<ExportMenuRef>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Timeline view state
  const { viewMode, setViewMode } = useTimelineViewState();

  // Data hooks
  const { data: events = [], isLoading } = useEvents();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const deleteEvent = useDeleteEvent();

  // Search functionality
  const { searchTerm, setSearchTerm, filteredEvents, clearSearch, hasActiveSearch } = useEventSearch(events);

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

  const handleDuplicate = (eventData: CreateEventDto) => {
    setDuplicateEventData(eventData);
    setSelectedEvent(null); // Close the detail view
    setIsModalOpen(true); // Open modal with duplicated data
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewEvent: () => setIsModalOpen(true),
    onExport: () => exportMenuRef.current?.toggle(),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onCloseModal: () => {
      if (isModalOpen) setIsModalOpen(false);
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
        setSelectedEvent(null);
      }
      if (selectedEvent && !isEditModalOpen) setSelectedEvent(null);
      if (isDeleteDialogOpen) setIsDeleteDialogOpen(false);
      if (isCategoryManagementOpen) setIsCategoryManagementOpen(false);
    },
  });

  return (
    <div className="space-y-4">
      {/* Compact Header with Search and Action Buttons */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-festival-navy to-primary-600 bg-clip-text text-transparent">
              Timeline
            </h1>
            <p className="mt-0.5 text-xs text-gray-600">
              Manage your festival events
            </p>
          </div>

          {/* Search and Actions Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 lg:flex-initial">
            {/* Search Input - takes available space on desktop */}
            <div className="w-full sm:w-64 lg:w-80">
              <EventSearchInput
                ref={searchInputRef}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClear={clearSearch}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsCategoryManagementOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border-2 border-primary-500 bg-transparent px-3 py-1.5 text-sm font-semibold text-primary-600 transition-all hover:bg-primary-500 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="hidden sm:inline">Manage Categories</span>
                <span className="sm:hidden">Categories</span>
              </button>
              <ExportMenu ref={exportMenuRef} />
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-primary-600 hover:to-primary-700 whitespace-nowrap"
              >
                + Add Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Status Dashboard */}
      <StatusDashboardWidget events={events} />

      {/* View Toggle */}
      <ViewToggle
        currentView={viewMode}
        onViewChange={setViewMode}
      />

      {/* Conditional Timeline View */}
      {viewMode === 'category' ? (
        <Timeline events={filteredEvents} />
      ) : (
        <ChronologicalTimeline
          events={filteredEvents}
          categories={categories}
          onEventClick={handleEventClick}
        />
      )}

      {/* No Results Message */}
      {hasActiveSearch && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No events found matching "{searchTerm}"
          </p>
        </div>
      )}

      {/* Event Modal for adding new events or duplicating */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDuplicateEventData(null);
        }}
        duplicateData={duplicateEventData || undefined}
      />

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
