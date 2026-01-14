-- Allow overnight events (endTime < startTime means next day)
-- Migration: 005_allow_overnight_events.sql
-- Created: 2026-01-14

-- Drop the constraint that required endTime > time
-- Overnight events (e.g., 23:00-02:00) have endTime < time
ALTER TABLE events DROP CONSTRAINT IF EXISTS chk_endtime_after_time;

-- Note: The application layer handles overnight events by treating
-- endTime < time as crossing midnight to the next day
