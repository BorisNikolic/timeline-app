-- Migration: 003_multi_timeline.sql
-- Description: Add multi-timeline support
-- Date: 2025-11-21
-- Feature: 001-multi-timeline-system

BEGIN;

-- 1. Create new enums
CREATE TYPE timeline_status AS ENUM ('Planning', 'Active', 'Completed', 'Archived');
CREATE TYPE member_role AS ENUM ('Admin', 'Editor', 'Viewer');
CREATE TYPE outcome_tag AS ENUM ('Went Well', 'Needs Improvement', 'Failed');

-- 2. Create timelines table
CREATE TABLE timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  themeColor VARCHAR(20) NOT NULL DEFAULT 'blue',
  status timeline_status NOT NULL DEFAULT 'Planning',
  isTemplate BOOLEAN NOT NULL DEFAULT false,
  ownerId UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_timeline_dates CHECK (endDate >= startDate),
  CONSTRAINT chk_timeline_color CHECK (themeColor IN ('blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'teal'))
);

CREATE INDEX idx_timelines_owner ON timelines(ownerId);
CREATE INDEX idx_timelines_status ON timelines(status);
CREATE TRIGGER update_timelines_updated_at
  BEFORE UPDATE ON timelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Create timeline_members table
CREATE TABLE timeline_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timelineId UUID NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'Viewer',
  invitedBy UUID REFERENCES users(id) ON DELETE SET NULL,
  joinedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(timelineId, userId)
);

CREATE INDEX idx_timeline_members_timeline ON timeline_members(timelineId);
CREATE INDEX idx_timeline_members_user ON timeline_members(userId);

-- 4. Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  lastTimelineId UUID REFERENCES timelines(id) ON DELETE SET NULL,
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Add timelineId to categories (nullable first)
ALTER TABLE categories ADD COLUMN timelineId UUID;

-- 6. Add new columns to events (nullable first)
ALTER TABLE events ADD COLUMN timelineId UUID;
ALTER TABLE events ADD COLUMN retroNotes TEXT;
ALTER TABLE events ADD COLUMN outcomeTag outcome_tag;
ALTER TABLE events ADD COLUMN sourceEventId UUID REFERENCES events(id) ON DELETE SET NULL;

-- 7. Create default timeline for existing data
DO $$
DECLARE
  admin_id UUID;
  default_timeline_id UUID;
  min_date DATE;
  max_date DATE;
BEGIN
  -- Get first user as owner
  SELECT id INTO admin_id FROM users ORDER BY createdAt LIMIT 1;

  IF admin_id IS NOT NULL THEN
    -- Calculate date range from existing events
    SELECT MIN(date), MAX(date) INTO min_date, max_date FROM events;

    -- Default to current month if no events
    IF min_date IS NULL THEN
      min_date := CURRENT_DATE;
      max_date := CURRENT_DATE + INTERVAL '30 days';
    END IF;

    -- Create default timeline
    INSERT INTO timelines (name, description, startDate, endDate, status, ownerId)
    VALUES (
      'Default Timeline',
      'Auto-migrated from single-timeline system',
      min_date,
      max_date,
      'Active',
      admin_id
    )
    RETURNING id INTO default_timeline_id;

    -- Backfill categories
    UPDATE categories SET timelineId = default_timeline_id WHERE timelineId IS NULL;

    -- Backfill events
    UPDATE events SET timelineId = default_timeline_id WHERE timelineId IS NULL;

    -- Add all existing users as members
    INSERT INTO timeline_members (timelineId, userId, role, invitedBy)
    SELECT
      default_timeline_id,
      u.id,
      CASE WHEN u.id = admin_id THEN 'Admin'::member_role ELSE 'Editor'::member_role END,
      admin_id
    FROM users u;

    RAISE NOTICE 'Migration complete. Default timeline ID: %', default_timeline_id;
  ELSE
    RAISE NOTICE 'No users found. Skipping default timeline creation.';
  END IF;
END $$;

-- 8. Add NOT NULL constraints
ALTER TABLE categories ALTER COLUMN timelineId SET NOT NULL;
ALTER TABLE events ALTER COLUMN timelineId SET NOT NULL;

-- 9. Add foreign key constraints
ALTER TABLE categories ADD CONSTRAINT fk_categories_timeline
  FOREIGN KEY (timelineId) REFERENCES timelines(id) ON DELETE CASCADE;
ALTER TABLE events ADD CONSTRAINT fk_events_timeline
  FOREIGN KEY (timelineId) REFERENCES timelines(id) ON DELETE CASCADE;

-- 10. Update category uniqueness constraint
DROP INDEX IF EXISTS idx_categories_name_lower;
CREATE UNIQUE INDEX idx_categories_timeline_name ON categories(timelineId, LOWER(name));
CREATE INDEX idx_categories_timeline ON categories(timelineId);

-- 11. Add new event indexes
CREATE INDEX idx_events_timeline_date ON events(timelineId, date);
CREATE INDEX idx_events_timeline_status ON events(timelineId, status);
CREATE INDEX idx_events_timeline_category ON events(timelineId, categoryId);
CREATE INDEX idx_events_source ON events(sourceEventId) WHERE sourceEventId IS NOT NULL;
CREATE INDEX idx_events_outcome ON events(outcomeTag) WHERE outcomeTag IS NOT NULL;

COMMIT;
