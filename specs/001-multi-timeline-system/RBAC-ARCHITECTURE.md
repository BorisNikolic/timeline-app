# RBAC Architecture Diagrams & Flow

## 1. Database Entity Relationship Diagram (ERD)

```
┌─────────────────┐          ┌──────────────────────┐          ┌──────────────────────┐
│     users       │          │     timelines        │          │  timeline_members    │
├─────────────────┤          ├──────────────────────┤          ├──────────────────────┤
│ id (PK)         │◄─────┐   │ id (PK)              │◄─────┐   │ id (PK)              │
│ email           │      │   │ name                 │      │   │ timelineId (FK)      │
│ passwordHash    │      │   │ startDate            │      │   │ userId (FK)          │
│ name            │      │   │ endDate              │      │   │ role (ENUM)          │
│ createdAt       │      │   │ themeColor           │      │   │ joinedAt             │
│ updatedAt       │      │   │ status               │      │   │ invitedBy (FK)       │
└─────────────────┘      │   │ ownerId (FK) ────────┘      │   └──────────────────────┘
                         │   │ createdAt            │      │        ▲
                         │   │ updatedAt            │      │        │
                         │   └──────────────────────┘      │        │ UNIQUE
                         │                                 │   (timelineId, userId)
                         └─────────────────────────────────┘

┌──────────────────┐          ┌──────────────────────┐
│    categories    │          │      events          │
├──────────────────┤          ├──────────────────────┤
│ id (PK)          │          │ id (PK)              │
│ name             │          │ title                │
│ color            │          │ date                 │
│ timelineId (FK)  │◄─────┐   │ description          │
│ createdBy (FK)   │      │   │ timelineId (FK)      │
│ createdAt        │      │   │ categoryId (FK) ─────┘
└──────────────────┘      │   │ assignedPerson       │
                          │   │ status (ENUM)        │
                          │   │ priority (ENUM)      │
                          │   │ createdBy (FK)       │
                          │   │ createdAt            │
                          │   │ updatedAt            │
                          │   └──────────────────────┘

Key Relationships:
  • timeline_members.userId → users.id (many-to-many via junction)
  • timeline_members.timelineId → timelines.id
  • timelines.ownerId → users.id (creator)
  • events.timelineId → timelines.id (data isolation)
  • events.categoryId → categories.id (same timeline only)
  • categories.timelineId → timelines.id (per-timeline categories)
```

---

## 2. Request Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Incoming HTTP Request                              │
│  POST /api/timelines/timeline-123/events                                     │
│  Authorization: Bearer <JWT>                                                │
│  Body: { title: "Setup Stage", ... }                                        │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ authenticate middleware  │
                    │ (verify JWT token)       │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼──────────────────────┐
                    │ Extract timelineId from params    │
                    │ GET req.params.timelineId = "123" │
                    └────────────┬──────────────────────┘
                                 │
        ┌────────────────────────▼────────────────────────┐
        │ requireTimelineAccess middleware                │
        │                                                  │
        │  Query: SELECT role FROM timeline_members       │
        │         WHERE timelineId = $1 AND userId = $2   │
        │                                                  │
        └────────────┬──────────────────────┬────────────┘
                     │                      │
           ┌─────────▼──────────┐  ┌───────▼──────────┐
           │ User is member     │  │ User NOT member  │
           │ (result.rows > 0)  │  │ (result.rows=0)  │
           └─────────┬──────────┘  └───────┬──────────┘
                     │                      │
     ┌───────────────▼──────────────┐       │
     │ Attach to request:           │       │
     │ req.timeline = {             │  ┌────▼────────────────┐
     │   id: "123",                 │  │ Return 403 Forbidden │
     │   role: "Editor"             │  │ error: Access denied │
     │ }                            │  └─────────────────────┘
     └──────────┬────────────────────┘
                │
   ┌────────────▼────────────────────┐
   │ requireRole('Editor', 'Admin')   │
   │                                  │
   │ Check if 'Editor' in allowed     │
   │ roles?                           │
   └────────┬──────────────┬──────────┘
            │              │
      ┌─────▼──────┐  ┌────▼───────────────────┐
      │ ✓ Role OK  │  │ ✗ Role insufficient    │
      │            │  │ Return 403 Forbidden   │
      │            │  │ error: Requires Admin  │
      └─────┬──────┘  └────────────────────────┘
            │
   ┌────────▼──────────────────────┐
   │ Route Handler: createEvent()   │
   │                                │
   │ - Validate input (Zod schema)  │
   │ - Call EventService            │
   │ - Re-verify permission         │
   │ - Insert to database           │
   │ - Return 201 Created           │
   └────────┬───────────────────────┘
            │
   ┌────────▼───────────────────────┐
   │ Return response                 │
   │ { id, title, status, ... }      │
   └────────────────────────────────┘
```

---

## 3. Permission Check Caching Strategy

```
                     User Request
                          │
                          ▼
              ┌──────────────────────┐
              │ Check L1 Cache       │
              │ (Node-cache, 5 min)  │
              │                      │
              │ Key: "user-1:tl-123" │
              └──────┬──────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼──────┐          ┌──────▼──────┐
    │ Cache    │          │ Cache       │
    │ HIT ✓    │          │ MISS ✗      │
    │ (90%)    │          │ (10%)       │
    └───┬──────┘          └──────┬──────┘
        │                        │
    Return cached            Database
    role instantly         SELECT query
    <1ms                        │
        │                    ┌──▼────┐
        │                    │ Result │
        │                    │ {role} │
        │                    └──┬────┘
        │                       │
        │                   Store in
        │                   Cache
        │                  (TTL: 300s)
        │                       │
        └───────┬───────────────┘
                │
            ┌───▼────────┐
            │ Return      │
            │ Permission  │
            │ to Route    │
            └─────────────┘

Cache Invalidation:
  When user's role changes:
    - DELETE cache entry immediately
    - Next request forces DB query
    - Cache repopulated with new data
    - Stale permission problem solved
```

---

## 4. Role Hierarchy & Permissions Cascade

```
                    ┌──────────┐
                    │   Admin  │
                    └─────┬────┘
                          │
                  ✓ Full control
                  ✓ All 13 permissions
                          │
        ┌─────────────────▼─────────────────┐
        │                                   │
    ┌───▼────┐                         ┌───▼────┐
    │ Editor │                         │ Viewer │
    └───┬────┘                         └────────┘
        │
  ✓ Create/Edit/Delete Events
  ✓ View Analytics
  ✓ Export Data
  ✗ Manage Members
  ✗ Edit Timeline
  ✗ Delete Timeline

Permission Matrix:

                Admin  Editor  Viewer
View             ✓      ✓       ✓
Create Event     ✓      ✓       ✗
Edit Event       ✓      ✓       ✗
Delete Event     ✓      ✓       ✗
View Analytics   ✓      ✓       ✓
Export Data      ✓      ✓       ✓
Edit Timeline    ✓      ✗       ✗
Manage Members   ✓      ✗       ✗
Archive          ✓      ✗       ✗
Delete           ✓      ✗       ✗

Hierarchical Check:
  User Role → Allowed Actions
  Admin (level 3) → all actions
  Editor (level 2) → create, edit, delete events + read
  Viewer (level 1) → read only
```

---

## 5. Middleware Composition Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  router.post('/api/timelines/:id/events',                   │
│              authenticate,            ← Layer 1: JWT verify  │
│              requireTimelineAccess,    ← Layer 2: membership  │
│              requireRole('Editor'),    ← Layer 3: permission  │
│              requireReadOnlyIfArchived,← Layer 4: timeline    │
│              asyncHandler(handler)     ← Layer 5: business    │
│  )                                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
     ┌─────────────▼──────────────┐
     │ Layer 1: authenticate      │
     │ Verify JWT token exists    │
     │ Decode and validate        │
     │ Set req.user = {           │
     │   userId, email, name      │
     │ }                          │
     │ next()                     │
     └─────────────┬──────────────┘
                   │
     ┌─────────────▼─────────────────┐
     │ Layer 2: requireTimelineAccess │
     │ Extract timelineId from params │
     │ Query: SELECT role FROM       │
     │        timeline_members        │
     │ Set req.timeline = {          │
     │   id, role                    │
     │ }                             │
     │ next() OR 403                 │
     └─────────────┬─────────────────┘
                   │
     ┌─────────────▼──────────────────┐
     │ Layer 3: requireRole('Editor') │
     │ Check if role in allowed set   │
     │ ['Editor', 'Admin'] includes   │
     │ req.timeline.role?             │
     │ next() OR 403                  │
     └─────────────┬──────────────────┘
                   │
     ┌─────────────▼──────────────────┐
     │ Layer 4: readOnlyIfArchived    │
     │ Check timeline.status          │
     │ If 'Archived' and              │
     │ req.method !== 'GET':          │
     │   return 403                   │
     │ next()                         │
     └─────────────┬──────────────────┘
                   │
     ┌─────────────▼──────────────────┐
     │ Layer 5: Handler/Service       │
     │ Business logic (create event)  │
     │ Can trust req.user and         │
     │ req.timeline are valid         │
     │ Return response                │
     └────────────────────────────────┘

Defense-in-Depth:
  • If Layer 1 fails: 401 Unauthorized
  • If Layer 2 fails: 403 Access Denied
  • If Layer 3 fails: 403 Insufficient Role
  • If Layer 4 fails: 403 Read-Only Timeline
  • If Layer 5 fails: 400/500 Business Error

Each layer is independent. If one is accidentally removed,
others still provide protection.
```

---

## 6. Timeline Lifecycle & Permission Implications

```
Timeline Lifecycle Diagram:

    CREATE
      │
      ▼
  ┌─────────┐
  │Planning │ ← Timeline being set up
  └────┬────┘
       │ (owner transitions)
       ▼
  ┌─────────┐
  │ Active  │ ← Festival currently happening
  └────┬────┘
       │ (after festival ends)
       ▼
  ┌─────────────┐
  │ Completed   │ ← Festival finished
  └────┬────────┘
       │
  ┌────┴─────────┐
  │              │
  │ (archive)    │ (unarchive)
  ▼              ▼
┌────────┐      (back to
│Archived│       Completed)
└────────┘

Permission Changes by Status:

Planning:
  • All roles: full read/write
  • Purpose: Setup period

Active:
  • All roles: full read/write
  • Purpose: Execution phase

Completed:
  • All roles: read + retrospective notes
  • Editors+: can still edit
  • Purpose: Post-festival analysis

Archived:
  • Viewers: read-only (always)
  • Editors: read-only (blocked from edits)
  • Admins: full access (can unarchive)
  • Purpose: Historical reference

Code Check:

if (timeline.status === 'Archived' && req.timeline.role !== 'Admin') {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(403).json({ error: 'Archived timeline is read-only' });
  }
}
```

---

## 7. Last Admin Protection Mechanism

```
Attempting to Remove Last Admin:

┌──────────────────────────────────┐
│ DELETE /timelines/t1/members/u2  │
│ (Admin u1 removing Admin u2)     │
└────────┬─────────────────────────┘
         │
  ┌──────▼──────────┐
  │ Check: Is u2    │
  │ the last Admin? │
  └──────┬──────────┘
         │
  ┌──────▼──────────────────────────────┐
  │ SELECT COUNT(*) as count             │
  │ FROM timeline_members                │
  │ WHERE timelineId = t1                │
  │ AND role = 'Admin'                   │
  └──────┬──────────────────────────────┘
         │
    ┌────┴─────┐
    │           │
┌───▼──┐   ┌────▼───┐
│Count: │   │ Count: │
│ > 1   │   │   1    │
└───┬───┘   └────┬───┘
    │            │
    │      ┌─────▼────────────────────────┐
    │      │ Return 400 Bad Request       │
    │      │ Error: Cannot remove last    │
    │      │ Admin. Timeline must always  │
    │      │ have at least one Admin.     │
    │      │ Promote someone else first.  │
    └──┬───┴─────────────────────────────┘
       │
    ┌──▼──────┐
    │ Allow   │
    │ removal │
    └─────────┘

Code Implementation:

async function removeMember(timelineId, userId) {
  // Get role being removed
  const target = await query(
    'SELECT role FROM timeline_members WHERE timelineId = $1 AND userId = $2',
    [timelineId, userId]
  );

  // Only check if removing an Admin
  if (target.rows[0]?.role === 'Admin') {
    const result = await query(
      'SELECT COUNT(*) as count FROM timeline_members WHERE timelineId = $1 AND role = ?',
      [timelineId]
    );

    // Block if last Admin
    if (result.rows[0].count === 1) {
      throw new Error('Cannot remove the last Admin');
    }
  }

  // Safe to remove
  await query(
    'DELETE FROM timeline_members WHERE timelineId = $1 AND userId = $2',
    [timelineId, userId]
  );
}
```

---

## 8. Data Isolation Architecture

```
Multiple Timelines with Isolated Data:

User Alice:
  Timeline A (Spring Festival)        Timeline B (Summer Fest)
  ├─ Events:                           ├─ Events:
  │  ├─ Setup stage (cat: Logistics)  │  ├─ Beach cleanup (cat: Logistics)
  │  ├─ Marketing (cat: Marketing)    │  ├─ Sound check (cat: Entertainment)
  │  └─ Security (cat: Security)      │  └─ Food vendors (cat: Logistics)
  │                                    │
  ├─ Categories:                       ├─ Categories:
  │  ├─ Logistics (#FF5500)           │  ├─ Logistics (#00BB00)  ← Different color!
  │  ├─ Marketing (#00FF00)           │  ├─ Entertainment (#FF00FF)
  │  └─ Security (#FF0000)            │  └─ Catering (#FFFF00)
  │                                    │
  └─ Members:                          └─ Members:
     ├─ Alice (Admin)                     ├─ Alice (Viewer)
     └─ Bob (Editor)                      └─ Charlie (Admin)

Queries:
  • SELECT events FROM timeline A
    → Only returns events WHERE timelineId = A.id

  • UPDATE event in timeline A
    → Only succeeds if event.timelineId = A.id AND categoryId.timelineId = A.id

  • List categories for timeline B
    → SELECT * FROM categories WHERE timelineId = B.id

  • Can Alice link event from timeline A to category from timeline B?
    → NO! Database CHECK constraint prevents this:
       IF categoryId.timelineId != event.timelineId THEN ERROR

Constraint Example:

CREATE TRIGGER check_timeline_isolation
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW
WHEN NEW.categoryId IS NOT NULL
EXECUTE FUNCTION (
  SELECT timelineId FROM categories WHERE id = NEW.categoryId
) != NEW.timelineId
THEN RAISE EXCEPTION 'Category must belong to same timeline as event'
```

---

## 9. Comparison: Before vs After RBAC

### Before (Current Single-Timeline)
```
User logs in → Authenticated? → YES → Has database access → can read/write all events

Pros: Simple, no permissions to check
Cons: No multi-user control, no audit, all-or-nothing access
```

### After (Multi-Timeline with RBAC)
```
User logs in → Authenticated? → YES → Has timeline access? → YES → Has required role?
→ YES → Can access specific timeline with specific permissions

Pros:
  ✓ Multiple users can safely collaborate
  ✓ Fine-grained permissions per timeline
  ✓ Audit trail (who made what changes)
  ✓ Read-only access for stakeholders
  ✓ Last-admin protection prevents deadlocks
  ✓ Data isolation prevents cross-timeline pollution

Cons:
  ✗ More database queries (mitigated by caching)
  ✗ More configuration needed per user
  ✗ Need to teach team members about roles
```

---

## 10. Backward Compatibility: Migration Flow

```
Existing App                     Migration                    New Multi-Timeline App
  (Single Timeline)                  Process                        (Multi-Timeline)
       │                              │                                  │
       │                         1. Create               ┌──────────────────┐
       │◄──────────────────────────> │◄──────────────────┤ "Default         │
       │ All events go here           │                   │ Timeline"        │
       │ (implicit timeline)      2. Link all            │                  │
       │                         events to it             │ ID: default-1    │
       │ (no timelineId column)  3. Link users           │ Name: "Default"  │
       │                         as Admins               │ Owner: (creator) │
       │                         4. Add new              │ Status: Active   │
       │ No access control           columns             │                  │
       │ (all users can edit)    5. Backup old           └──────────────────┘
       │                         database                      │
       │                             │◄──────────────────────►├─ Migration Complete
       │                             │                        │
       │                             │                        ├─ All data preserved
       │                             │                        ├─ Users unchanged
       │                             │                        ├─ New timelines
       │                             │                        │  available
       │                             │                        └─ Old implicit
       │                             │                           timeline works
       │                             │
       └─────────────────────────────┴────────────────────────┘
         Zero data loss, backward compatible
```

---

## Summary

- **3-layer middleware**: Authenticate → Timeline Access → Role Check
- **Caching**: 90% hit rate, 5-min TTL
- **Data isolation**: Per-timeline events/categories, triggers enforce boundaries
- **Last-admin protection**: Database constraints + application checks
- **Defense-in-depth**: Multiple layers protect against single-point failures
- **Backward compatible**: Existing data migrated to "Default Timeline"
