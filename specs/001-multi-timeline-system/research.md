# Research: Multi-Timeline System

**Feature**: 001-multi-timeline-system
**Date**: 2025-11-21
**Status**: Complete

## Overview

This document captures research findings for implementing the multi-timeline system. All NEEDS CLARIFICATION items from the Technical Context have been resolved.

---

## 1. Multi-Tenant Data Isolation Pattern

### Decision: Row-Level Foreign Keys with Service Layer Enforcement

**Approach**: Add `timelineId` foreign key to `categories` and `events` tables, with service-layer access control enforcing data isolation.

### Rationale
1. **Defense in depth**: Foreign keys ensure referential integrity at database level; service layer prevents unauthorized access
2. **Performance**: No join bloat from schema-per-tenant; composite indexes optimize queries
3. **Query simplicity**: Existing queries get `WHERE timelineId = $1` clause added
4. **Migration path**: Backward compatible with existing data via "Default Timeline" migration
5. **Cost efficiency**: Single database/schema scales to thousands of timelines

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Schema-per-tenant | Maintenance overhead for 1000s of schemas; connection pooling complexity |
| PostgreSQL Row-Level Security (RLS) only | Only works for reads; complicates mutations; harder to debug |
| JWT with timeline embedded | Claims become stale when access changes mid-session |

### Implementation Pattern

```sql
-- Add timelineId to existing tables
ALTER TABLE categories ADD COLUMN timelineId UUID NOT NULL
  REFERENCES timelines(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN timelineId UUID NOT NULL
  REFERENCES timelines(id) ON DELETE CASCADE;

-- Composite indexes for query performance
CREATE INDEX idx_events_timeline_date ON events(timelineId, date);
CREATE INDEX idx_events_timeline_status ON events(timelineId, status);
CREATE INDEX idx_categories_timeline ON categories(timelineId);

-- Unique constraint per timeline
DROP INDEX idx_categories_name_lower;
CREATE UNIQUE INDEX idx_categories_timeline_name
  ON categories(timelineId, LOWER(name));
```

---

## 2. Role-Based Access Control (RBAC)

### Decision: Timeline-Scoped RBAC with Junction Table and Two-Stage Middleware

**Approach**: Store user-timeline-role associations in `timeline_members` table; middleware validates access before handlers execute.

### Rationale
1. **Scalable**: Junction table handles unlimited users per timeline, unlimited timelines per user
2. **Auditable**: Single table to query for "who has access to what"
3. **Flexible**: Easy to add new roles later without schema changes
4. **Performant**: Index on `(userId, timelineId)` enables fast lookups

### Permission Matrix

| Action | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| View events | Yes | Yes | Yes |
| Create/edit events | Yes | Yes | No |
| Delete events | Yes | Yes | No |
| Manage categories | Yes | Yes | No |
| Edit timeline settings | Yes | No | No |
| Invite/remove members | Yes | No | No |
| Delete timeline | Yes | No | No |
| View when Archived | Yes | Yes | Yes |
| Edit when Archived | Yes | No | No |

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| JWT token with permissions | Claims become stale when role changes mid-session |
| ABAC (Attribute-Based Access Control) | Over-engineered for 3 static roles |
| Database row-level security | Complex to maintain; complicates development |

### Implementation Pattern

```typescript
// Middleware: backend/src/middleware/timelineAuth.ts
export const requireTimelineRole = (minRole: 'viewer' | 'editor' | 'admin') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { timelineId } = req.params;
    const userId = req.user!.id;

    const membership = await getMembership(userId, timelineId);
    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const roleHierarchy = { viewer: 1, editor: 2, admin: 3 };
    if (roleHierarchy[membership.role] < roleHierarchy[minRole]) {
      return res.status(403).json({ error: `Requires ${minRole} role` });
    }

    req.timelineMembership = membership;
    next();
  };
};

// Usage in routes
router.post('/timelines/:timelineId/events',
  authenticate,
  requireTimelineRole('editor'),
  createEventHandler
);
```

---

## 3. Date Shifting for Timeline Copy

### Decision: Absolute Day Offset with Optional Day-of-Week Preservation Warning

**Approach**: Calculate day difference between source and target start dates; apply same offset to all events.

### Rationale
1. **Preserves relationships**: Events maintain relative position within festival
2. **Handles edge cases**: Leap years, month boundaries handled automatically by date arithmetic
3. **Simple & intuitive**: Single number (day offset) easy to communicate and audit
4. **Reversible**: Can undo by applying negative offset

### Algorithm

```typescript
import { parseISO, addDays, differenceInDays } from 'date-fns';

interface TimelineShiftConfig {
  sourceStartDate: string;  // "2024-06-15" (Summer Fest 2024)
  targetStartDate: string;  // "2025-06-14" (Summer Fest 2025)
}

function calculateDayOffset(config: TimelineShiftConfig): number {
  const source = parseISO(config.sourceStartDate);
  const target = parseISO(config.targetStartDate);
  return differenceInDays(target, source); // 364 days
}

function shiftEventDate(originalDate: string, dayOffset: number): string {
  const original = parseISO(originalDate);
  const shifted = addDays(original, dayOffset);
  return format(shifted, 'yyyy-MM-dd');
}

// Example:
// sourceStart: 2024-06-15 (Saturday), targetStart: 2025-06-14 (Saturday)
// dayOffset = 364
// Event on 2024-06-15 → 2025-06-14 (Saturday → Saturday)
// Event on 2024-06-18 → 2025-06-17 (Tuesday → Tuesday)
```

### Edge Cases

| Edge Case | Solution |
|-----------|----------|
| Events outside source date range | Include with warning; let user decide |
| Leap year Feb 29 in source | `addDays()` handles → Mar 1 in non-leap target |
| Negative offset (shifting backward) | Works identically; UI shows warning |
| Time fields (time, endTime) | Preserved as-is; only date shifts |

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Proportional scaling | Destroys day-of-week relationships; complex rounding |
| Manual date picker per event | Terrible UX for 50+ events |
| Preserve day-of-week only | Loses temporal context; doesn't make sense for sequential festivals |

---

## 4. Frontend State Management for Timeline Context

### Decision: Zustand Store with localStorage Persistence

**Approach**: Use Zustand store (not React Context) for current timeline state, persisted to localStorage.

### Rationale
1. **No provider hell**: Already have AuthProvider, QueryClientProvider; Zustand doesn't add wrapper nesting
2. **Selective subscriptions**: Only components using `useCurrentTimeline()` re-render on timeline switch
3. **Built-in persistence**: Zustand middleware handles localStorage sync automatically
4. **Devtools integration**: Redux DevTools support for debugging timeline state

### React Query Cache Scoping

Query keys include `timelineId` to automatically scope cache per timeline:

```typescript
// Query key structure
['events', timelineId, startDate, endDate]
['categories', timelineId]
['timeline', timelineId]  // Single timeline details

// Timeline switch invalidation
const handleTimelineSwitch = (newTimelineId: string) => {
  setCurrentTimeline(newTimelineId);
  // Old timeline data remains cached (instant switch back)
  // New timeline data fetches if not cached
};
```

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| React Context | All descendants re-render on timeline switch; poor performance |
| Redux | Overkill for single piece of state; Zustand provides same benefits with less boilerplate |
| URL query parameter | Pollutes history; creates invalid states; doesn't survive page close |
| Session storage | Lost on browser close; localStorage better for "last active" preference |

### Implementation Pattern

```typescript
// src/stores/timelineStore.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface TimelineState {
  currentTimelineId: string | null;
  setCurrentTimeline: (id: string) => void;
  clearCurrentTimeline: () => void;
}

export const useTimelineStore = create<TimelineState>()(
  devtools(
    persist(
      (set) => ({
        currentTimelineId: null,
        setCurrentTimeline: (id) => set({ currentTimelineId: id }),
        clearCurrentTimeline: () => set({ currentTimelineId: null }),
      }),
      { name: 'timeline-storage' }
    )
  )
);

// Convenience hook
export const useCurrentTimeline = () =>
  useTimelineStore((state) => state.currentTimelineId);
```

---

## 5. Migration Strategy

### Decision: Create Default Timeline and Backfill Existing Data

**Approach**: Three-phase migration preserving all existing data with zero downtime.

### Phase 1: Schema Preparation (Non-Breaking)

```sql
-- Add nullable columns first
ALTER TABLE categories ADD COLUMN timelineId UUID;
ALTER TABLE events ADD COLUMN timelineId UUID;
```

### Phase 2: Data Migration

```typescript
// Migration script: backend/src/db/migrations/003_multi_timeline.ts
async function migrateToMultiTimeline() {
  // 1. Create Default Timeline owned by first admin
  const admin = await query("SELECT id FROM users LIMIT 1");
  const timeline = await query(`
    INSERT INTO timelines (name, description, ownerId, status)
    VALUES ('Default Timeline', 'Auto-migrated from single-timeline', $1, 'Active')
    RETURNING id
  `, [admin.rows[0].id]);

  // 2. Backfill timelineId
  await query("UPDATE categories SET timelineId = $1 WHERE timelineId IS NULL", [timeline.rows[0].id]);
  await query("UPDATE events SET timelineId = $1 WHERE timelineId IS NULL", [timeline.rows[0].id]);

  // 3. Grant all users access as Editors
  const users = await query("SELECT id FROM users");
  for (const user of users.rows) {
    const role = user.id === admin.rows[0].id ? 'admin' : 'editor';
    await query(`
      INSERT INTO timeline_members (timelineId, userId, role)
      VALUES ($1, $2, $3)
    `, [timeline.rows[0].id, user.id, role]);
  }
}
```

### Phase 3: Add Constraints

```sql
-- Make columns NOT NULL
ALTER TABLE categories ALTER COLUMN timelineId SET NOT NULL;
ALTER TABLE events ALTER COLUMN timelineId SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE categories ADD CONSTRAINT fk_categories_timeline
  FOREIGN KEY (timelineId) REFERENCES timelines(id) ON DELETE CASCADE;
ALTER TABLE events ADD CONSTRAINT fk_events_timeline
  FOREIGN KEY (timelineId) REFERENCES timelines(id) ON DELETE CASCADE;
```

---

## 6. API Design

### Decision: Timeline-Scoped REST Endpoints

**Approach**: All event and category endpoints nested under timeline path.

### New Route Structure

```
# Timeline management
POST   /api/timelines                    # Create timeline
GET    /api/timelines                    # List accessible timelines
GET    /api/timelines/:id                # Get timeline details
PUT    /api/timelines/:id                # Update timeline
DELETE /api/timelines/:id                # Delete timeline

# Timeline members
GET    /api/timelines/:id/members        # List members
POST   /api/timelines/:id/members        # Invite member
PUT    /api/timelines/:id/members/:userId  # Change role
DELETE /api/timelines/:id/members/:userId  # Remove member

# Timeline copy/template
POST   /api/timelines/:id/copy           # Copy timeline with date shift
POST   /api/timelines/:id/set-template   # Mark as template
GET    /api/templates                     # List all templates

# Events (now scoped)
GET    /api/timelines/:id/events         # List events
POST   /api/timelines/:id/events         # Create event
PUT    /api/timelines/:id/events/:eventId  # Update event
DELETE /api/timelines/:id/events/:eventId  # Delete event

# Categories (now scoped)
GET    /api/timelines/:id/categories     # List categories
POST   /api/timelines/:id/categories     # Create category
PUT    /api/timelines/:id/categories/:catId  # Update category
DELETE /api/timelines/:id/categories/:catId  # Delete category

# Dashboard
GET    /api/dashboard                    # All accessible timelines with stats
```

---

## Summary

All technical decisions resolved and ready for Phase 1 design:

| Aspect | Decision |
|--------|----------|
| Data isolation | Foreign keys + service layer enforcement |
| Access control | Timeline-scoped RBAC with junction table |
| Date shifting | Absolute day offset algorithm |
| State management | Zustand with localStorage persistence |
| Cache scoping | Timeline ID in React Query keys |
| Migration | Default Timeline + backfill strategy |
| API design | Timeline-scoped REST endpoints |
