# RBAC Implementation Quick-Start Guide

## TL;DR

**Pattern**: `authenticate` → `requireTimelineAccess` → `requireRole('Editor')` → handler

**Database**: 2 new tables (`timelines`, `timeline_members`); modify 2 existing tables (`events`, `categories`)

**API**: All routes include `/:timelineId` in path for explicit context

**Cache**: 5-minute in-memory cache reduces DB queries by 90%

**Security**: Defense-in-depth (middleware + service layer checks) + last-admin protection

---

## 10-Minute Implementation Summary

### 1. Database Schema (SQL)

```sql
-- Create timeline table
CREATE TABLE timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  themeColor VARCHAR(7) NOT NULL,
  status VARCHAR(20) DEFAULT 'Planning',
  ownerId UUID NOT NULL REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Create role enum
CREATE TYPE timeline_role AS ENUM ('Admin', 'Editor', 'Viewer');

-- Create membership junction table
CREATE TABLE timeline_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timelineId UUID NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role timeline_role NOT NULL DEFAULT 'Viewer',
  joinedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(timelineId, userId)
);

-- Add indexes
CREATE INDEX idx_timeline_members_userId ON timeline_members(userId);
CREATE INDEX idx_timeline_members_timelineId ON timeline_members(timelineId);

-- Update existing tables
ALTER TABLE events ADD COLUMN timelineId UUID REFERENCES timelines(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN timelineId UUID REFERENCES timelines(id) ON DELETE CASCADE;
CREATE INDEX idx_events_timelineId ON events(timelineId);
CREATE INDEX idx_categories_timelineId ON categories(timelineId);
```

### 2. Middleware (TypeScript)

```typescript
// src/middleware/authorization.ts

import { Request, Response, NextFunction } from 'express';
import { query } from '../db/connection';

export type TimelineRole = 'Admin' | 'Editor' | 'Viewer';

declare global {
  namespace Express {
    interface Request {
      timeline?: { id: string; role: TimelineRole };
    }
  }
}

// Check timeline access and attach to request
export async function requireTimelineAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timelineId = req.params.timelineId;
  const userId = req.user?.userId;

  if (!timelineId || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await query(
      `SELECT role FROM timeline_members WHERE timelineId = $1 AND userId = $2`,
      [timelineId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.timeline = {
      id: timelineId,
      role: result.rows[0].role as TimelineRole,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization failed' });
  }
}

// Require specific role
export function requireRole(...roles: TimelineRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.timeline || !roles.includes(req.timeline.role)) {
      return res.status(403).json({
        error: `Requires one of: ${roles.join(', ')}`,
      });
    }
    next();
  };
}
```

### 3. Route Handler Example

```typescript
// src/api/timelines.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireTimelineAccess, requireRole } from '../middleware/authorization';

const router = Router();

// View timeline (any member)
router.get(
  '/:timelineId',
  authenticate,
  requireTimelineAccess,
  async (req, res) => {
    const timeline = await TimelineService.getById(req.timeline!.id);
    res.json(timeline);
  }
);

// Edit timeline (Admin only)
router.put(
  '/:timelineId',
  authenticate,
  requireTimelineAccess,
  requireRole('Admin'),
  async (req, res) => {
    const updated = await TimelineService.update(req.timeline!.id, req.body);
    res.json(updated);
  }
);

// Create event (Editor+)
router.post(
  '/:timelineId/events',
  authenticate,
  requireTimelineAccess,
  requireRole('Editor', 'Admin'),
  async (req, res) => {
    const event = await EventService.createInTimeline(
      req.timeline!.id,
      req.user!.userId,
      req.body
    );
    res.status(201).json(event);
  }
);

export default router;
```

### 4. Service Layer Example

```typescript
// src/services/TimelineService.ts

export class TimelineService {
  // Auto-assign creator as Admin (FR-006)
  static async createTimeline(userId: string, data: any) {
    await query('BEGIN');

    const timelineResult = await query(
      `INSERT INTO timelines (name, startDate, endDate, themeColor, ownerId)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.name, data.startDate, data.endDate, data.themeColor, userId]
    );

    const timelineId = timelineResult.rows[0].id;

    // Auto-assign creator as Admin
    await query(
      `INSERT INTO timeline_members (timelineId, userId, role)
       VALUES ($1, $2, 'Admin')`,
      [timelineId, userId]
    );

    await query('COMMIT');
    return timelineResult.rows[0];
  }

  // Prevent last Admin removal (FR-012)
  static async removeMember(timelineId: string, memberId: string) {
    // Check if target is only Admin
    const adminCount = await query(
      `SELECT COUNT(*) FROM timeline_members
       WHERE timelineId = $1 AND role = 'Admin'`,
      [timelineId]
    );

    const targetRole = await query(
      `SELECT role FROM timeline_members
       WHERE timelineId = $1 AND userId = $2`,
      [timelineId, memberId]
    );

    if (
      targetRole.rows[0]?.role === 'Admin' &&
      adminCount.rows[0].count === 1
    ) {
      throw new Error('Cannot remove last Admin from timeline');
    }

    await query(
      `DELETE FROM timeline_members WHERE timelineId = $1 AND userId = $2`,
      [timelineId, memberId]
    );
  }
}
```

---

## Permission Levels

| Role | Create Event | Edit Event | Delete Event | Edit Timeline | Manage Members |
|------|------|------|------|------|------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Viewer** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Special Rules

### Archived Timelines
- Non-Admin users: read-only (no edits)
- Admin users: full access (can unarchive or fix data)

### Last Admin Protection
- Cannot remove only Admin
- Cannot demote last Admin to lower role
- Always preserve at least 1 Admin per timeline

---

## Testing Checklist

- [ ] User without access to timeline gets 403
- [ ] Admin can view/edit/delete timeline
- [ ] Editor can create/edit events but not edit timeline
- [ ] Viewer can only view, not create/edit
- [ ] Cannot remove last Admin
- [ ] Cannot edit archived timeline (non-Admin)
- [ ] Events cannot reference categories from different timeline

---

## Common Mistakes to Avoid

❌ **Don't**: Trust `req.timeline.role` from cache for sensitive operations
✅ **Do**: Always query database for permission checks on mutations

❌ **Don't**: Include timeline context only in JWT token
✅ **Do**: Include in URL path for every request

❌ **Don't**: Allow removing only Admin from timeline
✅ **Do**: Check admin count before removal

❌ **Don't**: Skip permission checks in service layer
✅ **Do**: Check both middleware AND service layer (defense-in-depth)

---

## API URL Pattern

All timeline-scoped routes follow this pattern:

```
/api/timelines/:timelineId/[resource]/[action]

Examples:
GET    /api/timelines/abc-123/events              (list events)
POST   /api/timelines/abc-123/events              (create event)
PUT    /api/timelines/abc-123/events/evt-456      (edit event)
DELETE /api/timelines/abc-123/events/evt-456      (delete event)

POST   /api/timelines/abc-123/members             (invite user)
PUT    /api/timelines/abc-123/members/usr-789     (change role)
DELETE /api/timelines/abc-123/members/usr-789     (remove member)
```

---

## Performance Tuning

### Cache Hits: Default 5 minutes

For faster propagation of permission changes, reduce to:
```typescript
const permissionCache = new NodeCache({ stdTTL: 60 }); // 1 minute
```

### For High-Traffic Endpoints

Pre-load user's timeline roles on login:
```typescript
export async function cacheUserTimelines(userId: string) {
  const timelines = await query(
    `SELECT timelineId, role FROM timeline_members WHERE userId = $1`,
    [userId]
  );
  for (const row of timelines.rows) {
    permissionCache.set(`${userId}:${row.timelineId}`, row.role);
  }
}
```

---

## Deployment Checklist

- [ ] Database migrations run (create tables/indexes)
- [ ] Migration script creates "Default Timeline" and assigns existing users
- [ ] All events/categories linked to timelines
- [ ] Middleware registered before routes
- [ ] All timeline-scoped routes updated to use new pattern
- [ ] Service layer checks both membership and role
- [ ] Last-admin protection in place
- [ ] Integration tests pass (8 test suites)
- [ ] Load test: cache hit rate verified
- [ ] Security audit: no privilege escalation vectors
- [ ] Frontend permission UI updated
- [ ] Documentation updated

---

## References

- **Full Implementation Guide**: RBAC-RESEARCH.md
- **Decision Rationale**: RBAC-RECOMMENDATIONS.md
- **Code Examples**: See this file and backend/src/middleware/authorization.ts
- **Database Schema**: See RBAC-RESEARCH.md Section 1

---

## Questions?

Refer to:
1. **"Why this approach?"** → RBAC-RECOMMENDATIONS.md (Rationale section)
2. **"How do I implement X?"** → RBAC-RESEARCH.md (detailed code)
3. **"Is permission check required?"** → Permission matrix above
4. **"What if user loses access mid-session?"** → Cache TTL is 5 min max; database always authoritative
