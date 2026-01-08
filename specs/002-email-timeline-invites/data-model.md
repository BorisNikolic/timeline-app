# Data Model: Email Timeline Invites

**Feature**: 002-email-timeline-invites
**Date**: 2026-01-08
**Status**: Complete

## Entity Overview

This feature introduces one new entity (`TimelineInvitation`) and extends no existing entities. The `timeline_members` table (existing) is used for accepted invitations.

## Entity: TimelineInvitation

**Purpose**: Represents a pending invitation for a user to join a timeline with a specific role.

### Database Schema

```sql
-- Migration: 004_invitations.sql

BEGIN;

-- 1. Create invitation status enum
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- 2. Create timeline_invitations table
CREATE TABLE timeline_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  email VARCHAR(255) NOT NULL,                    -- Invitee email (always stored lowercase)
  tokenHash VARCHAR(255) NOT NULL,                -- bcrypt hash of invitation token
  role member_role NOT NULL DEFAULT 'Viewer',     -- Role to assign on acceptance
  status invitation_status NOT NULL DEFAULT 'pending',

  -- Relationships
  timelineId UUID NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
  invitedBy UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  targetUserId UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL if new user

  -- Tracking
  expiresAt TIMESTAMP NOT NULL,                   -- 7 days from creation
  acceptedAt TIMESTAMP,                           -- When invitation was accepted
  acceptedByUserId UUID REFERENCES users(id) ON DELETE SET NULL,  -- Who accepted

  -- Metadata
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 3. Indexes
CREATE INDEX idx_invitations_timeline ON timeline_invitations(timelineId);
CREATE INDEX idx_invitations_email ON timeline_invitations(LOWER(email));
CREATE INDEX idx_invitations_status ON timeline_invitations(status) WHERE status = 'pending';
CREATE INDEX idx_invitations_expires ON timeline_invitations(expiresAt) WHERE status = 'pending';

-- 4. Unique constraint: one pending invite per email per timeline
CREATE UNIQUE INDEX idx_invitations_pending_unique
  ON timeline_invitations(timelineId, LOWER(email))
  WHERE status = 'pending';

-- 5. Trigger for updatedAt
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON timeline_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

### TypeScript Types

```typescript
// backend/src/types/invitation.ts

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface TimelineInvitation {
  id: string;
  email: string;
  tokenHash: string;
  role: MemberRole;
  status: InvitationStatus;
  timelineId: string;
  invitedBy: string;
  targetUserId: string | null;
  expiresAt: string;  // ISO timestamp
  acceptedAt: string | null;
  acceptedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

// For API responses (excludes sensitive tokenHash)
export interface TimelineInvitationPublic {
  id: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  timelineId: string;
  invitedByName: string;  // Joined from users table
  timelineName: string;   // Joined from timelines table
  expiresAt: string;
  createdAt: string;
}

// For token validation response
export interface InvitationValidation {
  valid: boolean;
  expired?: boolean;
  email?: string;
  role?: MemberRole;
  timelineId?: string;
  timelineName?: string;
  inviterName?: string;
  isExistingUser?: boolean;
}
```

### Field Details

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique identifier |
| `email` | VARCHAR(255) | NOT NULL, email format | Invitee's email address (stored lowercase) |
| `tokenHash` | VARCHAR(255) | NOT NULL | bcrypt hash of the invitation token |
| `role` | member_role | NOT NULL, default 'Viewer' | Role to assign on acceptance |
| `status` | invitation_status | NOT NULL, default 'pending' | Current invitation state |
| `timelineId` | UUID | FK → timelines, CASCADE | Timeline being invited to |
| `invitedBy` | UUID | FK → users, CASCADE | User who sent the invitation |
| `targetUserId` | UUID | FK → users, SET NULL | Existing user ID if email matches (NULL for new users) |
| `expiresAt` | TIMESTAMP | NOT NULL | Token expiration (creation + 7 days) |
| `acceptedAt` | TIMESTAMP | nullable | When the invitation was accepted |
| `acceptedByUserId` | UUID | FK → users, SET NULL | User who accepted (may differ from targetUserId if new registration) |
| `createdAt` | TIMESTAMP | NOT NULL, auto | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL, auto-trigger | Last modification time |

### State Machine

```
                                     ┌──────────────┐
                                     │   expired    │
                                     └──────────────┘
                                           ↑
                                     (cron or check)
                                           │
┌──────────┐     create      ┌──────────────┴───────────────┐     accept      ┌──────────────┐
│  (none)  │ ─────────────→  │          pending              │ ─────────────→  │   accepted   │
└──────────┘                 └──────────────────────────────┘                 └──────────────┘
                                           │
                                       cancel
                                           ↓
                                     ┌──────────────┐
                                     │  cancelled   │
                                     └──────────────┘
```

**Transitions**:
- `pending` → `accepted`: User completes registration or login via invite link
- `pending` → `cancelled`: Admin cancels the invitation
- `pending` → `expired`: Token expiration check (on access or via scheduled job)

### Validation Rules

From spec requirements:

| Rule | Implementation |
|------|----------------|
| FR-003: 7-day expiration | `expiresAt = NOW() + INTERVAL '7 days'` |
| FR-009: No duplicate pending | Unique index on `(timelineId, LOWER(email)) WHERE status = 'pending'` |
| FR-012: Secure token | 32 bytes from `crypto.randomBytes`, bcrypt hashed |
| FR-013: Email must match | On acceptance, verify `LOWER(user.email) = LOWER(invitation.email)` |
| FR-014: Track metadata | `invitedBy`, `createdAt`, `role` fields |

### Relationships

```
                      ┌───────────────────┐
                      │      users        │
                      │   (invitedBy)     │
                      └─────────┬─────────┘
                                │
                                ▼
┌───────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   timelines   │◄────│ timeline_invitations│────►│      users        │
│               │     │                     │     │   (targetUserId)  │
└───────────────┘     └───────────────────┘     └───────────────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │      users        │
                      │ (acceptedByUserId)│
                      └───────────────────┘
```

**Foreign Key Behaviors**:
- `timelineId CASCADE`: Deleting timeline removes all its invitations
- `invitedBy CASCADE`: Deleting inviter removes their invitations
- `targetUserId SET NULL`: Deleting target user keeps invitation, treats as new user
- `acceptedByUserId SET NULL`: Deleting accepter keeps historical record

### Query Patterns

**List pending invitations for a timeline (admin view)**:
```sql
SELECT
  ti.id, ti.email, ti.role, ti.status, ti.expiresAt, ti.createdAt,
  u.name as invitedByName,
  t.name as timelineName
FROM timeline_invitations ti
JOIN users u ON ti.invitedBy = u.id
JOIN timelines t ON ti.timelineId = t.id
WHERE ti.timelineId = $1 AND ti.status = 'pending'
ORDER BY ti.createdAt DESC;
```

**Validate invitation token**:
```sql
SELECT
  ti.*,
  t.name as timelineName,
  u.name as inviterName,
  (SELECT id FROM users WHERE LOWER(email) = LOWER(ti.email)) as existingUserId
FROM timeline_invitations ti
JOIN timelines t ON ti.timelineId = t.id
JOIN users u ON ti.invitedBy = u.id
WHERE ti.id = $1 AND ti.status = 'pending';
-- Then: bcrypt.compare(token, ti.tokenHash)
-- Then: Check ti.expiresAt > NOW()
```

**Accept invitation (within transaction)**:
```sql
BEGIN;

-- 1. Mark invitation as accepted
UPDATE timeline_invitations
SET status = 'accepted', acceptedAt = NOW(), acceptedByUserId = $1
WHERE id = $2 AND status = 'pending';

-- 2. Create membership
INSERT INTO timeline_members (timelineId, userId, role, invitedBy)
VALUES ($3, $1, $4, $5);

COMMIT;
```

## Existing Entity Updates

### timeline_members

**No schema changes required.** The existing `timeline_members` table already supports:
- `role` field for Admin/Editor/Viewer assignment
- `invitedBy` field for tracking who added the member
- `joinedAt` for membership timestamp

Accepted invitations create records in this table, completing the invitation flow.

### users

**No schema changes required.** New user registration via invitation uses the existing user creation flow with the addition of accepting the invitation in the same transaction.

## Migration Rollback

```sql
-- Rollback: 004_invitations.sql

BEGIN;

DROP TABLE IF EXISTS timeline_invitations CASCADE;
DROP TYPE IF EXISTS invitation_status;

COMMIT;
```
