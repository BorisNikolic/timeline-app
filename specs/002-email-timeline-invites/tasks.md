# Tasks: Email Timeline Invites

**Input**: Design documents from `/specs/002-email-timeline-invites/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/invitations-api.yaml

**Tests**: No tests explicitly requested in feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and database schema

- [x] T001 Add nodemailer dependency to backend/package.json
- [x] T002 Add @types/nodemailer dev dependency to backend/package.json
- [x] T003 [P] Add SMTP environment variables to backend/.env.example (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE, FRONTEND_URL)
- [x] T004 [P] Create database migration in backend/src/db/migrations/004_invitations.sql (invitation_status enum, timeline_invitations table, indexes, constraints)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create invitation types in backend/src/types/invitation.ts (InvitationStatus, TimelineInvitation, TimelineInvitationPublic, InvitationValidation)
- [x] T006 [P] Create Zod validation schemas in backend/src/schemas/invitation.ts (createInvitationSchema, acceptNewUserSchema)
- [x] T007 [P] Create EmailService in backend/src/services/EmailService.ts (Nodemailer setup, sendInvitation method, dev/prod config)
- [x] T008 Create InvitationService skeleton in backend/src/services/InvitationService.ts (class structure, dependency injection for EmailService)
- [x] T009 Create invitations API router in backend/src/api/invitations.ts (route structure, auth middleware setup)
- [x] T010 Register invitations router in backend/src/index.ts or app.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Send Email Invitation to New User (Priority: P1) 🎯 MVP

**Goal**: Timeline admin invites new user via email → user registers via link → auto-added to timeline

**Independent Test**: Send invite to new email, click link, complete registration, verify user sees timeline with correct role

### Implementation for User Story 1

- [x] T011 [US1] Implement token generation in InvitationService (crypto.randomBytes(32), base64url encoding) in backend/src/services/InvitationService.ts
- [x] T011a [US1] Verify token security: confirm 256-bit entropy, no token logging, bcrypt cost factor ≥10 in backend/src/services/InvitationService.ts
- [x] T012 [US1] Implement InvitationService.create() method in backend/src/services/InvitationService.ts (create invitation record, bcrypt hash token, set 7-day expiration, targetUserId=null for new users)
- [x] T013 [US1] Implement email template (plain text + HTML) in backend/src/services/EmailService.ts (inviter name, timeline name, role, link)
- [x] T014 [US1] Implement POST /api/timelines/:timelineId/invitations endpoint in backend/src/api/invitations.ts (admin role check, Zod validation, call InvitationService.create, send email)
- [x] T015 [US1] Implement InvitationService.validateToken() method in backend/src/services/InvitationService.ts (lookup by invitation id, bcrypt compare, check expiration, check status)
- [x] T016 [US1] Implement GET /api/invitations/validate/:token endpoint in backend/src/api/invitations.ts (parse token, validate, return invitation details including isExistingUser)
- [x] T017 [US1] Implement InvitationService.acceptNewUser() method in backend/src/services/InvitationService.ts (transaction: create user, update invitation status, create timeline_members record, return user + jwt)
- [x] T018 [US1] Implement POST /api/invitations/accept/:token endpoint for new users in backend/src/api/invitations.ts (Zod validation for name/password, call acceptNewUser, return user and token)
- [x] T019 [P] [US1] Create frontend invitation types in frontend/src/types/invitation.ts (InvitationValidation, AcceptNewUserRequest, AcceptInvitationResponse)
- [x] T020 [P] [US1] Create invitations API client in frontend/src/services/invitationsApi.ts (validateToken, acceptInvitationNewUser)
- [x] T021 [US1] Create InviteByEmailForm component in frontend/src/components/invitations/InviteByEmailForm.tsx (email input, role select dropdown, submit button, loading state, error display)
- [x] T022 [US1] Create useInvitations hook in frontend/src/hooks/useInvitations.ts (React Query mutations for createInvitation)
- [x] T023 [US1] Integrate InviteByEmailForm into timeline members section (existing members UI location)
- [x] T024 [US1] Create InviteAcceptPage component in frontend/src/components/invitations/InviteAcceptPage.tsx (validate token on mount, show registration form for new users, pre-fill email)
- [x] T025 [US1] Add /invite/:token route in frontend router (React Router, renders InviteAcceptPage)
- [x] T026 [US1] Implement registration form within InviteAcceptPage (name, password, confirm password inputs with match validation, submit to accept endpoint, handle success with login + redirect)
- [x] T027 [US1] Handle expired/invalid invitation error states in InviteAcceptPage (clear error messages, contact admin suggestion)

**Checkpoint**: New user invitation flow fully functional - admin can invite, new user can register and access timeline

---

## Phase 4: User Story 3 - Timeline Visibility Based on Membership (Priority: P1)

**Goal**: Users only see timelines they own or are members of

**Independent Test**: Create two users with separate timelines, verify neither sees the other's timeline until invited

**Note**: This may already be implemented by existing timeline_members logic. Tasks verify and ensure correct behavior.

### Implementation for User Story 3

- [x] T028 [US3] Verify TimelineService.getAccessible() filters by membership in backend/src/services/TimelineService.ts (confirm existing query uses timeline_members join)
- [x] T029 [US3] Verify new user registration (non-invite) sees empty timeline list (no implicit access to any timelines)
- [x] T030 [US3] Verify removed member no longer sees timeline in list (confirm membership deletion removes access)

**Checkpoint**: Timeline visibility correctly scoped to membership - can test with existing users

---

## Phase 5: User Story 2 - Send Email Invitation to Existing User (Priority: P2)

**Goal**: Timeline admin invites existing user via email → user clicks link while logged in → auto-added to timeline

**Independent Test**: Invite existing user's email, user clicks link while logged in, verify user now has access to timeline

### Implementation for User Story 2

- [x] T031 [US2] Update InvitationService.create() to detect existing user by email (case-insensitive lookup, set targetUserId) in backend/src/services/InvitationService.ts
- [x] T032 [US2] Implement InvitationService.acceptExistingUser() method in backend/src/services/InvitationService.ts (verify email matches, transaction: update invitation status, create timeline_members record)
- [x] T033 [US2] Update POST /api/invitations/accept/:token endpoint for existing users in backend/src/api/invitations.ts (check if authenticated, if existing user and matches email → call acceptExistingUser)
- [x] T034 [US2] Update InviteAcceptPage for existing user flow in frontend/src/components/invitations/InviteAcceptPage.tsx (if isExistingUser and logged in as that user → show "Accept Invitation" button, call accept endpoint)
- [x] T035 [US2] Handle logged-in user with wrong email in InviteAcceptPage (show error message, offer logout button, redirect instruction)
- [x] T036 [US2] Handle not-logged-in existing user in InviteAcceptPage (show login prompt with redirect back to invite page after login)
- [x] T037 [P] [US2] Update invitationsApi.ts with acceptInvitationExistingUser method in frontend/src/services/invitationsApi.ts

**Checkpoint**: Existing user invitation flow fully functional - admin can invite, existing user can accept and access timeline

---

## Phase 6: User Story 4 - Manage Pending Invitations (Priority: P3)

**Goal**: Admins can view, resend, and cancel pending invitations

**Independent Test**: Send invitation, view pending list, resend email, cancel invitation, verify link becomes invalid

### Implementation for User Story 4

- [x] T038 [US4] Implement InvitationService.listPending() method in backend/src/services/InvitationService.ts (query pending invitations for timeline, join inviter name)
- [x] T039 [US4] Implement GET /api/timelines/:timelineId/invitations endpoint in backend/src/api/invitations.ts (admin role check, call listPending)
- [x] T040 [US4] Implement InvitationService.resend() method in backend/src/services/InvitationService.ts (lookup invitation, verify pending, call EmailService.sendInvitation)
- [x] T041 [US4] Implement POST /api/timelines/:timelineId/invitations/:invitationId/resend endpoint in backend/src/api/invitations.ts (admin role check, call resend)
- [x] T042 [US4] Implement InvitationService.cancel() method in backend/src/services/InvitationService.ts (update status to cancelled)
- [x] T043 [US4] Implement DELETE /api/timelines/:timelineId/invitations/:invitationId endpoint in backend/src/api/invitations.ts (admin role check, call cancel)
- [x] T044 [P] [US4] Update invitationsApi.ts with listPendingInvitations, resendInvitation, cancelInvitation methods in frontend/src/services/invitationsApi.ts
- [x] T045 [P] [US4] Update useInvitations hook with queries/mutations for list, resend, cancel in frontend/src/hooks/useInvitations.ts
- [x] T046 [US4] Create PendingInvitesList component in frontend/src/components/invitations/PendingInvitesList.tsx (list view with email, role, sent date, resend button, cancel button with confirmation)
- [x] T047 [US4] Integrate PendingInvitesList into timeline members section (show pending invitations alongside current members)
- [x] T048 [US4] Add optimistic UI updates for cancel and resend operations in PendingInvitesList

**Checkpoint**: Invitation management fully functional - admins can view, resend, and cancel pending invitations

---

## Phase 7: Edge Cases & Polish

**Purpose**: Handle edge cases from spec and cross-cutting concerns

- [x] T049 Handle duplicate invitation (same email, same timeline) - update existing pending invitation and resend in InvitationService.create()
- [x] T049a Verify invitation remains valid after inviter loses admin access (invitation authorized at creation time) - add to manual test checklist in quickstart.md
- [x] T050 Handle email sending failure - return error immediately, don't create pending invitation in InvitationService.create()
- [x] T051 Handle user registering with existing email via invitation flow - detect and redirect to login in InviteAcceptPage
- [x] T052 Add loading states to InviteByEmailForm, InviteAcceptPage, PendingInvitesList components
- [x] T053 Add toast notifications for invitation success/failure/resend/cancel in frontend
- [x] T054 Add mobile-responsive styling to invitation components (375px min width)
- [x] T055 Run quickstart.md validation - test all 4 manual testing workflows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - P1 priority, MVP
- **User Story 3 (Phase 4)**: Depends on Foundational - P1 priority, may be already implemented
- **User Story 2 (Phase 5)**: Depends on Foundational and User Story 1 (shares token validation logic)
- **User Story 4 (Phase 6)**: Depends on Foundational and User Story 1 (requires invitation infrastructure)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Core invitation flow - must complete first
- **User Story 3 (P1)**: Timeline visibility - mostly verification of existing behavior
- **User Story 2 (P2)**: Extends User Story 1 with existing user handling
- **User Story 4 (P3)**: Management UI - requires invitation infrastructure from US1

### Within Each User Story

- Backend before frontend
- Types/schemas before services
- Services before API endpoints
- API endpoints before frontend components
- Core implementation before UI polish

### Parallel Opportunities

- T003, T004: Environment config and migration can run in parallel
- T006, T007: Zod schemas and EmailService can run in parallel
- T019, T020: Frontend types and API client can run in parallel
- T037, T044, T045: Frontend API updates for US2 and US4 can run in parallel (if both phases active)

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch in parallel after T005 completes:
Task: T006 "Create Zod validation schemas in backend/src/schemas/invitation.ts"
Task: T007 "Create EmailService in backend/src/services/EmailService.ts"
```

## Parallel Example: User Story 1 Frontend

```bash
# Launch in parallel:
Task: T019 "Create frontend invitation types in frontend/src/types/invitation.ts"
Task: T020 "Create invitations API client in frontend/src/services/invitationsApi.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (new user invitation flow)
4. Complete Phase 4: User Story 3 (verify timeline visibility)
5. **STOP and VALIDATE**: Test new user can be invited, register, and see timeline
6. Deploy/demo if ready - core value delivered

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Deploy/Demo (MVP!)
3. Add User Story 3 → Verify visibility is correct
4. Add User Story 2 → Test existing user flow → Deploy
5. Add User Story 4 → Test management UI → Deploy
6. Complete Edge Cases & Polish → Final release

---

## Summary

| Category | Count |
|----------|-------|
| **Total Tasks** | 57 |
| **Phase 1: Setup** | 4 |
| **Phase 2: Foundational** | 6 |
| **Phase 3: User Story 1 (P1)** | 18 |
| **Phase 4: User Story 3 (P1)** | 3 |
| **Phase 5: User Story 2 (P2)** | 7 |
| **Phase 6: User Story 4 (P3)** | 11 |
| **Phase 7: Polish** | 8 |
| **Parallel Opportunities** | 12 tasks marked [P] |

### MVP Scope

- **Minimum Viable**: Phases 1-4 (30 tasks)
- **Delivers**: Admin can invite new users via email, users register and access timeline, timeline visibility scoped to membership

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Edge cases from spec.md are addressed in Phase 7
