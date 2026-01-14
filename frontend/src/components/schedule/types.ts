/**
 * Types for the Festival Schedule Gantt view
 */

import { EventWithDetails } from '../../types/Event';

export interface ScheduleConfig {
  pixelsPerHour: number;
  dayStartHour: number;
  dayEndHour: number;
  swimlaneHeight: number;
  eventBarHeight: number;
}

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  pixelsPerHour: 100,
  dayStartHour: 0,
  dayEndHour: 32, // Extended to 8 AM next day for overnight events
  swimlaneHeight: 64,
  eventBarHeight: 48,
};

export interface ScheduleEvent extends EventWithDetails {
  // Computed positioning values
  leftPx?: number;
  widthPx?: number;
}

export interface StageSwimlaneProps {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  events: ScheduleEvent[];
  config: ScheduleConfig;
  onEventClick: (event: ScheduleEvent) => void;
}

export interface TimeGridProps {
  config: ScheduleConfig;
  currentHour?: number;
}

export interface EventBarProps {
  event: ScheduleEvent;
  config: ScheduleConfig;
  onClick: () => void;
}

export interface DayPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableDates?: Date[];
}

export interface NowIndicatorProps {
  config: ScheduleConfig;
}
