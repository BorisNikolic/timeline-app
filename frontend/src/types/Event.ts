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
  date: string;
  description?: string;
  categoryId: string;
  assignedPerson?: string;
  status: EventStatus;
  priority: EventPriority;
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
  description?: string;
  categoryId: string;
  assignedPerson?: string;
  status?: EventStatus;
  priority?: EventPriority;
}

export interface UpdateEventDto {
  title?: string;
  date?: string;
  description?: string;
  categoryId?: string;
  assignedPerson?: string;
  status?: EventStatus;
  priority?: EventPriority;
}
