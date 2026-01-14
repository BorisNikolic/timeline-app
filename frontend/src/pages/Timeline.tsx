import { useState, Fragment, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Timeline from '../components/timeline/Timeline';
import EventModal from '../components/events/EventModal';
import ExportMenu, { ExportMenuRef } from '../components/export/ExportMenu';
import { ViewToggle } from '../components/timeline/ViewToggle';
import { ChronologicalTimeline } from '../components/timeline/ChronologicalTimeline';
import { useTimelineViewState } from '../hooks/useTimelineViewState';
import { useTimelineEvents, useDeleteTimelineEvent } from '../hooks/useEvents';
import { useTimelineCategories } from '../hooks/useCategories';
import EventDetailView from '../components/events/EventDetailView';
import DeleteConfirmDialog from '../components/shared/DeleteConfirmDialog';
import { EventWithDetails, CreateEventDto } from '../types/Event';
import CategoryManagement from '../components/categories/CategoryManagement';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import StatusDashboardWidget from '../components/dashboard/StatusDashboardWidget';
import EventSearchInput from '../components/search/EventSearchInput';
import { useEventSearch } from '../hooks/useEventSearch';
import { useTimelineStore } from '../stores/timelineStore';
import { useTimeline } from '../hooks/useTimelines';
import { useTimelineRole } from '../hooks/useTimelineRole';
import axios, { AxiosError } from 'axios';

/**
 * Helper to check if an error is a 403 Forbidden
 * Handles both raw Axios errors and wrapped errors from the API client interceptor
 */
function isForbiddenError(error: unknown): boolean {
  // Check direct axios error
  if (axios.isAxiosError(error)) {
    return error.response?.status === 403;
  }

  // Check for wrapped error from API client interceptor
  const wrappedError = error as Error & { originalError?: AxiosError };
  if (wrappedError?.originalError && axios.isAxiosError(wrappedError.originalError)) {
    return wrappedError.originalError.response?.status === 403;
  }

  // Also check error message for 403 indication
  if (error instanceof Error && error.message.includes('permission')) {
    return true;
  }

  return false;
}

/**
 * Access Denied Component
 */
function AccessDeniedView() {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
      <p className="text-gray-600 text-center max-w-md">
        You don't have permission to access this timeline. Please contact the timeline owner to request access.
      </p>
      <Link
        to="/dashboard"
        className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>
    </div>
  );
}

function TimelinePage() {
  const { timelineId } = useParams<{ timelineId: string }>();
  const navigate = useNavigate();
  const { setCurrentTimeline, currentTimelineId } = useTimelineStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [duplicateEventData, setDuplicateEventData] = useState<CreateEventDto | null>(null);
  const [scrollToEventId, setScrollToEventId] = useState<string | null>(null);
  const exportMenuRef = useRef<ExportMenuRef>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set current timeline in store when URL param changes
  useEffect(() => {
    if (timelineId && timelineId !== currentTimelineId) {
      setCurrentTimeline(timelineId);
    } else if (!timelineId && currentTimelineId) {
      // If no timelineId in URL but we have one in store, redirect to it
      navigate(`/timeline/${currentTimelineId}`, { replace: true });
    } else if (!timelineId && !currentTimelineId) {
      // No timeline selected, redirect to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [timelineId, currentTimelineId, setCurrentTimeline, navigate]);

  // Timeline view state
  const { viewMode, setViewMode } = useTimelineViewState();

  // Get the effective timeline ID (from URL or store)
  const effectiveTimelineId = timelineId || currentTimelineId;

  // Fetch timeline details
  const { data: timeline, error: timelineError, isLoading: timelineLoading } = useTimeline(effectiveTimelineId || undefined);

  // Data hooks - use timeline-scoped hooks
  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useTimelineEvents(effectiveTimelineId);
  const { data: categories = [] } = useTimelineCategories(effectiveTimelineId);
  const deleteEvent = useDeleteTimelineEvent(effectiveTimelineId || '');

  // Search functionality
  const { searchTerm, setSearchTerm, filteredEvents, clearSearch, hasActiveSearch } = useEventSearch(events);

  // Role-based permissions
  const { canEdit } = useTimelineRole(effectiveTimelineId || undefined);

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

  // Show loading state while fetching timeline data
  if (!effectiveTimelineId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Redirecting to dashboard...</div>
      </div>
    );
  }

  // Check for 403 Forbidden error - show Access Denied page
  if (isForbiddenError(timelineError) || isForbiddenError(eventsError)) {
    return <AccessDeniedView />;
  }

  if (timelineLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header with Search and Action Buttons */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-festival-navy to-primary-600 bg-clip-text text-transparent">
              {timeline?.name || 'Timeline'}
            </h1>
            <p className="mt-0.5 text-xs text-gray-600">
              {timeline?.description || 'Manage your festival events'}
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
              {/* Schedule View Link */}
              <Link
                to={`/schedule/${effectiveTimelineId}`}
                className="flex items-center gap-1.5 rounded-lg border-2 border-gray-300 bg-transparent px-3 py-1.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-100 hover:border-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">Schedule View</span>
                <span className="sm:hidden">Schedule</span>
              </Link>
              {canEdit && (
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
              )}
              <ExportMenu ref={exportMenuRef} />
              {canEdit && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-primary-600 hover:to-primary-700 whitespace-nowrap"
                >
                  + Add Event
                </button>
              )}
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
        <Timeline events={filteredEvents} timelineId={timelineId} timelineStatus={timeline?.status} />
      ) : (
        <ChronologicalTimeline
          events={filteredEvents}
          categories={categories}
          onEventClick={handleEventClick}
          timelineStartDate={timeline?.startDate}
          timelineEndDate={timeline?.endDate}
          scrollToEventId={scrollToEventId}
          onScrollComplete={() => setScrollToEventId(null)}
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
      {timelineId && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setDuplicateEventData(null);
          }}
          timelineId={timelineId}
          duplicateData={duplicateEventData || undefined}
          timelineStatus={timeline?.status}
          onEventSaved={setScrollToEventId}
        />
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
          timelineStatus={timeline?.status}
          onEventSaved={setScrollToEventId}
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
              <CategoryManagement timelineId={timelineId!} />
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
}

export default TimelinePage;
