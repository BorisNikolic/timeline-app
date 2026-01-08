# Implementation Plan: Email Timeline Invites

**Branch**: `002-email-timeline-invites` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-email-timeline-invites/spec.md`

## Summary

Implement an email invitation system that allows timeline admins to invite collaborators via email. The system supports both new users (who will register via invitation link) and existing users (who click the link to be added to the timeline). Core functionality includes secure invitation tokens with 7-day expiration, pre-filled registration forms, and timeline visibility scoped to membership. This enables privacy-first collaboration where users only see timelines they own or are invited to.

## Technical Context

**Language/Version**: TypeScript 5.3, Node.js 20+
**Primary Dependencies**: Express.js 4.18, React 18, React Query, Zustand, Passport.js, Zod
**Storage**: PostgreSQL 16 with parameterized queries via `pg` driver
**Testing**: Vitest (unit/integration), Playwright (E2E)
**Target Platform**: Web application (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: Timeline loads <2s with 200+ events, invitation emails sent within 2 minutes
**Constraints**: No email verification required for registered users, invitation tokens valid 7 days
**Scale/Scope**: Support 10+ concurrent users, existing codebase has 150 tasks (90.7% complete)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Feature Alignment | Status |
|-----------|-------------|-------------------|--------|
| **I. User-First Design** | Features map to user stories with clear acceptance criteria | 4 user stories defined with 13 acceptance scenarios | ✅ PASS |
| **II. Performance at Scale** | Maintain responsiveness as data grows | Email sending async, client-side list filtering for invitations | ✅ PASS |
| **III. Mobile-First Responsive** | Support 375px width, touch-optimized | Invite UI in existing member section, uses established responsive patterns | ✅ PASS |
| **IV. Data Portability** | Users can export data | No new exportable data; invitations are transient | N/A |
| **Usability Standards** | 90% first-attempt success, <30s task completion | Email invite = enter address + select role + send | ✅ PASS |
| **Data Integrity** | Validate before save, confirm deletion | Token validation, expiration checks, cancel confirmation | ✅ PASS |

**Gate Result**: ✅ PASS - No violations requiring justification

## Project Structure

### Documentation (this feature)

```
specs/002-email-timeline-invites/
├── plan.md              # This file
├── research.md          # Phase 0 output - email service selection, token security
├── data-model.md        # Phase 1 output - invitation entity schema
├── quickstart.md        # Phase 1 output - development setup for email testing
├── contracts/           # Phase 1 output - API endpoint specs
│   └── invitations-api.yaml
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── api/
│   │   └── invitations.ts       # New - invitation CRUD endpoints
│   ├── services/
│   │   ├── InvitationService.ts # New - invitation business logic
│   │   └── EmailService.ts      # New - email sending abstraction
│   ├── middleware/
│   │   └── (token validation handled in InvitationService)
│   ├── schemas/
│   │   └── invitation.ts        # New - Zod validation schemas
│   ├── types/
│   │   └── invitation.ts        # New - invitation type definitions
│   └── db/
│       └── migrations/
│           └── 004_invitations.sql  # New - invitations table
└── tests/
    ├── unit/
    │   └── InvitationService.test.ts
    └── integration/
        └── invitations.test.ts

frontend/
├── src/
│   ├── components/
│   │   └── invitations/
│   │       ├── InviteByEmailForm.tsx    # New - email input + role select
│   │       ├── PendingInvitesList.tsx   # New - list of pending invites
│   │       └── InviteAcceptPage.tsx     # New - invitation landing page + registration form
│   ├── hooks/
│   │   └── useInvitations.ts            # New - React Query hooks
│   ├── services/
│   │   └── invitationsApi.ts            # New - API client functions
│   └── (route defined in existing router, renders InviteAcceptPage)
└── tests/
    └── e2e/
        └── invitations.spec.ts          # New - Playwright tests
```

**Structure Decision**: Extends existing web application structure. New `invitations` module follows established patterns in `api/`, `services/`, and `components/` directories. Uses existing `timeline_members` table for final membership, new `timeline_invitations` table for pending invites.

## Complexity Tracking

*No Constitution Check violations requiring justification.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |
