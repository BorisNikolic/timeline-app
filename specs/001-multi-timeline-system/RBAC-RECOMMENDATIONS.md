# RBAC Implementation Recommendations - Executive Summary

## Decision

Implement **timeline-scoped RBAC** with a **junction table pattern** (`timeline_members`) using two-stage authorization middleware:

1. **`requireTimelineAccess`** - Verifies user membership and attaches timeline context
2. **`requireRole`** - Enforces role-based permission constraints

Timeline context extracted from URL parameters with permission caching (5-min TTL).

---

## Rationale

| Aspect | Why This Approach |
|--------|-------------------|
| **Database Model** | Junction table with UNIQUE(timelineId, userId) matches GitHub/Linear patterns; simple to reason about; supports future sharding |
| **Middleware Pattern** | Mirrors current service-layer architecture; composable; testable; explicit permission checks at API boundary |
| **Timeline Context** | URL params (`/api/timelines/:id/events`) clearly indicate which resource is accessed; discoverable; audit-friendly |
| **Permission Caching** | 90%+ reduction in database queries; 5-min TTL balances freshness vs performance |
| **Defense-in-Depth** | API middleware + service layer checks prevent privilege escalation; if one layer fails, other still protects |

---

## Alternatives Considered & Rejected

| Alternative | Problem | Verdict |
|-------------|---------|---------|
| **JWT token permissions** | Token claims become stale when access changes; multi-timeline users require frequent refresh; complex state management | ❌ Rejected |
| **Request header for timeline** | Less discoverable; harder to API document; doesn't work for batch operations; hidden context | ❌ Rejected |
| **Attribute-Based Access Control (ABAC)** | Overkill for 3 static roles; requires rules engine; maintenance burden; no added value | ❌ Rejected |
| **Database Row-Level Security (RLS)** | Good for reads only; complicates updates and batch operations; less explicit for auditing | ⚠️ Partial (use for reads only) |
| **Permission inheritance trees** | Adds complexity; 3-level hierarchy sufficient; hard to maintain; unnecessary for current scope | ❌ Rejected |
| **Request body for timeline** | Works but inconsistent with REST principles; fails for GET requests; not discoverable in logs | ⚠️ Fallback only |

---

## Schema Overview

### Core Tables

```sql
timelines (new)
  ├─ id UUID PRIMARY KEY
  ├─ name, description, startDate, endDate
  ├─ themeColor, status, isTemplate
  └─ ownerId (foreign key to users)

timeline_members (new - junction table)
  ├─ id UUID PRIMARY KEY
  ├─ timelineId, userId (UNIQUE constraint)
  ├─ role ENUM ('Admin', 'Editor', 'Viewer')
  └─ joinedAt, invitedBy

-- Modified existing tables
events (modified)
  └─ + timelineId (foreign key)

categories (modified)
  └─ + timelineId (foreign key)
```

### Permission Matrix

| Action | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| View events | ✅ | ✅ | ✅ |
| Create event | ✅ | ✅ | ❌ |
| Edit event | ✅ | ✅ | ❌ |
| Delete event | ✅ | ✅ | ❌ |
| Edit timeline settings | ✅ | ❌ | ❌ |
| Manage members | ✅ | ❌ | ❌ |
| Archive timeline | ✅ | ❌ | ❌ |
| Delete timeline | ✅ | ❌ | ❌ |
| Export data | ✅ | ✅ | ✅ |

---

## Implementation Pattern

### API Routes (with explicit timeline context)

```typescript
// All routes include timelineId in URL path
POST   /api/timelines                          // Create timeline (auto-assigns creator as Admin)
GET    /api/timelines/:timelineId              // View timeline
PUT    /api/timelines/:timelineId              // Edit (Admin only)
DELETE /api/timelines/:timelineId              // Delete (Admin only)

POST   /api/timelines/:timelineId/events       // Create event (Editor+ required)
GET    /api/timelines/:timelineId/events       // List events (any member)
PUT    /api/timelines/:timelineId/events/:id   // Edit event (Editor+, not if archived)
DELETE /api/timelines/:timelineId/events/:id   // Delete event (Editor+, not if archived)

POST   /api/timelines/:timelineId/members      // Invite user (Admin only)
PUT    /api/timelines/:timelineId/members/:id  // Change role (Admin only)
DELETE /api/timelines/:timelineId/members/:id  // Remove member (Admin only, no last-admin removal)
GET    /api/timelines/:timelineId/my-role      // Get my role in this timeline
```

### Middleware Composition

```typescript
// Generic route handler with permission checks
router.post(
  '/:timelineId/events',
  authenticate,                    // 1. Verify JWT token
  requireTimelineAccess,            // 2. Verify timeline membership + attach context
  requireRole('Editor', 'Admin'),   // 3. Verify permission level
  asyncHandler(createEventHandler)  // 4. Business logic
);

// Timeline settings route (Admin only)
router.put(
  '/:timelineId',
  authenticate,
  requireTimelineAccess,
  requireRole('Admin'),            // Only Admins can edit timeline
  asyncHandler(updateTimelineHandler)
);
```

---

## Performance Characteristics

### Database Queries

| Operation | Query Count | Cached? |
|-----------|------------|---------|
| Verify timeline access (cold) | 1 | ❌ First time |
| Verify timeline access (warm) | 0 | ✅ Cache hit (5 min) |
| Create event with role check | 1-2 | ✅ Access cached |
| List user's timelines | 1 | ❌ (small result set) |

### Expected Impact

- **Cold start latency**: +5ms per permission check (first request)
- **Warm cache latency**: <1ms per permission check (typical)
- **Cache invalidation time**: 300 seconds max (permission change propagates)

---

## Security Guards

✅ **Privilege Escalation Prevention**:
- Always verify permissions from database for sensitive operations
- Cache used only for read operations (no stale role writes)
- Service layer re-checks permissions before mutations

✅ **Data Isolation**:
- Database CHECK constraints prevent cross-timeline event-category links
- Triggers enforce timeline boundaries
- Explicit timelineId filtering in all queries

✅ **Last Admin Protection**:
- Database check prevents removing only Admin from timeline
- Cannot demote last Admin (conversion to Editor)
- Timeline always maintains at least 1 Admin

✅ **Archived Timeline Enforcement**:
- Non-Admin users blocked from editing archived timeline events
- Admins have unrestricted access (can unarchive or fix data)
- Readers unaffected (read-only anyway)

---

## Implementation Phases

| Phase | Duration | Tasks |
|-------|----------|-------|
| **1** | Week 1-2 | Create timeline tables; migration script; basic middleware |
| **2** | Week 3-4 | Role enforcement; permission caching; service layer updates |
| **3** | Week 5-6 | Frontend integration; member management UI; permission-aware rendering |
| **4** | Week 7 | Integration tests; security audit; deployment |

---

## Files to Create/Modify

### Backend
```
backend/src/
├── middleware/
│   ├── authorization.ts (NEW)
│   └── timeline-context.ts (NEW)
├── services/
│   ├── TimelineService.ts (NEW)
│   └── AuthorizationService.ts (NEW)
├── db/migrations/
│   └── 003_add_timelines.sql (NEW)
└── types/
    ├── timeline.ts (NEW)
    └── permissions.ts (NEW)
```

### Frontend
```
frontend/src/
├── hooks/
│   └── useTimelinePermissions.ts (NEW)
├── components/
│   └── timeline/
│       ├── TimelineSwitcher.tsx (NEW)
│       └── MemberManagement.tsx (NEW)
└── types/
    └── permissions.ts (NEW)
```

---

## Test Coverage Required

```typescript
// 8 test suites minimum

1. Authentication & Timeline Access
   - Authorized user can access timeline
   - Unauthorized user rejected
   - Unauthenticated request rejected

2. Role-Based Permissions
   - Admin can perform all actions
   - Editor can create/edit/delete events
   - Viewer has read-only access

3. Archived Timeline Behavior
   - Non-Admin blocked from edits
   - Admin can still edit
   - Read access works for all

4. Last Admin Protection
   - Cannot remove only Admin
   - Cannot demote last Admin
   - Can remove non-last Admin

5. Member Management
   - Admin can invite users
   - Admin can change roles
   - Admin can remove members

6. Permission Caching
   - Cache hit rate measured
   - Cache invalidation tested
   - Stale data never written

7. Data Isolation
   - Events cannot reference categories from other timelines
   - Cross-timeline queries blocked
   - Triggers enforce constraints

8. API Surface
   - All endpoints require appropriate role
   - Endpoints return 403 on insufficient permissions
   - Error messages don't leak timeline existence
```

---

## Migration Path (Existing Single-Timeline App → Multi-Timeline)

1. **Create "Default Timeline"** with min/max dates from all events
2. **Assign all existing users** as Admins of default timeline
3. **Link all events/categories** to default timeline
4. **Preserve all data** with zero loss
5. **Users unaffected** - continue working with single timeline until they create new ones

---

## Key Requirements Met

| Requirement | Solution |
|-------------|----------|
| **FR-006**: Auto-assign creator as Admin | Service layer creates membership with Admin role |
| **FR-007**: Support 3 roles | ENUM type + permission matrix |
| **FR-008**: Restrict to members only | requireTimelineAccess middleware |
| **FR-009**: Read-only for archived (non-Admin) | middleware + service layer check |
| **FR-010**: Invite with role | TimelineService.addMember() |
| **FR-011**: Change roles | TimelineService.changeMemberRole() |
| **FR-012**: Prevent last-admin removal | Database count check |

---

## Next Steps

1. **Review** this recommendation with team
2. **Implement Phase 1** (database schema + basic middleware)
3. **Add comprehensive tests** as each phase completes
4. **Performance benchmark** caching at scale
5. **Security audit** before production deployment

For detailed implementation code, schema definitions, and example handlers, see **RBAC-RESEARCH.md**.
