# Research: Email Timeline Invites

**Feature**: 002-email-timeline-invites
**Date**: 2026-01-08
**Status**: Complete

## Research Topics

### 1. Email Service Selection

**Context**: The spec requires sending invitation emails containing unique invitation links. Need to choose between SMTP and transactional email API.

**Decision**: Use Nodemailer with SMTP configuration

**Rationale**:
- Project already uses Node.js ecosystem; Nodemailer is the standard
- SMTP configuration allows flexibility (can use any email provider)
- Development mode can use Ethereal.email for testing without real sends
- Production can upgrade to SendGrid/Resend/SES by changing SMTP config
- No additional API keys needed for basic SMTP (e.g., Gmail, Mailgun SMTP)

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| SendGrid API | Deliverability analytics, templates | Requires API key, monthly costs | Over-engineered for MVP |
| Resend | Modern API, good DX | Requires API key, newer service | Adding dependency for simple emails |
| AWS SES | High volume, low cost | Requires AWS setup, verification | Infrastructure complexity |
| **Nodemailer SMTP** | Flexible, no vendor lock-in | Manual template handling | ✅ Selected |

**Implementation Notes**:
```typescript
// EmailService abstraction allows future provider swap
interface EmailService {
  sendInvitation(to: string, invitation: InvitationDetails): Promise<boolean>;
}

// Development: Ethereal.email (fake SMTP)
// Production: Configure via SMTP_HOST, SMTP_USER, SMTP_PASS env vars
```

### 2. Secure Token Generation

**Context**: Invitation tokens must be cryptographically secure and non-guessable (FR-012). Need to determine token format and generation method.

**Decision**: Use Node.js `crypto.randomBytes(32)` encoded as URL-safe Base64

**Rationale**:
- `crypto.randomBytes` is cryptographically secure (uses OS entropy source)
- 32 bytes = 256 bits of entropy, exceeding standard requirements (128 bits)
- Base64 URL-safe encoding produces 43-character tokens (no +, /, =)
- Native Node.js, no external dependencies
- Same approach used by JWT libraries for signing keys

**Token Format**:
```
Entropy: 32 bytes (256 bits)
Encoding: Base64 URL-safe (RFC 4648)
Length: 43 characters
Example: A3kJ8mQ2nP5vX7yB9dF1gH4jL6sT8wZ0qR2eC5fY7i
```

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| UUID v4 | Standard, readable | 122 bits entropy | Lower entropy than needed |
| nanoid | Short IDs, configurable | Additional dependency | Adds package for simple task |
| JWT token | Contains claims, verifiable | Complex, expires differently | Over-engineered, extra parsing |
| **crypto.randomBytes** | Max entropy, native | Longer than UUID | ✅ Selected |

**Security Considerations**:
- Tokens stored as bcrypt hash in database (one-way, like passwords)
- Original token only sent once via email, never logged
- Token validated via `bcrypt.compare()` on redemption
- Expired tokens return generic "invalid" error (no timing attacks)

### 3. Invitation Link Structure

**Context**: Need to determine the URL structure for invitation links that work for both new and existing users.

**Decision**: Use `/invite/:token` path with frontend routing

**Rationale**:
- Single entry point for all invitation types
- Token in URL path (not query param) for cleaner sharing
- Frontend determines flow (register vs login) based on user state
- Backend validates token on API call, not page load
- Works with React Router's existing setup

**URL Structure**:
```
Production: https://app.example.com/invite/A3kJ8mQ2nP5vX7yB9dF1gH4jL6sT8wZ0qR2eC5fY7i
Development: http://localhost:5173/invite/A3kJ8mQ2nP5vX7yB9dF1gH4jL6sT8wZ0qR2eC5fY7i
```

**Flow Logic**:
```
1. User clicks link → /invite/:token
2. Frontend calls GET /api/invitations/validate/:token
3. API returns: { valid: true, email: "...", timeline: "...", role: "...", existingUser: true|false }
4. Frontend renders:
   - If existingUser && logged in as that user → Accept page
   - If existingUser && not logged in → Login page with redirect
   - If existingUser && logged in as different user → Error + logout option
   - If !existingUser → Register page with pre-filled email
5. User completes action → POST /api/invitations/accept/:token
```

### 4. Email Template Content

**Context**: Invitation emails must include inviter's name, timeline name, assigned role, and link (FR-016).

**Decision**: Plain text + simple HTML template with all required information

**Template Structure**:
```
Subject: You've been invited to collaborate on "{timelineName}"

---

Hi,

{inviterName} has invited you to join "{timelineName}" as {role}.

Click the link below to accept the invitation:
{inviteLink}

This invitation expires in 7 days.

If you don't recognize this invitation, you can safely ignore this email.

— The Festival Timeline Team
```

**HTML Version**: Same content with basic styling, mobile-responsive (single column, 600px max-width).

### 5. Existing User Detection

**Context**: When admin enters an email, system must detect if it belongs to an existing user (FR-005) to determine the invitation flow.

**Decision**: Check `users` table by email (case-insensitive) at invite creation time

**Implementation**:
```typescript
// In InvitationService.create()
const existingUser = await query(
  'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
  [email]
);

// Store in invitation record
invitation.targetUserId = existingUser?.id || null;
invitation.isExistingUser = !!existingUser;
```

**Edge Cases**:
- User registers between invite send and accept → Re-check at acceptance time
- Email case differences → Always use LOWER() for comparison
- User deletes account after invite → Treat as new user on acceptance

### 6. Timeline Visibility Implementation

**Context**: Users must only see timelines they own or are members of (FR-008). Current `getAccessible` query already enforces this.

**Decision**: No changes needed to existing timeline visibility logic

**Verification**:
```sql
-- Current query in TimelineService.getAccessible() already enforces visibility:
SELECT t.* FROM timelines t
JOIN timeline_members tm ON t.id = tm.timelineId
WHERE tm.userId = $1 AND t.status != 'Archived'
```

The existing membership-based visibility system handles FR-008. New users registering via invitation are automatically added to `timeline_members`, making the timeline visible immediately.

### 7. Duplicate Invitation Handling

**Context**: System must prevent duplicate pending invitations to the same email for the same timeline (FR-009).

**Decision**: Reuse existing pending invitation with updated role and resent email

**Rationale**:
- Better UX: Admin may have mistyped role first time
- Prevents token confusion: Only one valid token per email/timeline pair
- Spec explicitly states: "reuses existing pending invitation and resends"

**Implementation**:
```typescript
// In InvitationService.create()
const existing = await query(
  `SELECT * FROM timeline_invitations
   WHERE LOWER(email) = LOWER($1) AND timelineId = $2 AND status = 'pending'`,
  [email, timelineId]
);

if (existing) {
  // Update role if changed, regenerate expiration, resend email
  await query(
    `UPDATE timeline_invitations
     SET role = $1, expiresAt = NOW() + INTERVAL '7 days', updatedAt = NOW()
     WHERE id = $2`,
    [role, existing.id]
  );
  await emailService.sendInvitation(...);
  return existing;
}
```

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| Email Service | Nodemailer with SMTP (Ethereal for dev) |
| Token Generation | `crypto.randomBytes(32)` → Base64 URL-safe |
| Token Storage | bcrypt hash in database |
| Link Structure | `/invite/:token` with frontend routing |
| Email Template | Plain text + simple HTML |
| Existing User Check | Query users table at invite creation |
| Timeline Visibility | Existing membership query (no changes) |
| Duplicate Handling | Update existing pending invitation |

## Dependencies to Add

```json
// backend/package.json additions
{
  "nodemailer": "^6.9.8"
}

// devDependencies
{
  "@types/nodemailer": "^6.4.14"
}
```

No frontend dependencies needed.
