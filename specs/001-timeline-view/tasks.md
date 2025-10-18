# Tasks: Chronological Timeline View

**Feature Branch**: `001-timeline-view`
**Input**: Design documents from `/specs/001-timeline-view/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: NOT requested in specification - focusing on implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Web app structure**: `frontend/src/`, `frontend/tests/`
- **Backend**: No changes required (frontend-only feature)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and shared utilities that all components depend on

- [ ] T001 Create TypeScript types file at frontend/src/types/timeline.ts with all interfaces from contracts/component-props.interface.ts
- [ ] T002 [P] Create CSS animations file at frontend/src/styles/timeline-animations.css with TODAY line keyframes (pulse and glow)
- [ ] T003 [P] Create timeline calculations utility at frontend/src/utils/timelineCalculations.ts with calculateDefaultDateRange function
- [ ] T004 [P] Add getPixelsPerDay function to frontend/src/utils/timelineCalculations.ts (Day: 100px, Week: 20px, Month: 5px, Quarter: 2px)
- [ ] T005 [P] Add calculateTimelineWidth function to frontend/src/utils/timelineCalculations.ts
- [ ] T006 [P] Add calculateEventX function to frontend/src/utils/timelineCalculations.ts (UTC millisecond linear interpolation)
- [ ] T007 Add calculateEventPositions function to frontend/src/utils/timelineCalculations.ts with stacking logic (depends on T003-T006)

**Checkpoint**: Foundation ready - type-safe utilities available for all components

---

## Phase 2: Custom Hooks (Blocking Prerequisites)

**Purpose**: State management hooks that components will consume

**⚠️ CRITICAL**: Components cannot be built until these hooks are complete

- [ ] T008 Create useTimelineViewState hook at frontend/src/hooks/useTimelineViewState.ts with localStorage persistence
- [ ] T009 [P] Create useScrollRestoration hook at frontend/src/hooks/useScrollRestoration.ts with useLayoutEffect for flicker-free restoration
- [ ] T010 [P] Add localStorage error handling to useScrollRestoration (Safari Private Mode, quota exceeded per research.md)
- [ ] T011 [P] Add throttled scroll persistence to useScrollRestoration (150ms debounce, passive listeners)

**Checkpoint**: Hooks ready - components can now be implemented in parallel

---

## Phase 3: User Story 1 - View Events Chronologically by Category (Priority: P1) 🎯 MVP

**Goal**: Display events in chronological order within horizontal category swimlanes with animated TODAY line

**Independent Test**: Navigate to /timeline, switch to Timeline View tab, verify events appear in chronological order within category lanes with visible TODAY line

### Atomic Components for US1

- [ ] T012 [P] [US1] Create ViewToggle component at frontend/src/components/timeline/ViewToggle.tsx with tab switching UI
- [ ] T013 [P] [US1] Create TimelineNowLine component at frontend/src/components/timeline/TimelineNowLine.tsx with CSS animations (import from timeline-animations.css)
- [ ] T014 [P] [US1] Create TimelineEventCard component at frontend/src/components/timeline/TimelineEventCard.tsx with compact design (max-width 180px, truncated title)
- [ ] T015 [P] [US1] Add connector line rendering to TimelineEventCard (vertical dotted line, category color at 50% opacity)

### Composite Components for US1

- [ ] T016 [P] [US1] Create TimelineAxis component at frontend/src/components/timeline/TimelineAxis.tsx with tick generation based on zoomLevel
- [ ] T017 [P] [US1] Add date label formatting to TimelineAxis using date-fns format function
- [ ] T018 [US1] Create TimelineSwimlane component at frontend/src/components/timeline/TimelineSwimlane.tsx (depends on T014 for EventCard)
- [ ] T019 [US1] Add event positioning logic to TimelineSwimlane using calculateEventPositions from utils
- [ ] T020 [US1] Add alphabetical category sorting to TimelineSwimlane (per clarification requirement)
- [ ] T021 [US1] Add time-based event stacking to TimelineSwimlane (earliest at bottom per clarification)

### Main Orchestrator for US1

- [ ] T022 [US1] Create ChronologicalTimeline component at frontend/src/components/timeline/ChronologicalTimeline.tsx (depends on T016-T021)
- [ ] T023 [US1] Integrate useTimelineViewState hook in ChronologicalTimeline for state management
- [ ] T024 [US1] Add date range calculation (2 weeks before, 2 months after today) in ChronologicalTimeline
- [ ] T025 [US1] Integrate CategorySwimlane derivation logic (group events by category, sort alphabetically)
- [ ] T026 [US1] Add TimelineNowLine position calculation and rendering in ChronologicalTimeline
- [ ] T027 [US1] Add horizontal scroll container with overflow-x auto in ChronologicalTimeline

### Page Integration for US1

- [ ] T028 [US1] Modify frontend/src/pages/Timeline.tsx to import ViewToggle and ChronologicalTimeline
- [ ] T029 [US1] Add conditional rendering in Timeline.tsx (viewMode === 'category' ? existing : new ChronologicalTimeline)
- [ ] T030 [US1] Ensure EventList remains visible below timeline in both view modes

**Checkpoint**: User Story 1 complete - chronological timeline view fully functional with TODAY line, can switch between views

---

## Phase 4: User Story 2 - Navigate Through Time (Priority: P1)

**Goal**: Enable horizontal scrolling and time range zoom controls (Day/Week/Month/Quarter)

**Independent Test**: Switch to Timeline View, use horizontal scroll, click time range buttons, verify timeline adjusts visible window and date granularity

### Components for US2

- [ ] T031 [P] [US2] Create ZoomControls component at frontend/src/components/timeline/ZoomControls.tsx with time range buttons
- [ ] T032 [P] [US2] Add visual scale buttons (+, Reset, −) to ZoomControls component
- [ ] T033 [P] [US2] Create JumpToTodayButton component at frontend/src/components/timeline/JumpToTodayButton.tsx with floating position
- [ ] T034 [US2] Add IntersectionObserver setup in ChronologicalTimeline for TODAY line visibility tracking
- [ ] T035 [US2] Add smooth scroll to TODAY on JumpToTodayButton click (scrollTo with behavior: 'smooth')

### Integration for US2

- [ ] T036 [US2] Integrate ZoomControls into ChronologicalTimeline with zoom state handlers
- [ ] T037 [US2] Integrate JumpToTodayButton into ChronologicalTimeline with visibility conditional rendering
- [ ] T038 [US2] Add zoom level change handler in ChronologicalTimeline (recalculate pixelsPerDay and timeline width)
- [ ] T039 [US2] Add granularity mapping in TimelineAxis (day→hour, week→day, month→week, quarter→month per research.md)

**Checkpoint**: User Story 2 complete - full navigation controls working (scroll, zoom, jump to today)

---

## Phase 5: User Story 3 - Adjust Visual Density (Priority: P2)

**Goal**: Enable visual zoom in/out (+/− buttons) to adjust event card spacing without changing time range

**Independent Test**: Click visual zoom buttons (+/−), verify event cards and spacing scale proportionally while time range remains constant

### Implementation for US3

- [ ] T040 [US3] Add visualScale state handling in ChronologicalTimeline (0.5x to 2.0x range)
- [ ] T041 [US3] Connect visual scale buttons in ZoomControls to visualScale state
- [ ] T042 [US3] Update position calculations in ChronologicalTimeline to apply visualScale multiplier
- [ ] T043 [US3] Add Reset button handler to restore visualScale to 1.0x default

**Checkpoint**: User Story 3 complete - visual zoom controls functional

---

## Phase 6: User Story 4 - Switch Between Category and Timeline Views (Priority: P1)

**Goal**: Persist view preference and restore state across page refreshes

**Independent Test**: Switch to Timeline View, refresh page, verify timeline view is remembered; verify filters/sort persist when switching views

### Implementation for US4

- [ ] T044 [US4] Add viewMode persistence to useTimelineViewState hook (localStorage key: 'timeline-view-state')
- [ ] T045 [US4] Add zoomLevel persistence to useTimelineViewState hook
- [ ] T046 [US4] Add visualScale persistence to useTimelineViewState hook
- [ ] T047 [US4] Integrate useScrollRestoration hook in ChronologicalTimeline with enabled flag based on data loaded
- [ ] T048 [US4] Add default scroll position calculation (center on TODAY line) as fallback for first visit
- [ ] T049 [US4] Test filter/sort persistence across view switches in Timeline.tsx

**Checkpoint**: User Story 4 complete - view preferences persist across sessions, scroll position restored

---

## Phase 7: User Story 5 - Interact with Events in Timeline (Priority: P1)

**Goal**: Enable clicking event cards to open detail modal with edit/delete capabilities

**Independent Test**: Click event card in timeline, verify existing event modal opens with full event information and edit/delete buttons work

### Implementation for US5

- [ ] T050 [US5] Add onClick prop to TimelineEventCard component
- [ ] T051 [US5] Wire onEventClick callback from ChronologicalTimeline props through to TimelineEventCard
- [ ] T052 [US5] Add hover effect to TimelineEventCard (shadow lift, translateY(-4px) per research.md)
- [ ] T053 [US5] Verify event modal integration in Timeline.tsx (reuse existing handleEventClick)
- [ ] T054 [US5] Test timeline updates immediately after event edit/delete (React Query invalidation)

**Checkpoint**: User Story 5 complete - full event interaction working through existing modal

---

## Phase 8: User Story 6 - Responsive Timeline on Mobile (Priority: P2)

**Goal**: Adapt timeline layout for mobile devices (375px minimum width)

**Independent Test**: Resize browser to 375px width, verify single-lane view with vertical scroll, compact zoom dropdown, always-visible Jump to Today button

### Responsive Styling for US6

- [ ] T055 [P] [US6] Add responsive classes to ChronologicalTimeline (single-lane on mobile: grid-cols-1 md:grid-cols-auto)
- [ ] T056 [P] [US6] Add responsive swimlane height to TimelineSwimlane (h-32 md:h-40 lg:h-48)
- [ ] T057 [P] [US6] Add responsive event card width to TimelineEventCard (w-20 md:w-32 lg:w-40)
- [ ] T058 [P] [US6] Convert ZoomControls time range buttons to dropdown select on mobile (flex-col md:flex-row)
- [ ] T059 [US6] Make JumpToTodayButton always visible on mobile (conditional: isMobile || !todayLineVisible)
- [ ] T060 [US6] Add 44px minimum tap targets to all interactive elements on mobile (per research.md)

**Checkpoint**: User Story 6 complete - responsive design working at 375px minimum width

---

## Phase 9: User Story 7 - Visual Clarity with Connector Lines (Priority: P3)

**Goal**: Display vertical connector lines from event cards to timeline axis for visual clarity

**Independent Test**: View timeline, verify vertical dotted lines connect each event card to axis in category color

### Implementation for US7

- [ ] T061 [US7] Verify connector line rendering in TimelineEventCard (already implemented in T015)
- [ ] T062 [US7] Add connector line styling (1-2px dotted, category color with 50% opacity per research.md)
- [ ] T063 [US7] Test connector line visibility with densely packed events (stacking scenario)

**Checkpoint**: User Story 7 complete - connector lines visible and styled correctly

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple user stories

- [ ] T064 [P] Add comprehensive edge case handling for 50+ events same date (stacking limit + overflow indicator)
- [ ] T065 [P] Add empty category swimlane rendering (show category name and color with no events)
- [ ] T066 [P] Add event title truncation with ellipsis in TimelineEventCard (max 50 chars per data-model.md)
- [ ] T067 [P] Optimize event position calculations with useMemo in ChronologicalTimeline
- [ ] T068 [P] Add horizontal viewport culling for events (only render visible events for performance)
- [ ] T069 Test localStorage quota exceeded handling in useScrollRestoration
- [ ] T070 Test Safari Private Mode fallback in useScrollRestoration
- [ ] T071 Verify IntersectionObserver fallback for older browsers (always-visible JumpToToday button)
- [ ] T072 Run performance validation per quickstart.md (Chrome DevTools Performance tab)
- [ ] T073 Verify all 14 success criteria from spec.md (SC-001 through SC-014)
- [ ] T074 Update CLAUDE.md with timeline view component reference (if needed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Hooks (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all component work
- **User Stories (Phase 3-9)**: All depend on Hooks (Phase 2) completion
  - US1-US7 can proceed in parallel if team capacity allows
  - Or sequentially in priority order (P1 stories first: US1, US2, US4, US5 → P2 stories: US3, US6 → P3: US7)
- **Polish (Phase 10)**: Depends on completion of desired user stories

### User Story Dependencies

**Critical Path (MVP)**:
1. **Phase 1 + 2**: Setup + Hooks (required foundation)
2. **Phase 3 (US1)**: MVP - chronological timeline view
3. **Phase 4 (US2)**: Navigation controls
4. **Phase 6 (US4)**: Persistence
5. **Phase 7 (US5)**: Event interaction

**Optional Enhancements**:
- **Phase 5 (US3)**: Visual zoom (can add later)
- **Phase 8 (US6)**: Mobile responsive (can add later)
- **Phase 9 (US7)**: Connector lines polish (can add later)

### User Story Independence

- ✅ **US1** (View Chronologically): Independent - no dependencies on other stories
- ✅ **US2** (Navigate Time): Enhances US1 but doesn't break it - can be added incrementally
- ✅ **US3** (Visual Density): Enhances US2 - independent feature addition
- ✅ **US4** (View Switching): Works with US1 immediately - independent persistence layer
- ✅ **US5** (Event Interaction): Reuses existing modal - minimal integration with US1
- ✅ **US6** (Mobile Responsive): CSS-only - doesn't break desktop functionality
- ✅ **US7** (Connector Lines): Visual enhancement - already in EventCard component

### Within Each User Story

**Parallel Opportunities by Story**:

**US1 (Phase 3)**: Most parallelizable
- T012-T015 (4 atomic components) - fully parallel
- T016-T017 (TimelineAxis) - parallel with above
- T018-T021 (Swimlane) - depends on T014
- T022-T027 (Orchestrator) - depends on all above
- T028-T030 (Page integration) - depends on T022

**US2 (Phase 4)**:
- T031-T033 (3 components) - fully parallel
- T034-T035 (IntersectionObserver) - parallel with above
- T036-T039 (Integration) - sequential

**US3 (Phase 5)**: Sequential (state management)
**US4 (Phase 6)**: Sequential (persistence logic)
**US5 (Phase 7)**: Sequential (integration)
**US6 (Phase 8)**: T055-T058 fully parallel (CSS only)
**US7 (Phase 9)**: Sequential (validation)

**Polish (Phase 10)**: T064-T068 fully parallel

---

## Parallel Example: User Story 1 (Atomic Components)

```bash
# Launch all atomic components for User Story 1 together:
Task: "Create ViewToggle component at frontend/src/components/timeline/ViewToggle.tsx"
Task: "Create TimelineNowLine component at frontend/src/components/timeline/TimelineNowLine.tsx"
Task: "Create TimelineEventCard component at frontend/src/components/timeline/TimelineEventCard.tsx"

# Then launch composite components:
Task: "Create TimelineAxis component at frontend/src/components/timeline/TimelineAxis.tsx"
Task: "Create ZoomControls component at frontend/src/components/timeline/ZoomControls.tsx"
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**Goal**: Deliver chronological timeline view with basic navigation

**Scope**: US1 + US2 + US4 + US5 (P1 stories only)

1. Complete Phase 1: Setup (T001-T007) - ~30 minutes
2. Complete Phase 2: Hooks (T008-T011) - ~1 hour
3. Complete Phase 3: US1 (T012-T030) - ~6-8 hours
4. Complete Phase 4: US2 (T031-T039) - ~2-3 hours
5. Complete Phase 6: US4 (T044-T049) - ~1-2 hours
6. Complete Phase 7: US5 (T050-T054) - ~1 hour
7. **STOP and VALIDATE**: Test MVP independently
8. Deploy/demo if ready

**Estimated MVP Effort**: 12-16 hours (1.5-2 days)

### Incremental Delivery (After MVP)

**Phase A**: MVP (US1, US2, US4, US5) ✅
- Delivers: Full chronological timeline with navigation, persistence, interaction
- Validates: Core value proposition, user acceptance

**Phase B**: Add Visual Zoom (US3) ✅
- Delivers: Enhanced density control
- Validates: Power user needs for detailed/overview modes

**Phase C**: Add Mobile Support (US6) ✅
- Delivers: Mobile accessibility
- Validates: Responsive design patterns

**Phase D**: Add Polish (US7 + Phase 10) ✅
- Delivers: Connector lines, edge case handling, performance optimization
- Validates: Production readiness

### Parallel Team Strategy

With multiple developers:

**Foundation (Sequential - All Hands)**:
1. Phase 1 (Setup): 30 minutes - pair programming
2. Phase 2 (Hooks): 1 hour - pair programming

**User Stories (Parallel)**:
- **Developer A**: US1 (T012-T030) - Core timeline view
- **Developer B**: US2 (T031-T039) + US4 (T044-T049) - Navigation + Persistence
- **Developer C**: US5 (T050-T054) + US3 (T040-T043) - Interaction + Visual Zoom

**Integration (Sequential)**:
- Merge US1 → Merge US2/US4 → Merge US5/US3 → Test together

**Enhancement (Parallel)**:
- **Developer A**: US6 (T055-T060) - Mobile responsive
- **Developer B**: US7 (T061-T063) + Polish (T064-T074)

---

## Notes

- **[P] tasks** = Different files, no dependencies - safe to parallelize
- **[Story] label** = Maps task to specific user story for traceability
- **Each user story is independently testable** - can stop at any checkpoint
- **Frontend-only feature** - No backend tasks required
- **No new dependencies** - Leverages existing React 18, TailwindCSS, date-fns stack
- **Type safety enforced** - All tasks reference TypeScript interfaces from Phase 1
- **Research-driven decisions** - All implementation choices documented in research.md
- **Constitutional compliance** - All 26 functional requirements (FR-001 to FR-026) covered
- **Performance targets** - SC-001 through SC-014 validated in Phase 10

### Task Execution Tips

- ✅ **DO**: Commit after each logical group of [P] tasks
- ✅ **DO**: Test at each checkpoint before proceeding
- ✅ **DO**: Use React DevTools Profiler to verify memoization (T067)
- ✅ **DO**: Test on real devices for US6 (mobile responsive)
- ❌ **AVOID**: Skipping Phase 1-2 (breaks type safety and hooks)
- ❌ **AVOID**: Implementing US3-US7 before MVP validation
- ❌ **AVOID**: Modifying backend (frontend-only feature per plan.md)

---

**Total Tasks**: 74
**Parallel Tasks**: 29 (39% parallelizable)
**User Stories**: 7 (P1: 4 stories, P2: 2 stories, P3: 1 story)
**MVP Scope**: US1 + US2 + US4 + US5 (30 tasks, 12-16 hours)
**Full Feature**: All 7 stories (74 tasks, 20-30 hours estimated)
