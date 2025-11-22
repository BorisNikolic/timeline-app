/**
 * Event entity types
 */

export enum EventStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export enum EventPriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

// Outcome tag for retrospective features (US8)
export enum OutcomeTag {
  WentWell = 'Went Well',
  NeedsImprovement = 'Needs Improvement',
  Failed = 'Failed',
}

// Outcome tag display configuration
export const OUTCOME_TAG_CONFIG: Record<OutcomeTag, { label: string; color: string; bgColor: string }> = {
  [OutcomeTag.WentWell]: { label: 'Went Well', color: 'text-green-700', bgColor: 'bg-green-100' },
  [OutcomeTag.NeedsImprovement]: { label: 'Needs Improvement', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  [OutcomeTag.Failed]: { label: 'Failed', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string; // Optional time in HH:MM format (24-hour)
  endTime?: string; // Optional end time in HH:MM format (24-hour)
  description?: string;
  categoryId: string;
  timelineId?: string; // Multi-timeline support
  assignedPerson?: string;
  status: EventStatus;
  priority: EventPriority;
  // Retrospective fields (US8) - only editable on Completed/Archived timelines
  retroNotes?: string;
  outcomeTag?: OutcomeTag;
  sourceEventId?: string; // Reference to original event if copied
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventWithDetails extends Event {
  categoryName: string;
  categoryColor: string;
  createdByName: string;
}

export interface CreateEventDto {
  title: string;
  date: string;
  time?: string; // Optional time in HH:MM format (24-hour)
  endTime?: string; // Optional end time in HH:MM format (24-hour)
  description?: string;
  categoryId: string;
  assignedPerson?: string;
  status?: EventStatus;
  priority?: EventPriority;
}

export interface UpdateEventDto {
  title?: string;
  date?: string;
  time?: string; // Optional time in HH:MM format (24-hour)
  endTime?: string; // Optional end time in HH:MM format (24-hour)
  description?: string;
  categoryId?: string;
  assignedPerson?: string;
  status?: EventStatus;
  priority?: EventPriority;
  // Retrospective fields (US8) - only editable on Completed/Archived timelines
  retroNotes?: string;
  outcomeTag?: OutcomeTag | null; // null to clear
}
