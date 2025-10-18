-- Migration 002: Add time column to events table
-- Adds optional time field for events to support time-specific scheduling

-- Add time column (nullable since existing events won't have times)
ALTER TABLE events
ADD COLUMN time TIME;

-- Create index on time for efficient time-based queries
CREATE INDEX idx_events_time ON events(time);

-- Update comment
COMMENT ON COLUMN events.time IS 'Optional time for the event (HH:MM format)';
