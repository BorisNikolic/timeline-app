/**
 * App constants
 */

// Production API (Render deployment)
export const API_URL = 'https://festival-timeline-api.onrender.com';

// Pyramid Festival 2026 timeline ID
export const TIMELINE_ID = '297aea13-2d77-41fb-8673-f90b650e60fd';

// Authoritative gates-open moment (local time) — the day before the programme
// begins. Single source of truth for the Home countdown and the Info card.
export const GATES_OPEN = '2026-08-02T14:00:00';

// Default reminder time (in minutes before event)
export const DEFAULT_REMINDER_MINUTES = 15;

// Reminder presets for quick selection
export const REMINDER_PRESETS = [
  { label: '15 min before', minutes: 15 },
  { label: '30 min before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '2 hours before', minutes: 120 },
];
