-- Add endTime column to events table
-- Migration: 002_add_event_endtime.sql
-- Created: 2025-10-18

-- Add endTime column (optional)
ALTER TABLE events ADD COLUMN endTime TIME;

-- Add index for queries involving endTime
CREATE INDEX idx_events_endTime ON events(endTime);

-- Add constraint to ensure endTime is after time if both are provided
-- Note: This is a row-level check, time comparisons work as expected
ALTER TABLE events ADD CONSTRAINT chk_endTime_after_time
  CHECK (endTime IS NULL OR time IS NULL OR endTime > time);
