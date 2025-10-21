/**
 * EventDuplicateButton component
 * User Story 3: Event Duplication (P2)
 *
 * Allows copying events with pre-filled form (60% faster than manual entry)
 * Features:
 * - Copies all event fields except id, createdAt, updatedAt
 * - Adds "Copy of " prefix to title
 * - Opens event form with duplicated data for review/modification
 */

import { CreateEventDto, EventWithDetails, EventStatus, EventPriority } from '../../types/Event';

interface EventDuplicateButtonProps {
  event: EventWithDetails;
  onDuplicate: (duplicatedEventData: CreateEventDto) => void;
}

function EventDuplicateButton({ event, onDuplicate }: EventDuplicateButtonProps) {
  const handleDuplicate = () => {
    // Create duplicated event data (exclude id, createdAt, updatedAt, createdBy)
    const duplicatedData: CreateEventDto = {
      title: `Copy of ${event.title}`,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      description: event.description,
      categoryId: event.categoryId,
      assignedPerson: event.assignedPerson,
      status: event.status as EventStatus,
      priority: event.priority as EventPriority
    };

    // Call parent handler to open event form with pre-filled data
    onDuplicate(duplicatedData);
  };

  return (
    <button
      onClick={handleDuplicate}
      className="rounded-md border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center gap-2"
      aria-label="Duplicate event"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      Duplicate
    </button>
  );
}

export default EventDuplicateButton;
