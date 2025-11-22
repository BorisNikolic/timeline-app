# Quickstart: Multi-Timeline System Implementation

**Feature**: 001-multi-timeline-system
**Date**: 2025-11-21

This guide provides step-by-step instructions to implement the multi-timeline system feature.

---

## Prerequisites

- Node.js 20+ or Bun 1.3+
- PostgreSQL 16 running
- Existing Festival Timeline App codebase
- Access to both backend and frontend directories

---

## Phase 1: Database Migration

### Step 1.1: Create Migration File

Create `backend/src/db/migrations/003_multi_timeline.sql` with the schema from [data-model.md](./data-model.md#migration-sql).

### Step 1.2: Run Migration

```bash
cd backend
bun run db:migrate
```

### Step 1.3: Verify Migration

```bash
psql -d festival_timeline -c "\d timelines"
psql -d festival_timeline -c "\d timeline_members"
psql -d festival_timeline -c "SELECT * FROM timelines;"
```

Expected: Default Timeline created with all existing events/categories migrated.

---

## Phase 2: Backend Implementation

### Step 2.1: Add TypeScript Types

Create `backend/src/types/timeline.ts`:

```typescript
export type TimelineStatus = 'Planning' | 'Active' | 'Completed' | 'Archived';
export type MemberRole = 'Admin' | 'Editor' | 'Viewer';
export type OutcomeTag = 'Went Well' | 'Needs Improvement' | 'Failed';

export interface Timeline {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  themeColor: string;
  status: TimelineStatus;
  isTemplate: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineMember {
  id: string;
  timelineId: string;
  userId: string;
  role: MemberRole;
  invitedBy: string | null;
  joinedAt: string;
}
```

### Step 2.2: Create Timeline Service

Create `backend/src/services/TimelineService.ts`:

```typescript
import { query } from '../db/connection';
import { Timeline, TimelineStatus, MemberRole } from '../types/timeline';

export class TimelineService {
  static async create(userId: string, data: CreateTimelineDto): Promise<Timeline> {
    const result = await query(
      `INSERT INTO timelines (name, description, startDate, endDate, themeColor, ownerId)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.description, data.startDate, data.endDate, data.themeColor || 'blue', userId]
    );

    const timeline = result.rows[0];

    // Add creator as Admin
    await query(
      `INSERT INTO timeline_members (timelineId, userId, role)
       VALUES ($1, $2, 'Admin')`,
      [timeline.id, userId]
    );

    return this.mapRow(timeline);
  }

  static async getAccessible(userId: string): Promise<Timeline[]> {
    const result = await query(
      `SELECT t.*, tm.role as userRole
       FROM timelines t
       JOIN timeline_members tm ON t.id = tm.timelineId
       WHERE tm.userId = $1
       ORDER BY t.updatedAt DESC`,
      [userId]
    );
    return result.rows.map(this.mapRow);
  }

  static async verifyAccess(
    userId: string,
    timelineId: string,
    minRole: MemberRole = 'Viewer'
  ): Promise<{ role: MemberRole; timeline: Timeline }> {
    const result = await query(
      `SELECT t.*, tm.role
       FROM timelines t
       JOIN timeline_members tm ON t.id = tm.timelineId
       WHERE t.id = $1 AND tm.userId = $2`,
      [timelineId, userId]
    );

    if (result.rows.length === 0) {
      throw new ForbiddenError('Access denied to this timeline');
    }

    const row = result.rows[0];
    const roleHierarchy = { Viewer: 1, Editor: 2, Admin: 3 };

    if (roleHierarchy[row.role] < roleHierarchy[minRole]) {
      throw new ForbiddenError(`Requires ${minRole} role`);
    }

    return { role: row.role, timeline: this.mapRow(row) };
  }

  private static mapRow(row: any): Timeline {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      startDate: row.startdate,
      endDate: row.enddate,
      themeColor: row.themecolor,
      status: row.status,
      isTemplate: row.istemplate,
      ownerId: row.ownerid,
      createdAt: row.createdat,
      updatedAt: row.updatedat,
    };
  }
}
```

### Step 2.3: Create Timeline Authorization Middleware

Create `backend/src/middleware/timelineAuth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { TimelineService } from '../services/TimelineService';
import { MemberRole } from '../types/timeline';

export const requireTimelineRole = (minRole: MemberRole = 'Viewer') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timelineId } = req.params;
      const userId = req.user!.id;

      const { role, timeline } = await TimelineService.verifyAccess(
        userId,
        timelineId,
        minRole
      );

      // Check if timeline is archived and user is not Admin
      if (timeline.status === 'Archived' && role !== 'Admin') {
        if (req.method !== 'GET') {
          return res.status(403).json({
            error: 'Timeline is archived and read-only'
          });
        }
      }

      // Attach to request for handlers
      req.timeline = timeline;
      req.timelineRole = role;

      next();
    } catch (error) {
      if (error.name === 'ForbiddenError') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  };
};
```

### Step 2.4: Create Timeline Routes

Create `backend/src/api/timelines.ts`:

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireTimelineRole } from '../middleware/timelineAuth';
import { TimelineService } from '../services/TimelineService';
import { validateBody } from '../middleware/validation';
import { createTimelineSchema, updateTimelineSchema } from '../schemas/timeline';

const router = Router();

// List accessible timelines
router.get('/', authenticate, async (req, res, next) => {
  try {
    const timelines = await TimelineService.getAccessible(req.user!.id);
    res.json(timelines);
  } catch (error) {
    next(error);
  }
});

// Create timeline
router.post('/', authenticate, validateBody(createTimelineSchema), async (req, res, next) => {
  try {
    const timeline = await TimelineService.create(req.user!.id, req.body);
    res.status(201).json(timeline);
  } catch (error) {
    next(error);
  }
});

// Get timeline details
router.get('/:timelineId', authenticate, requireTimelineRole('Viewer'), async (req, res) => {
  res.json(req.timeline);
});

// Update timeline
router.put('/:timelineId',
  authenticate,
  requireTimelineRole('Admin'),
  validateBody(updateTimelineSchema),
  async (req, res, next) => {
    try {
      const timeline = await TimelineService.update(req.params.timelineId, req.body);
      res.json(timeline);
    } catch (error) {
      next(error);
    }
  }
);

// Delete timeline
router.delete('/:timelineId', authenticate, requireTimelineRole('Admin'), async (req, res, next) => {
  try {
    await TimelineService.delete(req.params.timelineId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Step 2.5: Update Existing Event Routes

Modify `backend/src/api/events.ts` to use timeline scoping:

```typescript
// Change from:
router.get('/', authenticate, ...)

// To:
router.get('/timelines/:timelineId/events',
  authenticate,
  requireTimelineRole('Viewer'),
  async (req, res, next) => {
    try {
      const events = await EventService.getByTimeline(
        req.params.timelineId,
        req.query
      );
      res.json(events);
    } catch (error) {
      next(error);
    }
  }
);
```

### Step 2.6: Register Routes

Update `backend/src/server.ts`:

```typescript
import timelineRoutes from './api/timelines';
import memberRoutes from './api/members';

app.use('/api/timelines', timelineRoutes);
app.use('/api/timelines', memberRoutes); // /api/timelines/:id/members
```

---

## Phase 3: Frontend Implementation

### Step 3.1: Create Timeline Store

Create `frontend/src/stores/timelineStore.ts`:

```typescript
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
    ),
    { name: 'TimelineStore' }
  )
);

export const useCurrentTimeline = () =>
  useTimelineStore((state) => state.currentTimelineId);
```

### Step 3.2: Create Timeline Hooks

Create `frontend/src/hooks/useTimelines.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelinesApi } from '../services/api-client';
import { useCurrentTimeline } from '../stores/timelineStore';

export function useTimelines() {
  return useQuery({
    queryKey: ['timelines'],
    queryFn: () => timelinesApi.getAll(),
  });
}

export function useTimeline(timelineId?: string) {
  const currentId = useCurrentTimeline();
  const id = timelineId || currentId;

  return useQuery({
    queryKey: ['timeline', id],
    queryFn: () => timelinesApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateTimeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timelinesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timelines'] });
    },
  });
}
```

### Step 3.3: Update Events Hook

Modify `frontend/src/hooks/useEvents.ts`:

```typescript
import { useCurrentTimeline } from '../stores/timelineStore';

export function useEvents(startDate?: string, endDate?: string) {
  const timelineId = useCurrentTimeline();

  return useQuery({
    queryKey: ['events', timelineId, startDate, endDate],
    queryFn: () => eventsApi.getAll(timelineId!, { startDate, endDate }),
    enabled: !!timelineId,
  });
}
```

### Step 3.4: Create Timeline Switcher Component

Create `frontend/src/components/shared/TimelineSwitcher.tsx`:

```typescript
import { useState } from 'react';
import { useTimelines } from '../../hooks/useTimelines';
import { useTimelineStore } from '../../stores/timelineStore';

export function TimelineSwitcher() {
  const { data: timelines, isLoading } = useTimelines();
  const { currentTimelineId, setCurrentTimeline } = useTimelineStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentTimeline = timelines?.find(t => t.id === currentTimelineId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
      >
        {currentTimeline && (
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getColorValue(currentTimeline.themeColor) }}
          />
        )}
        <span>{currentTimeline?.name || 'Select Timeline'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-64 bg-white rounded-md shadow-lg border z-50">
          {timelines?.map(timeline => (
            <button
              key={timeline.id}
              onClick={() => {
                setCurrentTimeline(timeline.id);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColorValue(timeline.themeColor) }}
              />
              <span>{timeline.name}</span>
              <span className="ml-auto text-xs text-gray-500">{timeline.status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 3.5: Update Layout

Add TimelineSwitcher to `frontend/src/components/shared/Layout.tsx`:

```typescript
import { TimelineSwitcher } from './TimelineSwitcher';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Festival Timeline</h1>
          <div className="flex items-center gap-4">
            <TimelineSwitcher />
            {/* existing user menu */}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### Step 3.6: Create Dashboard Page

Create `frontend/src/pages/DashboardPage.tsx`:

```typescript
import { useTimelines } from '../hooks/useTimelines';
import { TimelineCard } from '../components/dashboard/TimelineCard';

export function DashboardPage() {
  const { data: timelines, isLoading } = useTimelines();

  const grouped = {
    active: timelines?.filter(t => t.status === 'Active') || [],
    planning: timelines?.filter(t => t.status === 'Planning') || [],
    completed: timelines?.filter(t => t.status === 'Completed') || [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Timelines</h1>

      {['active', 'planning', 'completed'].map(status => (
        <section key={status} className="mb-8">
          <h2 className="text-lg font-semibold mb-4 capitalize">{status}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[status].map(timeline => (
              <TimelineCard key={timeline.id} timeline={timeline} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

### Step 3.7: Update Routing

Update `frontend/src/App.tsx`:

```typescript
import { DashboardPage } from './pages/DashboardPage';
import { TimelineSettingsPage } from './pages/TimelineSettingsPage';

// Add routes:
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/timeline/:timelineId/settings" element={<TimelineSettingsPage />} />
```

---

## Phase 4: Testing

### Step 4.1: Backend API Tests

```bash
cd backend
bun run test -- --grep "timeline"
```

### Step 4.2: Frontend Component Tests

```bash
cd frontend
bun run test
```

### Step 4.3: E2E Tests

```bash
cd frontend
bun run test:e2e
```

### Step 4.4: Manual Testing Checklist

- [ ] Create new timeline with name, dates, color
- [ ] Switch between timelines using header dropdown
- [ ] Events and categories scoped to current timeline
- [ ] Invite user with Editor role
- [ ] Verify Editor cannot change timeline settings
- [ ] Verify Viewer cannot create events
- [ ] Copy timeline with date shifting
- [ ] Archive timeline, verify read-only for non-Admins

---

## Deployment Checklist

- [ ] Database backup before migration
- [ ] Run migration on staging first
- [ ] Verify default timeline created with all data
- [ ] Deploy backend with new routes
- [ ] Deploy frontend with timeline switcher
- [ ] Smoke test all user stories
- [ ] Monitor error rates post-deployment

---

## Troubleshooting

### "Access denied to this timeline"

User is not a member of the timeline. Check `timeline_members` table:

```sql
SELECT * FROM timeline_members WHERE userId = 'user-id';
```

### Events not showing after timeline switch

React Query cache may have stale data. Clear with:

```typescript
queryClient.invalidateQueries({ queryKey: ['events'] });
```

### Migration fails with "column already exists"

Migration was partially run. Check which columns exist and adjust migration script.

---

## Related Documents

- [spec.md](./spec.md) - Full feature specification
- [research.md](./research.md) - Technical research findings
- [data-model.md](./data-model.md) - Database schema and entity definitions
- [contracts/](./contracts/) - API specifications (OpenAPI)
