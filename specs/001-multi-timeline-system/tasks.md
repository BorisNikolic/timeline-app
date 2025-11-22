# Tasks: Multi-Timeline System

**Input**: Design documents from `/specs/001-multi-timeline-system/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - test tasks omitted. Add manually if needed.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and new type definitions

- [X] T001 Create database migration file `backend/src/db/migrations/003_multi_timeline.sql` with schema from data-model.md
- [X] T002 Run database migration and verify default timeline created with `bun run db:migrate`
- [X] T003 [P] Create TypeScript types file `backend/src/types/timeline.ts` with Timeline, TimelineMember, MemberRole, TimelineStatus, OutcomeTag interfaces
- [X] T004 [P] Create TypeScript types file `frontend/src/types/timeline.ts` mirroring backend types

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create TimelineService base class in `backend/src/services/TimelineService.ts` with verifyAccess(), mapRow() methods
- [X] T006 Create timeline authorization middleware in `backend/src/middleware/timelineAuth.ts` with requireTimelineRole() function
- [X] T007 [P] Create MemberService base class in `backend/src/services/MemberService.ts` with getMembership() method
- [X] T008 [P] Create Zod validation schemas in `backend/src/schemas/timeline.ts` for createTimeline, updateTimeline, copyTimeline
- [X] T009 [P] Create Zod validation schemas in `backend/src/schemas/member.ts` for inviteMember, updateRole
- [X] T010 Create Zustand timeline store in `frontend/src/stores/timelineStore.ts` with currentTimelineId, setCurrentTimeline, clearCurrentTimeline
- [X] T011 [P] Create API client functions in `frontend/src/services/timelinesApi.ts` for timeline CRUD operations
- [X] T012 [P] Extend Express Request type in `backend/src/types/express.d.ts` with timeline and timelineRole properties

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Manage Multiple Timelines (Priority: P1) 🎯 MVP

**Goal**: Enable users to create, edit, and delete separate timelines for different festivals

**Independent Test**: Create 2-3 timelines with different names, date ranges, colors. Verify each timeline shows in list with correct settings.

### Implementation for User Story 1

- [X] T013 [US1] Implement TimelineService.create() in `backend/src/services/TimelineService.ts` - create timeline and assign creator as Admin
- [X] T013.1 [US1] Add timeline name uniqueness validation (per-user) in `backend/src/services/TimelineService.ts` - reject duplicate names for same owner with clear error message (FR-002)
- [X] T014 [US1] Implement TimelineService.getAccessible() in `backend/src/services/TimelineService.ts` - list all timelines user has access to
- [X] T015 [US1] Implement TimelineService.getById() in `backend/src/services/TimelineService.ts` - get single timeline with stats
- [X] T016 [US1] Implement TimelineService.update() in `backend/src/services/TimelineService.ts` - update name, dates, color, status
- [X] T016.1 [US1] Implement optimistic locking in `backend/src/services/TimelineService.ts` update() - compare updatedAt timestamp, return 409 Conflict if stale, notify user to refresh (Edge Case: concurrent edits)
- [X] T017 [US1] Implement TimelineService.delete() in `backend/src/services/TimelineService.ts` - delete timeline and all contents
- [X] T018 [US1] Create timeline routes in `backend/src/api/timelines.ts` - GET/POST /api/timelines, GET/PUT/DELETE /api/timelines/:id
- [X] T019 [US1] Register timeline routes in `backend/src/server.ts`
- [X] T020 [US1] Create useTimelines hook in `frontend/src/hooks/useTimelines.ts` with React Query for list/create/update/delete
- [X] T021 [US1] Create TimelineForm component in `frontend/src/components/shared/TimelineForm.tsx` with name, description, dates, color picker
- [X] T022 [US1] Create CreateTimelineModal component in `frontend/src/components/shared/CreateTimelineModal.tsx`
- [X] T023 [US1] Create TimelineSettingsPage in `frontend/src/pages/TimelineSettingsPage.tsx` for editing timeline settings
- [X] T024 [US1] Add route for timeline settings in `frontend/src/App.tsx` - /timeline/:timelineId/settings
- [X] T025 [US1] Create DeleteTimelineConfirmDialog in `frontend/src/components/shared/DeleteTimelineConfirmDialog.tsx`

**Checkpoint**: User Story 1 complete - users can create, edit, and delete timelines

---

## Phase 4: User Story 2 - Timeline Access Control and Team Collaboration (Priority: P1)

**Goal**: Enable timeline owners to invite team members with Admin/Editor/Viewer roles

**Independent Test**: Create timeline, invite users with different roles, verify each role can only perform permitted actions

### Implementation for User Story 2

- [X] T026 [US2] Implement MemberService.getMembers() in `backend/src/services/MemberService.ts` - list timeline members with user details
- [X] T027 [US2] Implement MemberService.inviteMember() in `backend/src/services/MemberService.ts` - add user with role
- [X] T028 [US2] Implement MemberService.updateRole() in `backend/src/services/MemberService.ts` - change member role with last-admin protection
- [X] T029 [US2] Implement MemberService.removeMember() in `backend/src/services/MemberService.ts` - remove member with last-admin protection
- [X] T030 [US2] Implement MemberService.leaveTimeline() in `backend/src/services/MemberService.ts` - self-removal
- [X] T031 [US2] Implement UserService.search() in `backend/src/services/UserService.ts` - search users for invite autocomplete
- [X] T032 [US2] Create member routes in `backend/src/api/members.ts` - GET/POST /members, PUT/DELETE /members/:userId, POST /leave
- [X] T033 [US2] Create user search route in `backend/src/api/users.ts` - GET /api/users/search
- [X] T034 [US2] Register member routes in `backend/src/api/index.ts`
- [X] T035 [US2] Create useMembers hook in `frontend/src/hooks/useMembers.ts` with React Query
- [X] T036 [US2] Create MemberList component in `frontend/src/components/members/MemberList.tsx` with role badges
- [X] T037 [US2] Create InviteMemberModal component in `frontend/src/components/members/InviteMemberModal.tsx` with user search
- [X] T038 [US2] Create RoleDropdown component in `frontend/src/components/members/RoleDropdown.tsx`
- [X] T039 [US2] Create useTimelineRole hook in `frontend/src/hooks/useTimelineRole.ts` to check current user's permissions
- [X] T040 [US2] Add members section to TimelineSettingsPage in `frontend/src/pages/TimelineSettingsPage.tsx`
- [X] T041 [US2] Add read-only mode UI indicators in `frontend/src/components/shared/ReadOnlyBanner.tsx` for archived timelines

**Checkpoint**: User Story 2 complete - team collaboration with role-based access control works

---

## Phase 5: User Story 3 - Timeline Dashboard Overview (Priority: P2)

**Goal**: Provide dashboard showing all accessible timelines with status and progress

**Independent Test**: Create multiple timelines with different statuses and event counts, verify dashboard displays all metrics correctly

### Implementation for User Story 3

- [X] T042 [US3] Implement DashboardService.getDashboard() in `backend/src/services/DashboardService.ts` with timeline stats
- [X] T043 [US3] Implement DashboardService.getStats() in `backend/src/services/DashboardService.ts` for aggregate statistics
- [X] T044 [US3] Create dashboard routes in `backend/src/api/dashboard.ts` - GET /api/dashboard, GET /api/dashboard/stats
- [X] T045 [US3] Register dashboard routes in `backend/src/api/index.ts`
- [X] T046 [US3] Create useDashboard hook in `frontend/src/hooks/useDashboard.ts` with React Query
- [X] T047 [US3] Create TimelineCard component in `frontend/src/components/dashboard/TimelineCard.tsx` with color indicator, dates, status, completion
- [X] T048 [US3] Create DashboardFilters component in `frontend/src/components/dashboard/DashboardFilters.tsx` for status, year, role filters
- [X] T049 [US3] Create DashboardStats component in `frontend/src/components/dashboard/DashboardStats.tsx` for summary metrics
- [X] T050 [US3] Create TimelineDashboard component in `frontend/src/components/dashboard/TimelineDashboard.tsx` with grouped timelines
- [X] T051 [US3] Create DashboardPage in `frontend/src/pages/DashboardPage.tsx`
- [X] T052 [US3] Add route for dashboard in `frontend/src/App.tsx` - /dashboard
- [X] T053 [US3] Update post-login redirect to dashboard in `frontend/src/pages/Auth.tsx`

**Checkpoint**: User Story 3 complete - dashboard shows all timelines with filtering and stats

---

## Phase 6: User Story 4 - Quick Timeline Switching (Priority: P2)

**Goal**: Add persistent timeline switcher in header for quick navigation

**Independent Test**: Access multiple timelines, use header dropdown to switch, verify UI updates correctly each time

### Implementation for User Story 4

- [X] T054 [US4] Implement PreferencesService.get() in `backend/src/services/PreferencesService.ts` - get user preferences
- [X] T055 [US4] Implement PreferencesService.update() in `backend/src/services/PreferencesService.ts` - update last timeline
- [X] T056 [US4] Create preferences routes in `backend/src/api/preferences.ts` - GET/PUT /api/preferences
- [X] T057 [US4] Register preferences routes in `backend/src/api/index.ts`
- [X] T058 [US4] Create usePreferences hook in `frontend/src/hooks/usePreferences.ts`
- [X] T059 [US4] Create TimelineSwitcher component in `frontend/src/components/shared/TimelineSwitcher.tsx` with dropdown, search, status grouping
- [X] T060 [US4] Add TimelineSwitcher to Layout header in `frontend/src/components/shared/Layout.tsx`
- [X] T061 [US4] Create useCurrentTimeline hook in `frontend/src/hooks/useCurrentTimeline.ts` for accessing timeline context
- [X] T062 [US4] Update timelineStore to sync lastTimelineId to backend on switch in `frontend/src/stores/timelineStore.ts`
- [X] T063 [US4] Add auto-load last timeline on login in `frontend/src/contexts/AuthContext.tsx`

**Checkpoint**: User Story 4 complete - timeline switcher enables quick navigation

---

## Phase 7: User Story 5 - Timeline Lifecycle Management (Priority: P2)

**Goal**: Support timeline status transitions (Planning -> Active -> Completed -> Archived)

**Independent Test**: Transition timeline through all states, verify appropriate behaviors and restrictions at each stage

### Implementation for User Story 5

- [X] T064 [US5] Add status transition validation in `backend/src/services/TimelineService.ts` - enforce allowed transitions
- [X] T065 [US5] Update requireTimelineRole middleware for archived read-only in `backend/src/middleware/timelineAuth.ts`
- [X] T066 [US5] Implement TimelineService.unarchive() in `backend/src/services/TimelineService.ts` - return to Completed status
- [X] T067 [US5] Create StatusTransitionDropdown component in `frontend/src/components/timeline/StatusTransitionDropdown.tsx`
- [X] T068 [US5] Add status management UI to TimelineSettingsPage in `frontend/src/pages/TimelineSettingsPage.tsx`
- [X] T069 [US5] Create UnarchiveButton component in `frontend/src/components/timeline/UnarchiveButton.tsx` for Admin-only action

**Checkpoint**: User Story 5 complete - lifecycle management with appropriate restrictions

---

## Phase 8: User Story 6 - Copy Timeline with Date Shifting (Priority: P3)

**Goal**: Enable copying timelines with automatic date recalculation for next year's festival

**Independent Test**: Copy timeline with 10+ events, specify new dates, verify all events appear with correctly shifted dates

### Implementation for User Story 6

- [X] T070 [US6] Implement TimelineService.copy() in `backend/src/services/TimelineService.ts` with date shifting algorithm
- [X] T070.1 [US6] Add batch processing with progress indicator in `backend/src/services/TimelineService.ts` copy() - process events in batches of 50
- [X] T071 [US6] Create date shifting utility in `backend/src/utils/dateShift.ts` using date-fns for day offset calculation
- [X] T072 [US6] Add copy route in `backend/src/api/timelines.ts` - POST /api/timelines/:id/copy
- [X] T073 [US6] Create CopyTimelineModal component in `frontend/src/components/shared/CopyTimelineModal.tsx`
- [ ] T073.1 [US6] Create CopyProgressIndicator component in `frontend/src/components/shared/CopyProgressIndicator.tsx` - show batch progress for large copies (deferred - optional for 500+ events)
- [X] T074 [US6] Create CopyTimelineForm component in `frontend/src/components/shared/CopyTimelineForm.tsx` with options checkboxes
- [X] T075 [US6] Add copy button to TimelineCard and TimelineSettingsPage in `frontend/src/components/dashboard/TimelineCard.tsx`

**Checkpoint**: User Story 6 complete - timeline copy with date shifting works

---

## Phase 9: User Story 7 - Timeline Templates (Priority: P3)

**Goal**: Allow marking timelines as templates visible to all users for new timeline creation

**Independent Test**: Mark timeline as template, verify it appears in template section during new timeline creation

### Implementation for User Story 7

- [X] T076 [US7] Implement TimelineService.setTemplate() in `backend/src/services/TimelineService.ts`
- [X] T077 [US7] Implement TimelineService.getTemplates() in `backend/src/services/TimelineService.ts` - list all templates
- [X] T078 [US7] Add template routes in `backend/src/api/timelines.ts` - POST /api/timelines/:id/set-template, GET /api/templates
- [X] T079 [US7] Create useTemplates hook in `frontend/src/hooks/useTimelines.ts` (combined with timeline hooks)
- [X] T080 [US7] Create TemplateSelector component in `frontend/src/components/shared/TemplateSelector.tsx` for new timeline dialog
- [X] T081 [US7] Add template toggle to TimelineSettingsPage in `frontend/src/pages/TimelineSettingsPage.tsx`
- [X] T082 [US7] Update CreateTimelineModal to show template selection in `frontend/src/components/shared/CreateTimelineModal.tsx`

**Checkpoint**: User Story 7 complete - templates enable quick timeline creation

---

## Phase 10: User Story 8 - Post-Festival Retrospective (Priority: P3)

**Goal**: Enable retrospective notes and outcome tags on events for completed timelines

**Independent Test**: Mark timeline Completed, add notes and outcome tags to events, verify they display correctly

### Implementation for User Story 8

- [X] T083 [US8] Update EventService to validate retroNotes/outcomeTag only editable on Completed/Archived timelines in `backend/src/services/EventService.ts`
- [X] T084 [US8] Add outcomeTag filter to EventService.getByTimeline() in `backend/src/services/EventService.ts`
- [X] T085 [US8] Create OutcomeTagBadge component in `frontend/src/components/shared/OutcomeTagBadge.tsx` with color coding
- [X] T086 [US8] Create RetroNotesField component in `frontend/src/components/events/RetroNotesField.tsx`
- [X] T087 [US8] Create OutcomeTagSelector component in `frontend/src/components/events/OutcomeTagSelector.tsx`
- [X] T088 [US8] Update EventForm to show retro fields when timeline is Completed/Archived in `frontend/src/components/events/EventForm.tsx`
- [X] T089 [US8] Update EventCard to show outcomeTag badge and retroNotes hover preview in `frontend/src/components/events/EventCard.tsx`
- [X] T090 [US8] Add outcome tag filter to event list filters in `frontend/src/components/events/EventList.tsx`

**Checkpoint**: User Story 8 complete - retrospective features enable learning from past festivals

---

## Phase 11: User Story 9 - Archive Management (Priority: P3)

**Goal**: Provide separate archive section for past timelines to reduce clutter

**Independent Test**: Archive timelines, navigate to archive view, search/filter within archives, unarchive a timeline

### Implementation for User Story 9

- [X] T091 [US9] Implement DashboardService.getArchive() in `backend/src/services/DashboardService.ts` with pagination
- [X] T092 [US9] Add archive route in `backend/src/api/dashboard.ts` - GET /api/archive
- [X] T093 [US9] Create ArchivePage in `frontend/src/pages/ArchivePage.tsx` with search and year filter
- [X] T094 [US9] Create ArchiveList component in `frontend/src/components/archive/ArchiveList.tsx`
- [X] T095 [US9] Add route for archive in `frontend/src/App.tsx` - /archive
- [X] T096 [US9] Add "View Archive" link to TimelineDashboard in `frontend/src/components/dashboard/TimelineDashboard.tsx`
- [X] T097 [US9] Update TimelineSwitcher to exclude archived timelines in `frontend/src/components/shared/TimelineSwitcher.tsx`

**Checkpoint**: User Story 9 complete - archive management keeps active work uncluttered

---

## Phase 12: Data Scoping (Cross-Cutting - Required for Full Function)

**Purpose**: Update existing event/category endpoints to work with timeline scoping

- [X] T098 Update EventService.getByTimeline() to require timelineId in `backend/src/services/EventService.ts`
- [X] T099 Update EventService.create() to require timelineId in `backend/src/services/EventService.ts`
- [X] T100 Update CategoryService.getByTimeline() to require timelineId in `backend/src/services/CategoryService.ts`
- [X] T101 Update CategoryService.create() to require timelineId in `backend/src/services/CategoryService.ts`
- [X] T102 Create timeline-scoped event routes in `backend/src/api/timelines.ts` - /api/timelines/:timelineId/events
- [X] T103 Create timeline-scoped category routes in `backend/src/api/timelines.ts` - /api/timelines/:timelineId/categories
- [X] T104 Update frontend eventsApi to use timeline-scoped endpoints in `frontend/src/services/api-client.ts`
- [X] T105 Update frontend categoriesApi to use timeline-scoped endpoints in `frontend/src/services/api-client.ts`
- [X] T106 Update useEvents hook to include timelineId in query key in `frontend/src/hooks/useEvents.ts`
- [X] T107 Update useCategories hook to include timelineId in query key in `frontend/src/hooks/useCategories.ts`
- [X] T108 Update existing export endpoints to be timeline-scoped in `backend/src/api/timelines.ts`

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T109 [P] Add color palette constants in `frontend/src/constants/themeColors.ts` - 8 predefined timeline colors
- [X] T110 [P] Create ColorPicker component in `frontend/src/components/shared/ColorPicker.tsx`
- [X] T111 Add timeline theme color to header accent in `frontend/src/components/shared/Layout.tsx`
- [X] T112 [P] Add error boundaries and loading states to all new pages
- [X] T113 Update navigation structure in `frontend/src/components/shared/Layout.tsx` - Dashboard link already in header
- [X] T114 Add mobile-responsive styles to dashboard and switcher in `frontend/src/styles/responsive.css`
- [X] T115 [P] Clear timeline preference when user loses access in `backend/src/services/MemberService.ts` (calls PreferencesService)
- [X] T116 Run quickstart.md validation - verify all manual testing scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Data Scoping (Phase 12)**: Can start after Phase 2, should complete before testing US1
- **Polish (Phase 13)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Independent of US1
- **User Story 3 (P2)**: Can start after Foundational - Independent, but benefits from US1/US2 data
- **User Story 4 (P2)**: Can start after Foundational - Requires timelines to exist (US1)
- **User Story 5 (P2)**: Can start after Foundational - Extends US1 timeline functionality
- **User Story 6 (P3)**: Can start after Foundational - Requires US1 timeline to copy
- **User Story 7 (P3)**: Can start after Foundational - Extends US1/US6 functionality
- **User Story 8 (P3)**: Requires US5 lifecycle states implemented
- **User Story 9 (P3)**: Requires US5 archived status implemented

### Within Each User Story

- Services before routes
- Routes registered before frontend hooks
- Hooks before components
- Components before pages

### Parallel Opportunities

- Setup T003 and T004 can run in parallel (different projects)
- Foundational T007, T008, T009, T011, T012 can run in parallel
- US1 and US2 can be worked on simultaneously after Foundational
- Phase 12 Data Scoping can start alongside US1

---

## Parallel Example: User Story 1 & 2 Concurrent

```bash
# Developer A: User Story 1 (Timelines)
T013 → T014 → T015 → T016 → T017 → T018 → T019 (backend)
T020 → T021 → T022 → T023 → T024 → T025 (frontend)

# Developer B: User Story 2 (Members) - runs in parallel
T026 → T027 → T028 → T029 → T030 → T031 → T032 → T033 → T034 (backend)
T035 → T036 → T037 → T038 → T039 → T040 → T041 (frontend)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (database migration)
2. Complete Phase 2: Foundational (services, middleware, stores)
3. Complete Phase 12: Data Scoping (required for events/categories to work)
4. Complete Phase 3: User Story 1 (create/manage timelines)
5. Complete Phase 4: User Story 2 (access control)
6. **STOP and VALIDATE**: Test core functionality independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational + Data Scoping → Foundation ready
2. Add User Story 1 + 2 → Test → Deploy/Demo (MVP!)
3. Add User Story 3 + 4 → Test → Deploy/Demo (Dashboard + Switcher)
4. Add User Story 5 → Test → Deploy/Demo (Lifecycle)
5. Add User Story 6 + 7 → Test → Deploy/Demo (Copy/Templates)
6. Add User Story 8 + 9 → Test → Deploy/Demo (Retrospective + Archive)
7. Polish phase completes the feature

### Parallel Team Strategy

With two developers:

1. Both complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1, then 3, then 6, then 8
   - Developer B: User Story 2, then 4, then 5, then 7, then 9
3. Both: Data Scoping tasks can be split
4. Both: Polish phase

---

## Summary

| Phase | Tasks | Parallelizable |
|-------|-------|----------------|
| Phase 1: Setup | 4 | 2 |
| Phase 2: Foundational | 8 | 5 |
| Phase 3: US1 - Timelines | 15 | 0 |
| Phase 4: US2 - Access Control | 16 | 0 |
| Phase 5: US3 - Dashboard | 12 | 0 |
| Phase 6: US4 - Switcher | 10 | 0 |
| Phase 7: US5 - Lifecycle | 6 | 0 |
| Phase 8: US6 - Copy | 8 | 0 |
| Phase 9: US7 - Templates | 7 | 0 |
| Phase 10: US8 - Retrospective | 8 | 0 |
| Phase 11: US9 - Archive | 7 | 0 |
| Phase 12: Data Scoping | 11 | 0 |
| Phase 13: Polish | 8 | 4 |
| **TOTAL** | **120** | **11** |

**Suggested MVP Scope**: Phase 1-4 + Phase 12 = Setup + Foundational + US1 + US2 + Data Scoping (54 tasks)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
