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

export interface Event {
  id: string;
  title: string;
  date: Date;
  description?: string;
  categoryId: string;
  assignedPerson?: string;
  status: EventStatus;
  priority: EventPriority;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating events
export interface CreateEventDto {
  title: string;
  date: Date | string;
  description?: string;
  categoryId: string;
  assignedPerson?: string;
  status?: EventStatus;
  priority?: EventPriority;
}

// DTO for updating events
export interface UpdateEventDto {
  title?: string;
  date?: Date | string;
  description?: string;
  categoryId?: string;
  assignedPerson?: string;
  status?: EventStatus;
  priority?: EventPriority;
}

// Event with category and creator details
export interface EventWithDetails extends Event {
  categoryName: string;
  categoryColor: string;
  createdByName: string;
}
