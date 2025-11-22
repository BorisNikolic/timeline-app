# Data Model: Multi-Timeline System

**Feature**: 001-multi-timeline-system
**Date**: 2025-11-21
**Status**: Complete

## Entity Overview

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   users     │───────│ timeline_members │───────│  timelines  │
└─────────────┘       └──────────────────┘       └─────────────┘
                                                       │
                              ┌────────────────────────┼────────────────────────┐
                              │                        │                        │
                        ┌─────┴─────┐            ┌─────┴─────┐            ┌─────┴─────┐
                        │ categories │            │  events   │            │user_prefs │
                        └───────────┘            └───────────┘            └───────────┘
```

---

## New Entities

### 1. Timeline

**Description**: Root container representing a festival or project with its own events, categories, and team members.

**Table**: `timelines`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Timeline display name |
| description | TEXT | NULLABLE | Optional description |
| startDate | DATE | NOT NULL | Festival/project start date |
| endDate | DATE | NOT NULL | Festival/project end date |
| themeColor | VARCHAR(20) | NOT NULL, DEFAULT 'blue' | Color from predefined palette |
| status | timeline_status | NOT NULL, DEFAULT 'Planning' | Lifecycle state |
| isTemplate | BOOLEAN | NOT NULL, DEFAULT false | Whether available as template |
| ownerId | UUID | FK → users(id), NOT NULL | Original creator |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification |

**Enum: timeline_status**
```sql
CREATE TYPE timeline_status AS ENUM ('Planning', 'Active', 'Completed', 'Archived');
```

**Indexes**:
- `idx_timelines_owner` on `(ownerId)`
- `idx_timelines_status` on `(status)`

**Constraints**:
- `chk_timeline_dates`: `endDate >= startDate`
- `chk_timeline_color`: `themeColor IN ('blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'teal')`

**Validation Rules**:
- Name: 1-255 characters, required
- Start/End dates: Valid dates, end >= start
- Theme color: One of 8 predefined colors

---

### 2. Timeline Member

**Description**: Junction table representing user access to a timeline with role assignment.

**Table**: `timeline_members`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| timelineId | UUID | FK → timelines(id), ON DELETE CASCADE | Parent timeline |
| userId | UUID | FK → users(id), ON DELETE CASCADE | Member user |
| role | member_role | NOT NULL, DEFAULT 'Viewer' | Permission level |
| invitedBy | UUID | FK → users(id), NULLABLE | Who sent invitation |
| joinedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | When user joined |

**Enum: member_role**
```sql
CREATE TYPE member_role AS ENUM ('Admin', 'Editor', 'Viewer');
```

**Indexes**:
- `idx_timeline_members_timeline` on `(timelineId)`
- `idx_timeline_members_user` on `(userId)`
- UNIQUE on `(timelineId, userId)` - user can only have one role per timeline

**Business Rules**:
- Timeline must always have at least one Admin
- Owner (creator) is automatically Admin and cannot be removed
- Role changes take effect immediately

---

### 3. User Preference

**Description**: Per-user settings including last active timeline for auto-loading.

**Table**: `user_preferences`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| userId | UUID | FK → users(id), ON DELETE CASCADE, UNIQUE | One pref per user |
| lastTimelineId | UUID | FK → timelines(id), ON DELETE SET NULL | Last viewed timeline |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update |

**Behavior**:
- `lastTimelineId` set to NULL when:
  - Timeline is deleted
  - User loses access to timeline
  - Timeline is archived

---

## Modified Entities

### 4. Category (Modified)

**Description**: Event grouping, now scoped to a specific timeline.

**Table**: `categories`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Existing |
| **timelineId** | UUID | FK → timelines(id), ON DELETE CASCADE, **NEW** | Parent timeline |
| name | VARCHAR(100) | NOT NULL | Category name |
| color | VARCHAR(7) | NOT NULL | Hex color code |
| createdBy | UUID | FK → users(id) | Creator (kept for audit) |
| createdAt | TIMESTAMP | NOT NULL | Existing |

**Index Changes**:
- DROP: `idx_categories_name_lower` (global uniqueness)
- ADD: `idx_categories_timeline_name` UNIQUE on `(timelineId, LOWER(name))`
- ADD: `idx_categories_timeline` on `(timelineId)`

**Validation**:
- Name unique within same timeline (case-insensitive)
- Category cannot be moved between timelines

---

### 5. Event (Modified)

**Description**: Festival task/event, now scoped to a specific timeline with retrospective fields.

**Table**: `events`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Existing |
| **timelineId** | UUID | FK → timelines(id), ON DELETE CASCADE, **NEW** | Parent timeline |
| title | VARCHAR(255) | NOT NULL | Existing |
| date | DATE | NOT NULL | Existing |
| time | TIME | NULLABLE | Existing |
| endTime | TIME | NULLABLE | Existing |
| description | TEXT | NULLABLE | Existing |
| categoryId | UUID | FK → categories(id) | Existing |
| assignedPerson | VARCHAR(255) | NULLABLE | Existing |
| status | event_status | NOT NULL | Existing |
| priority | event_priority | NOT NULL | Existing |
| **retroNotes** | TEXT | NULLABLE, **NEW** | Retrospective notes (Completed+ only) |
| **outcomeTag** | outcome_tag | NULLABLE, **NEW** | Retrospective tag |
| **sourceEventId** | UUID | FK → events(id), NULLABLE, **NEW** | Original event if copied |
| createdBy | UUID | FK → users(id) | Existing |
| createdAt | TIMESTAMP | NOT NULL | Existing |
| updatedAt | TIMESTAMP | NOT NULL | Existing |

**Enum: outcome_tag** (NEW)
```sql
CREATE TYPE outcome_tag AS ENUM ('Went Well', 'Needs Improvement', 'Failed');
```

**Index Changes**:
- ADD: `idx_events_timeline_date` on `(timelineId, date)`
- ADD: `idx_events_timeline_status` on `(timelineId, status)`
- ADD: `idx_events_timeline_category` on `(timelineId, categoryId)`
- ADD: `idx_events_source` on `(sourceEventId)` WHERE sourceEventId IS NOT NULL

**Validation**:
- `retroNotes` and `outcomeTag` only editable when timeline status is 'Completed' or 'Archived'
- `categoryId` must reference a category in the same timeline

---

## Entity Relationships

### Relationship Diagram

```
users (1) ─────────< (M) timeline_members (M) >───────── (1) timelines
  │                                                            │
  │ (1)                                                        │ (1)
  │                                                            │
  └──< (0..1) user_preferences                                 ├──< (M) categories
                                                               │
                                                               └──< (M) events
                                                                      │
                                                                      └──○ (0..1) sourceEventId (self-ref)
```

### Cardinality Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Timeline Members | 1:M | User can be member of many timelines |
| Timeline → Timeline Members | 1:M | Timeline can have many members |
| User → User Preferences | 1:1 | One preference record per user |
| Timeline → Categories | 1:M | Timeline has many categories |
| Timeline → Events | 1:M | Timeline has many events |
| Category → Events | 1:M | Category contains many events |
| Event → Event (source) | M:1 | Many copied events can reference one source |

---

## State Transitions

### Timeline Status Flow

```
  ┌─────────────┐
  │  Planning   │ ←─── CREATE
  └─────────────┘
        │
        ▼
  ┌─────────────┐
  │   Active    │
  └─────────────┘
        │
        ▼
  ┌─────────────┐
  │  Completed  │ ←─── Retrospective features enabled
  └─────────────┘
        │ ▲
        ▼ │ (Unarchive - Admin only)
  ┌─────────────┐
  │  Archived   │ ←─── Read-only for non-Admins
  └─────────────┘

Notes:
- Can skip forward (e.g., Planning → Archived for cancellation)
- Cannot go backward except Archived → Completed via Unarchive
```

### Member Role Permissions

```
                    ┌─────────────────────────────────────┐
                    │              Admin                   │
                    │  • Full timeline control             │
                    │  • Invite/remove members             │
                    │  • Edit when archived                │
                    └──────────────┬──────────────────────┘
                                   │ inherits
                    ┌──────────────▼──────────────────────┐
                    │              Editor                  │
                    │  • Create/edit/delete events         │
                    │  • Manage categories                 │
                    │  • Export data                       │
                    └──────────────┬──────────────────────┘
                                   │ inherits
                    ┌──────────────▼──────────────────────┐
                    │              Viewer                  │
                    │  • View events and categories        │
                    │  • Export data (read-only)           │
                    └─────────────────────────────────────┘
```

---

## Migration SQL

### Full Migration Script

```sql
-- Migration: 003_multi_timeline.sql
-- Description: Add multi-timeline support

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
```

---

## TypeScript Interfaces

```typescript
// Enums
type TimelineStatus = 'Planning' | 'Active' | 'Completed' | 'Archived';
type MemberRole = 'Admin' | 'Editor' | 'Viewer';
type OutcomeTag = 'Went Well' | 'Needs Improvement' | 'Failed';

// Timeline
interface Timeline {
  id: string;
  name: string;
  description: string | null;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  themeColor: string;
  status: TimelineStatus;
  isTemplate: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface TimelineWithStats extends Timeline {
  memberCount: number;
  eventCount: number;
  completedEventCount: number;
  completionPercentage: number;
}

// Timeline Member
interface TimelineMember {
  id: string;
  timelineId: string;
  userId: string;
  role: MemberRole;
  invitedBy: string | null;
  joinedAt: string;
}

interface TimelineMemberWithUser extends TimelineMember {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// User Preference
interface UserPreference {
  id: string;
  userId: string;
  lastTimelineId: string | null;
  updatedAt: string;
}

// Event (updated)
interface Event {
  id: string;
  timelineId: string;       // NEW
  title: string;
  date: string;
  time: string | null;
  endTime: string | null;
  description: string | null;
  categoryId: string;
  assignedPerson: string | null;
  status: EventStatus;
  priority: EventPriority;
  retroNotes: string | null;    // NEW
  outcomeTag: OutcomeTag | null; // NEW
  sourceEventId: string | null;  // NEW
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Category (updated)
interface Category {
  id: string;
  timelineId: string;  // NEW
  name: string;
  color: string;
  createdBy: string;
  createdAt: string;
}
```
