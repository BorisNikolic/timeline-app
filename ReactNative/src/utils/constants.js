/**
 * App constants
 */

// Production API (Render deployment)
export const API_URL = 'https://festival-timeline-api.onrender.com';

// Pyramid Festival 2026 timeline ID
export const TIMELINE_ID = '297aea13-2d77-41fb-8673-f90b650e60fd';

// Default reminder time (in minutes before event)
export const DEFAULT_REMINDER_MINUTES = 15;

// Reminder presets for quick selection
export const REMINDER_PRESETS = [
  { label: '15 min before', minutes: 15 },
  { label: '30 min before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '2 hours before', minutes: 120 },
];
