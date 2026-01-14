/**
 * Schedule Page - Festival Schedule Gantt View
 *
 * A single-day Gantt-style view for festival performance schedules.
 * Shows stages as rows, events as horizontal bars positioned by time.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTimeline } from '../hooks/useTimelines';
import { useTimelineEvents } from '../hooks/useEvents';
import { useTimelineCategories } from '../hooks/useCategories';
import { useTimelineStore } from '../stores/timelineStore';
import { useTimelineRole } from '../hooks/useTimelineRole';
import EventModal from '../components/events/EventModal';
import EventDetailView from '../components/events/EventDetailView';
import DeleteConfirmDialog from '../components/shared/DeleteConfirmDialog';
import { EventWithDetails, CreateEventDto } from '../types/Event';
import { useDeleteTimelineEvent } from '../hooks/useEvents';

// Schedule components
import DayPicker from '../components/schedule/DayPicker';
import TimeGrid from '../components/schedule/TimeGrid';
import StageSwimlane from '../components/schedule/StageSwimlane';
import NowIndicator from '../components/schedule/NowIndicator';
import { DEFAULT_SCHEDULE_CONFIG, ScheduleEvent } from '../components/schedule/types';
import {
  getEventsForDate,
  toScheduleEvents,
  isToday,
  getUniqueDatesWithEvents,
} from '../components/schedule/utils';

export default function SchedulePage() {
  const { timelineId } = useParams<{ timelineId: string }>();
  const navigate = useNavigate();
  const { setCurrentTimeline, currentTimelineId } = useTimelineStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [duplicateEventData, setDuplicateEventData] = useState<CreateEventDto | null>(null);

  // Set current timeline in store when URL param changes
  useEffect(() => {
    if (timelineId && timelineId !== currentTimelineId) {
      setCurrentTimeline(timelineId);
    } else if (!timelineId && currentTimelineId) {
      navigate(`/schedule/${currentTimelineId}`, { replace: true });
    } else if (!timelineId && !currentTimelineId) {
      navigate('/dashboard', { replace: true });
    }
  }, [timelineId, currentTimelineId, setCurrentTimeline, navigate]);

  // Effective timeline ID
  const effectiveTimelineId = timelineId || currentTimelineId;

  // Fetch data
  const { data: timeline, isLoading: timelineLoading, error: timelineError } = useTimeline(effectiveTimelineId || undefined);
  const { data: events = [], isLoading: eventsLoading } = useTimelineEvents(effectiveTimelineId);
  const { data: categories = [] } = useTimelineCategories(effectiveTimelineId);
  const deleteEvent = useDeleteTimelineEvent(effectiveTimelineId || '');

  // Role-based permissions
  const { canEdit } = useTimelineRole(effectiveTimelineId || undefined);

  // Schedule config
  const config = DEFAULT_SCHEDULE_CONFIG;

  // Filter events for selected date and convert to schedule events
  const scheduleEvents = useMemo(() => {
    const dayEvents = getEventsForDate(events, selectedDate);
    return toScheduleEvents(dayEvents, config);
  }, [events, selectedDate, config]);

  // Group events by category
  const eventsByCategory = useMemo(() => {
    const grouped = new Map<string, ScheduleEvent[]>();

    scheduleEvents.forEach(event => {
      const existing = grouped.get(event.categoryId) || [];
      grouped.set(event.categoryId, [...existing, event]);
    });

    return grouped;
  }, [scheduleEvents]);

  // Get dates that have events
  const datesWithEvents = useMemo(() => getUniqueDatesWithEvents(events), [events]);

  // Auto-scroll to current time on initial load
  useEffect(() => {
    if (isToday(selectedDate) && scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollToX = (currentHour - 2) * config.pixelsPerHour; // Show 2 hours before current time
      scrollContainerRef.current.scrollLeft = Math.max(0, scrollToX);
    }
  }, [selectedDate, config.pixelsPerHour]);

  // Handlers
  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
  };

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
    setSelectedEvent(null);
    setIsCreateModalOpen(true);
  };

  // Loading state
  if (timelineLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  // Error state
  if (timelineError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">Error loading schedule</p>
        <Link to="/dashboard" className="text-primary-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {timeline?.name || 'Festival Schedule'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {timeline?.description || 'View and manage the festival schedule'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Link to full Timeline view */}
            <Link
              to={`/timeline/${effectiveTimelineId}`}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Timeline View
            </Link>

            {/* Add Event button */}
            {canEdit && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Day Picker */}
      <DayPicker
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        availableDates={datesWithEvents}
      />

      {/* Schedule Grid */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-auto"
        >
          {/* Content wrapper: inline-block ensures min-content width, min-w-full ensures at least viewport width */}
          <div className="inline-block min-w-full">
          {/* Time Grid Header */}
          <div className="sticky top-0 z-30 flex">
            {/* Empty corner for stage labels */}
            <div className="sticky left-0 z-40 w-40 flex-shrink-0 h-10 bg-gray-100 border-b border-r border-gray-300" />

            {/* Time columns */}
            <TimeGrid config={config} />
          </div>

          {/* Swimlanes */}
          <div className="relative">
            {/* Now indicator (only on today) */}
            {isToday(selectedDate) && (
              <div className="absolute top-0 bottom-0 left-40 z-20">
                <NowIndicator config={config} />
              </div>
            )}

            {/* Category swimlanes */}
            {categories.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No stages/categories defined
              </div>
            ) : (
              categories.map(category => (
                <StageSwimlane
                  key={category.id}
                  categoryId={category.id}
                  categoryName={category.name}
                  categoryColor={category.color}
                  events={eventsByCategory.get(category.id) || []}
                  config={config}
                  onEventClick={handleEventClick}
                />
              ))
            )}

            {/* Empty state for no events on this day */}
            {categories.length > 0 && scheduleEvents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-500 bg-white/80 p-4 rounded-lg">
                  <p className="font-medium">No events scheduled</p>
                  <p className="text-sm">for this day</p>
                </div>
              </div>
            )}
          </div>
          </div>{/* Close content wrapper */}
        </div>
      </div>

      {/* Event Detail View */}
      {selectedEvent && !isEditModalOpen && (
        <EventDetailView
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={canEdit ? handleEditEvent : undefined}
          onDelete={canEdit ? handleDeleteClick : undefined}
          onDuplicate={canEdit ? handleDuplicate : undefined}
        />
      )}

      {/* Create Event Modal */}
      <EventModal
        isOpen={isCreateModalOpen}
        timelineId={effectiveTimelineId || ''}
        duplicateData={duplicateEventData || undefined}
        onClose={() => {
          setIsCreateModalOpen(false);
          setDuplicateEventData(null);
        }}
      />

      {/* Edit Event Modal */}
      <EventModal
        isOpen={isEditModalOpen && !!selectedEvent}
        timelineId={effectiveTimelineId || ''}
        event={selectedEvent || undefined}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEvent(null);
        }}
      />

      {/* Delete Confirmation */}
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
