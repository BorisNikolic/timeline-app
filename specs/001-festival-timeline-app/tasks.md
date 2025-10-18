# Tasks: Festival Timeline Management App (Simplified)

**Input**: Design documents from `/specs/001-festival-timeline-app/`
**Prerequisites**: plan.md, spec.md, data-model.md

**Tests**: NOT explicitly requested in specification - focusing on implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure with backend/ and frontend/ directories
- [X] T002 Initialize backend Node.js project with TypeScript and Express.js dependencies in backend/package.json
- [X] T003 Initialize frontend React project with Vite, TypeScript, and TailwindCSS dependencies in frontend/package.json
- [X] T004 [P] Configure TypeScript for backend in backend/tsconfig.json
- [X] T005 [P] Configure TypeScript for frontend in frontend/tsconfig.json
- [X] T006 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.js and backend/.prettierrc
- [X] T007 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.js and frontend/.prettierrc
- [X] T008 [P] Configure TailwindCSS in frontend/tailwind.config.js
- [X] T009 [P] Setup environment configuration with backend/.env.example and frontend/.env.example
- [X] T010 [P] Create .gitignore for Node.js, TypeScript, and environment files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [X] T011 Create PostgreSQL database schema with enums (event_status, event_priority) in backend/src/db/migrations/001_initial_schema.sql
- [X] T012 Create users table (email/password only) in backend/src/db/migrations/001_initial_schema.sql
- [X] T013 Create categories table with color validation in backend/src/db/migrations/001_initial_schema.sql
- [X] T014 Create events table with foreign keys and indexes in backend/src/db/migrations/001_initial_schema.sql
- [X] T015 Create database seed data with admin user and default categories in backend/src/db/seeds/001_initial_data.sql
- [X] T016 Setup database connection pool with pg driver in backend/src/db/connection.ts
- [X] T017 Create database migration runner utility in backend/src/db/migrate.ts

### Authentication Foundation

- [X] T018 [P] Implement bcrypt password hashing utility in backend/src/auth/password.ts
- [X] T019 [P] Implement JWT token generation and validation in backend/src/auth/jwt.ts
- [X] T020 [P] Configure Passport.js with local strategy in backend/src/auth/passport-local.ts
- [X] T021 Create authentication middleware for route protection in backend/src/middleware/auth.ts

### API Foundation

- [X] T022 [P] Create Express app with CORS and body parsing middleware in backend/src/app.ts
- [X] T023 [P] Create global error handling middleware in backend/src/middleware/error-handler.ts
- [X] T024 [P] Create request validation middleware with Zod in backend/src/middleware/validate.ts
- [X] T025 [P] Setup API router structure in backend/src/api/index.ts
- [X] T026 [P] Configure Swagger/OpenAPI documentation in backend/src/api/swagger.ts
- [X] T027 Create server entry point in backend/src/server.ts

### Frontend Foundation

- [X] T028 [P] Create frontend app entry point with React Router in frontend/src/main.tsx
- [X] T029 [P] Setup Zustand store for global state in frontend/src/store/index.ts
- [X] T030 [P] Create API client with axios and JWT interceptor in frontend/src/services/api-client.ts
- [X] T031 [P] Create authentication context provider in frontend/src/contexts/AuthContext.tsx
- [X] T032 [P] Setup React Router with protected routes in frontend/src/App.tsx
- [X] T033 [P] Create base layout component in frontend/src/components/shared/Layout.tsx
- [X] T034 [P] Configure TailwindCSS responsive breakpoints for 375px minimum width in frontend/tailwind.config.js
- [X] T035 [P] Create responsive utility mixins and mobile-first base styles in frontend/src/styles/responsive.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel. Mobile-responsive infrastructure (375px+ constitutional requirement) is in place.

---

## Phase 3: User Story 1 - Quick Event Creation (Priority: P1) 🎯 MVP

**Goal**: Enable users to quickly add events to the timeline with basic details (title, date, description)

**Independent Test**: Click "Add Event", fill in title, date, and description, click "Save", and verify the event appears on the timeline

### Backend for User Story 1

- [X] T036 [P] [US1] Create Event TypeScript interface in backend/src/models/Event.ts
- [X] T037 [P] [US1] Create Category TypeScript interface in backend/src/models/Category.ts
- [X] T038 [US1] Create EventService with createEvent method in backend/src/services/EventService.ts
- [X] T039 [US1] Implement POST /api/events endpoint in backend/src/api/events.ts
- [X] T040 [US1] Implement GET /api/events endpoint with date range filtering in backend/src/api/events.ts
- [X] T041 [US1] Implement GET /api/events/:id endpoint in backend/src/api/events.ts
- [X] T042 [US1] Add input validation for event creation in backend/src/api/events.ts

### Frontend for User Story 1

- [X] T043 [P] [US1] Create Event TypeScript interface in frontend/src/types/Event.ts
- [X] T044 [P] [US1] Create event store slice with Zustand in frontend/src/store/events.ts
- [X] T045 [P] [US1] Create EventForm component with title, date, description fields in frontend/src/components/events/EventForm.tsx
- [X] T046 [P] [US1] Create EventModal component wrapping EventForm in frontend/src/components/events/EventModal.tsx
- [X] T047 [P] [US1] Create basic Timeline component structure in frontend/src/components/timeline/Timeline.tsx
- [X] T048 [P] [US1] Create EventCard component for timeline display in frontend/src/components/timeline/EventCard.tsx
- [X] T049 [US1] Create useEvents hook for fetching and managing events in frontend/src/hooks/useEvents.ts
- [X] T050 [US1] Implement event creation API call in frontend/src/services/api-client.ts
- [X] T051 [US1] Connect EventModal to create event action in frontend/src/components/events/EventModal.tsx
- [X] T052 [US1] Create Timeline page with "Add Event" button in frontend/src/pages/Timeline.tsx
- [X] T053 [US1] Implement virtual scrolling with react-window for 200+ event performance in frontend/src/components/timeline/Timeline.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can add events and see them on the timeline with virtual scrolling for performance (constitutional requirement SC-004: <2s load with 200+ events)

---

## Phase 4: User Story 2 - Event Organization by Category (Priority: P1)

**Goal**: Display events grouped by category in separate horizontal lanes on the timeline

**Independent Test**: Add events with different categories and verify they appear in separate category lanes

### Backend for User Story 2

- [X] T054 [P] [US2] Create CategoryService with getAllCategories and createCategory methods in backend/src/services/CategoryService.ts
- [X] T055 [US2] Implement GET /api/categories endpoint in backend/src/api/categories.ts
- [X] T056 [US2] Implement POST /api/categories endpoint in backend/src/api/categories.ts
- [X] T057 [US2] Implement PUT /api/categories/:id endpoint in backend/src/api/categories.ts
- [X] T058 [US2] Implement DELETE /api/categories/:id endpoint in backend/src/api/categories.ts
- [X] T059 [US2] Add input validation for category creation in backend/src/api/categories.ts
- [X] T060 [US2] Enhance GET /api/events to include category details in backend/src/api/events.ts

### Frontend for User Story 2

- [X] T061 [P] [US2] Create Category TypeScript interface in frontend/src/types/Category.ts
- [X] T062 [P] [US2] Create category store slice with Zustand in frontend/src/store/categories.ts
- [X] T063 [P] [US2] Create CategoryForm component in frontend/src/components/categories/CategoryForm.tsx
- [X] T064 [P] [US2] Create CategoryLane component for timeline in frontend/src/components/timeline/CategoryLane.tsx
- [X] T065 [US2] Create useCategories hook for fetching categories in frontend/src/hooks/useCategories.ts
- [X] T066 [US2] Update EventForm to include category dropdown in frontend/src/components/events/EventForm.tsx
- [X] T067 [US2] Update Timeline component to render CategoryLane components in frontend/src/components/timeline/Timeline.tsx
- [X] T068 [US2] Implement category CRUD API calls in frontend/src/services/api-client.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - events appear in category-based lanes

---

## Phase 5: User Story 3 - Team Assignment and Accountability (Priority: P2)

**Goal**: Enable users to assign team members to specific events

**Independent Test**: Assign a person to an event and view that assignment in the event details

### Backend for User Story 3

- [X] T069 [US3] Update EventService to support assignedPerson field in backend/src/services/EventService.ts
- [X] T070 [US3] Add assignedPerson to event creation validation in backend/src/api/events.ts

### Frontend for User Story 3

- [X] T071 [P] [US3] Add assignedPerson field to EventForm component in frontend/src/components/events/EventForm.tsx
- [X] T072 [P] [US3] Display assigned person in EventCard component in frontend/src/components/timeline/EventCard.tsx
- [X] T073 [US3] Create EventDetailView component showing all event fields in frontend/src/components/events/EventDetailView.tsx
- [X] T074 [US3] Add event detail modal to Timeline page in frontend/src/pages/Timeline.tsx

**Checkpoint**: Users can now assign team members to events and see assignments

---

## Phase 6: User Story 4 - Event Status and Priority Tracking (Priority: P2)

**Goal**: Enable users to track event status (Not Started, In Progress, Completed) and priority (High, Medium, Low)

**Independent Test**: Set status and priority on events and verify visual indicators appear correctly

### Backend for User Story 4

- [X] T075 [P] [US4] Add status enum (Not Started, In Progress, Completed) and priority enum (High, Medium, Low) to Event interface in backend/src/models/Event.ts
- [X] T076 [US4] Update EventService to validate status and priority in backend/src/services/EventService.ts
- [X] T077 [US4] Add status and priority to event validation in backend/src/api/events.ts

### Frontend for User Story 4

- [X] T078 [P] [US4] Add status enum (Not Started, In Progress, Completed) to Event interface in frontend/src/types/Event.ts
- [X] T079 [P] [US4] Add priority enum (High, Medium, Low) to Event interface in frontend/src/types/Event.ts
- [X] T080 [P] [US4] Create StatusBadge component with color coding for all 3 statuses in frontend/src/components/shared/StatusBadge.tsx
- [X] T081 [P] [US4] Create PriorityBadge component with color coding in frontend/src/components/shared/PriorityBadge.tsx
- [X] T082 [US4] Add status and priority dropdowns to EventForm in frontend/src/components/events/EventForm.tsx
- [X] T083 [US4] Display status and priority badges in EventCard in frontend/src/components/timeline/EventCard.tsx
- [X] T084 [US4] Update EventDetailView to show status and priority in frontend/src/components/events/EventDetailView.tsx

**Checkpoint**: Events now have status and priority tracking with visual indicators

---

## Phase 7: User Story 5 - Event Editing and Deletion (Priority: P2)

**Goal**: Enable users to edit or delete events as plans change

**Independent Test**: Edit an event's details and verify changes are saved; delete an event and verify it's removed

### Backend for User Story 5

- [X] T085 [US5] Implement updateEvent method in EventService with optimistic locking in backend/src/services/EventService.ts
- [X] T086 [US5] Implement deleteEvent method in EventService in backend/src/services/EventService.ts
- [X] T087 [US5] Implement PUT /api/events/:id endpoint in backend/src/api/events.ts
- [X] T088 [US5] Implement DELETE /api/events/:id endpoint in backend/src/api/events.ts

### Frontend for User Story 5

- [X] T089 [P] [US5] Add edit mode to EventModal component in frontend/src/components/events/EventModal.tsx
- [X] T090 [P] [US5] Create DeleteConfirmDialog component in frontend/src/components/shared/DeleteConfirmDialog.tsx
- [X] T091 [US5] Implement event update API call in frontend/src/services/api-client.ts
- [X] T092 [US5] Implement event delete API call in frontend/src/services/api-client.ts
- [X] T093 [US5] Add Edit and Delete buttons to EventDetailView in frontend/src/components/events/EventDetailView.tsx
- [X] T094 [US5] Update event store to handle update and delete actions in frontend/src/store/events.ts

**Checkpoint**: Users can now edit and delete events

---

## Phase 8: User Story 6 - Event List View with Sorting (Priority: P2)

**Goal**: Provide a list view of all events below the timeline with sorting by date, urgency, and priority

**Independent Test**: View the event list and change sort order (by date, by urgency, by priority)

### Backend for User Story 6

- [X] T095 [US6] Add sorting parameters to GET /api/events endpoint in backend/src/api/events.ts
- [X] T096 [US6] Implement sort by date query in EventService in backend/src/services/EventService.ts
- [X] T097 [US6] Implement sort by urgency (date proximity) query in EventService in backend/src/services/EventService.ts
- [X] T098 [US6] Implement sort by priority query in EventService in backend/src/services/EventService.ts
- [X] T099 [US6] Add filtering parameters to GET /api/events endpoint in backend/src/api/events.ts
- [X] T100 [US6] Implement filter by status query in EventService in backend/src/services/EventService.ts
- [X] T101 [US6] Implement filter by priority query in EventService in backend/src/services/EventService.ts
- [X] T102 [US6] Implement filter by category query in EventService in backend/src/services/EventService.ts
- [X] T103 [US6] Implement filter by assigned person query in EventService in backend/src/services/EventService.ts

### Frontend for User Story 6

- [X] T104 [P] [US6] Create EventList component in frontend/src/components/events/EventList.tsx
- [X] T105 [P] [US6] Create EventListItem component in frontend/src/components/events/EventListItem.tsx
- [X] T106 [P] [US6] Create SortDropdown component in frontend/src/components/shared/SortDropdown.tsx
- [X] T107 [P] [US6] Create FilterPanel component with multi-select checkboxes in frontend/src/components/shared/FilterPanel.tsx
- [X] T108 [US6] Add sorting logic to useEvents hook in frontend/src/hooks/useEvents.ts
- [X] T109 [US6] Add filtering logic to useEvents hook in frontend/src/hooks/useEvents.ts
- [X] T110 [US6] Integrate EventList below Timeline in frontend/src/pages/Timeline.tsx
- [X] T111 [US6] Add click handler to EventListItem to open detail modal in frontend/src/components/events/EventListItem.tsx

**Checkpoint**: Users can view, sort, and filter events in list format (FR-008 and FR-009 compliance)

---

## Phase 9: User Story 7 - Data Export (Priority: P3)

**Goal**: Enable users to export the event list to CSV or Excel format for analysis

**Independent Test**: Click "Export to Spreadsheet" and verify a CSV/Excel file with all event data

### Backend for User Story 7

- [X] T112 [P] [US7] Install papaparse and exceljs in backend/package.json
- [X] T113 [P] [US7] Create CSV export service in backend/src/utils/export/csv-generator.ts
- [X] T114 [P] [US7] Create Excel export service in backend/src/utils/export/excel-generator.ts
- [X] T115 [US7] Implement GET /api/export/events-csv endpoint in backend/src/api/export.ts
- [X] T116 [US7] Implement GET /api/export/events-excel endpoint in backend/src/api/export.ts

### Frontend for User Story 7

- [X] T117 [P] [US7] Create ExportMenu component in frontend/src/components/export/ExportMenu.tsx
- [X] T118 [US7] Add CSV export option to ExportMenu in frontend/src/components/export/ExportMenu.tsx
- [X] T119 [US7] Add Excel export option to ExportMenu in frontend/src/components/export/ExportMenu.tsx
- [X] T120 [US7] Implement CSV export API call in frontend/src/services/api-client.ts
- [X] T121 [US7] Implement Excel export API call in frontend/src/services/api-client.ts
- [X] T122 [US7] Add ExportMenu button to Timeline page in frontend/src/pages/Timeline.tsx

**Checkpoint**: All 7 user stories are now complete - full feature set delivered

---

## Phase 10: Authentication Implementation

**Goal**: Enable user registration and login with email/password

**Note**: Auth foundation was set up in Phase 2; this phase implements the user-facing features

### Backend for Authentication

- [X] T123 [P] [AUTH] Create User TypeScript interface in backend/src/models/User.ts
- [X] T124 [P] [AUTH] Create UserService with register and login methods in backend/src/services/UserService.ts
- [X] T125 [AUTH] Implement POST /api/auth/register endpoint in backend/src/api/auth.ts
- [X] T126 [AUTH] Implement POST /api/auth/login endpoint in backend/src/api/auth.ts
- [X] T127 [AUTH] Implement GET /api/auth/me endpoint in backend/src/api/auth.ts

### Frontend for Authentication

- [X] T128 [P] [AUTH] Create User TypeScript interface in frontend/src/types/User.ts
- [X] T129 [P] [AUTH] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx
- [X] T130 [P] [AUTH] Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx
- [X] T131 [AUTH] Create Auth page with login and register tabs in frontend/src/pages/Auth.tsx
- [X] T132 [AUTH] Implement login API call in frontend/src/services/api-client.ts
- [X] T133 [AUTH] Implement register API call in frontend/src/services/api-client.ts
- [X] T134 [AUTH] Add authentication state management to AuthContext in frontend/src/contexts/AuthContext.tsx
- [X] T135 [AUTH] Create PrivateRoute component in frontend/src/components/auth/PrivateRoute.tsx
- [X] T136 [AUTH] Add route guards to App.tsx in frontend/src/App.tsx

**Checkpoint**: Users can register, login, and access protected routes

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T137 [P] [POLISH] Add loading states to all API calls in frontend/src/components
- [ ] T138 [P] [POLISH] Add error handling and user feedback toasts in frontend/src/components/shared/Toast.tsx
- [ ] T139 [P] [POLISH] Add date range filtering to timeline in frontend/src/components/timeline/Timeline.tsx
- [ ] T140 [P] [POLISH] Implement 3-level timeline zoom (day/week/month views) with pan functionality in frontend/src/components/timeline/Timeline.tsx
- [ ] T141 [P] [POLISH] Create health check endpoint in backend/src/api/health.ts
- [ ] T142 [P] [POLISH] Add rate limiting middleware in backend/src/middleware/rate-limit.ts
- [ ] T143 [P] [POLISH] Implement input sanitization for XSS prevention in backend/src/middleware/sanitize.ts
- [ ] T144 [P] [POLISH] Add database query performance logging in backend/src/db/connection.ts
- [ ] T145 [POLISH] Create README.md with setup instructions in project root
- [ ] T146 [POLISH] Add API documentation with Swagger UI
- [ ] T147 [POLISH] Code review and refactoring across all modules
- [ ] T148 [POLISH] Performance optimization for timeline rendering
- [ ] T149 [POLISH] Security audit and hardening
- [ ] T150 [POLISH] Validate all UI components render correctly at 375px minimum width across all pages

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Authentication (Phase 10)**: Depends on Foundational (Phase 2) - Can run in parallel with user stories
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories ✅ MVP
- **User Story 2 (P1)**: Can start after Foundational - Enhances US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational - Extends US1 but independently testable
- **User Story 4 (P2)**: Can start after Foundational - Extends US1 but independently testable
- **User Story 5 (P2)**: Can start after Foundational - Requires US1 event structure
- **User Story 6 (P2)**: Can start after Foundational - Can work without other stories
- **User Story 7 (P3)**: Can start after US1 (needs events to exist)

---

## Task Summary Statistics

**Total Tasks**: 150

**By Phase**:
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 24 tasks (removed OAuth, WebSockets, roles)
- Phase 3 (US1 - Quick Event Creation): 18 tasks
- Phase 4 (US2 - Category Organization): 15 tasks (simplified - no ownership)
- Phase 5 (US3 - Team Assignment): 6 tasks
- Phase 6 (US4 - Status/Priority): 10 tasks (3 statuses instead of 4)
- Phase 7 (US5 - Edit/Delete): 10 tasks
- Phase 8 (US6 - List View): 17 tasks
- Phase 9 (US7 - Data Export): 11 tasks
- Phase 10 (Authentication): 14 tasks (email/password only)
- Phase 11 (Polish): 14 tasks

**By User Story**:
- US1 (Quick Event Creation): 18 tasks
- US2 (Category Organization): 15 tasks
- US3 (Team Assignment): 6 tasks
- US4 (Status/Priority Tracking): 10 tasks
- US5 (Edit/Delete): 10 tasks
- US6 (List View with Sorting & Filtering): 17 tasks
- US7 (Data Export - CSV/Excel only): 11 tasks

**Parallel Opportunities**: ~60 tasks marked with [P] can be executed in parallel

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) + Phase 10 (Auth) = 81 tasks

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Quick Event Creation)
4. Complete Phase 4: User Story 2 (Category Organization)
5. Complete Phase 10: Authentication (Required for access control)
6. **STOP and VALIDATE**: Test event creation with categories independently
7. Deploy/demo if ready

This MVP delivers the core value: users can add events to a categorized timeline.
