# Implementation Plan: Chronological Timeline View

**Branch**: `001-timeline-view` | **Date**: 2025-10-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-timeline-view/spec.md`

## Summary

Add a chronological timeline view alongside the existing category view, enabling festival organizers to visualize events along a horizontal time axis within category swimlanes. The feature includes dual zoom controls (time range and visual scale), an animated TODAY indicator, horizontal scrolling navigation, and a "Jump to Today" button. The implementation is frontend-only, reusing existing event data APIs and modal components.

**Technical Approach**: Build 8 new React components using existing stack (React 18, TypeScript, TailwindCSS) with no new external dependencies. Implement positioning calculations using date-fns utilities, persist view state in localStorage, and use CSS animations for the TODAY line. Leverage IntersectionObserver API for efficient "Jump to Today" button visibility tracking.

## Technical Context

**Language/Version**: TypeScript 5.3.3, React 18.2.0, Node.js 20.x LTS
**Primary Dependencies**: React 18, Vite 5, TailwindCSS 3.4, date-fns 3.0.6, React Query 5.13, Zustand 4.4
**Storage**: PostgreSQL 16 (existing, no schema changes), localStorage (browser-side view state)
**Testing**: Vitest 1.1 (unit tests), Playwright 1.40 (E2E tests), React Testing Library 14.1
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - last 2 versions), responsive 375px-1920px+
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: <2s timeline render with 200 events, <500ms zoom/scroll interactions, 60fps scrolling
**Constraints**: No new external timeline libraries, <200ms interaction latency, maintain existing API contracts
**Scale/Scope**: Frontend-only feature, 8 new components, 1 modified page, 1 utility module, ~1200 LOC estimated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User-First Design ✅ PASS

- **Mapping to user stories**: All 7 user stories defined with acceptance criteria (spec.md lines 10-127)
- **Independent testability**: Each user story independently testable (P1 stories deliver MVP value)
- **Measurable value**: 14 success criteria with quantitative metrics (SC-001 through SC-014)
- **Core use case support**: Directly enhances festival event organization with chronological context

**Verdict**: Compliant - Feature maps directly to user scenarios with clear acceptance tests.

### II. Performance at Scale ✅ PASS

- **Timeline load**: SC-002 requires <2s render for 200 events (meets constitutional <2s requirement)
- **Smooth scrolling**: SC-012 requires 60fps with 200 events (aligned with performance principle)
- **Interaction speed**: SC-005/006/007/008 specify <1s interactions (meets responsiveness goals)
- **Scale handling**: Edge cases address 50+ events/day, 2-year timelines (demonstrates scale planning)

**Verdict**: Compliant - Performance targets align with constitutional requirements and edge cases demonstrate scale awareness.

### III. Mobile-First Responsive Design ✅ PASS

- **Screen width support**: SC-009 requires 375px minimum (constitutional requirement)
- **Full functionality**: User Story 6 ensures mobile adaptation with compact controls
- **Touch optimization**: FR-020 specifies mobile-specific interactions (tap targets, compact zoom)
- **Responsive adaptation**: Breakpoints defined for desktop/tablet/mobile (1024px, 640px, 375px)

**Verdict**: Compliant - Mobile-first design with explicit responsive requirements.

### IV. Data Portability ⚠️ NOT APPLICABLE

- **Context**: Timeline view is a visualization feature, not a data management feature
- **Existing compliance**: Export functionality already exists (CSV/Excel) for event data
- **No impact**: Timeline view displays existing event data without modifying export capabilities

**Verdict**: Not applicable to this feature - constitutional requirement already satisfied by existing export.

### Quality Standards Assessment

**Usability Requirements** ✅ PASS
- SC-011: 90% of users locate/interact with events on first attempt (meets 90% usability target)
- SC-003: Users identify TODAY line within 2 seconds (intuitive visual design)
- FR-012/023/024/026: Clear visual indicators (priority badges, status icons, hover effects)
- FR-014: Reuses existing event modal (consistent interaction pattern)

**Browser Compatibility** ✅ PASS
- Non-Functional Considerations specify Chrome, Firefox, Safari, Edge (last 2 versions)
- Matches constitutional browser compatibility requirements exactly

**Data Integrity** ✅ PASS
- FR-021: Filters/sort settings persist when switching views (no data loss)
- FR-022: Timeline updates immediately on event create/edit/delete (consistency)
- Edge cases cover switching views with modal open (graceful state handling)

**Overall Constitution Verdict**: ✅ **PASS** - Feature fully compliant with all applicable constitutional principles and quality standards.

## Project Structure

### Documentation (this feature)

```
specs/001-timeline-view/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   └── timeline-view-state.schema.json
├── checklists/          # Validation checklists (already created)
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── api/             # No changes (timeline view is frontend-only)
│   ├── models/          # No changes (no new database entities)
│   └── services/        # No changes (reuses existing EventService, CategoryService)
└── tests/               # No new backend tests required

frontend/
├── src/
│   ├── components/
│   │   └── timeline/    # **NEW MODULE** - Timeline view components
│   │       ├── ViewToggle.tsx                    # [NEW] View mode tabs
│   │       ├── ChronologicalTimeline.tsx         # [NEW] Main orchestrator
│   │       ├── TimelineAxis.tsx                  # [NEW] Date ruler
│   │       ├── TimelineNowLine.tsx               # [NEW] Animated TODAY indicator
│   │       ├── TimelineSwimlane.tsx              # [NEW] Category lane
│   │       ├── TimelineEventCard.tsx             # [NEW] Compact event card
│   │       ├── ZoomControls.tsx                  # [NEW] Time range + visual zoom
│   │       └── JumpToTodayButton.tsx             # [NEW] Scroll-to-today button
│   │
│   ├── pages/
│   │   └── Timeline.tsx                          # **MODIFIED** - Add view toggle, conditional rendering
│   │
│   ├── utils/
│   │   └── timelineCalculations.ts               # [NEW] Date range, positioning, scale utilities
│   │
│   ├── hooks/
│   │   └── useTimelineViewState.ts               # [NEW] Custom hook for view state + localStorage persistence
│   │
│   └── styles/
│       └── timeline-animations.css               # [NEW] CSS keyframes for TODAY line pulse/glow
│
└── tests/
    ├── components/timeline/                      # [NEW] Component unit tests
    │   ├── ViewToggle.test.tsx
    │   ├── ChronologicalTimeline.test.tsx
    │   ├── TimelineSwimlane.test.tsx
    │   └── TimelineEventCard.test.tsx
    │
    ├── utils/
    │   └── timelineCalculations.test.ts          # [NEW] Positioning logic tests
    │
    └── e2e/
        └── timeline-view.spec.ts                 # [NEW] E2E tests for user stories 1-7
```

**Structure Decision**: This is a **web application** (Option 2) with existing backend/frontend separation. The timeline view feature is **frontend-only**, adding new components to the existing `frontend/src/components/timeline/` directory structure. No backend changes are required as the feature visualizes existing event data. The modular component structure aligns with the existing architecture (see `/frontend/src/components/events/`, `/frontend/src/components/categories/` for precedent).

## Complexity Tracking

*No constitutional violations - this table is empty.*

All complexity is justified within constitutional bounds:
- 8 new components follow React single-responsibility principle (constitutional modularity requirement)
- No new external dependencies (minimizes complexity, aligns with existing stack)
- Frontend-only implementation (avoids unnecessary full-stack changes)
- Reuses existing patterns (Zustand for state, React Query for data, TailwindCSS for styling)

---

## Phase 0: Research & Technology Validation

**Objective**: Resolve all technical unknowns and validate technology choices before design phase.

### Research Tasks

1. **Date Positioning Algorithm Design**
   - **Question**: What is the optimal algorithm for converting dates to X coordinates with varying zoom levels?
   - **Approach**: Research linear scale calculations, evaluate getTime() vs. day-based math, analyze edge cases (DST, leap years, timezone handling)
   - **Output**: Document chosen algorithm with pseudocode and complexity analysis

2. **Event Stacking Strategy**
   - **Question**: How to handle vertical stacking when multiple events share the same date?
   - **Clarification answer**: Chronological by event time (earliest at bottom, latest at top) - from spec clarifications
   - **Approach**: Research collision detection patterns, evaluate CSS flexbox vs. absolute positioning, analyze performance with 50+ events/day
   - **Output**: Document stacking algorithm with visual examples

3. **Scroll Position Persistence**
   - **Question**: How to reliably save/restore horizontal scroll position across page refreshes?
   - **Clarification answer**: Remember and restore last scroll position (localStorage) - from spec clarifications
   - **Approach**: Research scroll restoration APIs, evaluate scrollLeft vs. scrollTo(), test browser compatibility
   - **Output**: Document persistence strategy with edge case handling (scroll before data loads, invalid positions)

4. **IntersectionObserver Performance**
   - **Question**: What are the performance implications of using IntersectionObserver for "Jump to Today" button visibility?
   - **Approach**: Research best practices, evaluate root margin settings, analyze memory overhead with multiple observers
   - **Output**: Document observer configuration and fallback strategy for unsupported browsers

5. **Responsive Breakpoint Strategy**
   - **Question**: How should swimlane layout adapt across desktop/tablet/mobile?
   - **Approach**: Research TailwindCSS responsive utilities, evaluate single-lane vs. multi-lane on tablet, analyze touch interaction patterns
   - **Output**: Document breakpoint strategy with component behavior matrix

6. **Animation Performance Best Practices**
   - **Question**: How to implement CSS animations without impacting scroll performance?
   - **Approach**: Research GPU-accelerated properties (transform, opacity), evaluate will-change usage, test on low-end devices
   - **Output**: Document animation implementation guidelines

### Expected Outputs

**File**: `research.md`

**Structure**:
```markdown
# Research: Chronological Timeline View

## 1. Date Positioning Algorithm
**Decision**: Linear scale using millisecond timestamps
**Rationale**: [detailed reasoning]
**Alternatives Considered**: Day-based integer math, relative positioning

## 2. Event Stacking Strategy
**Decision**: Absolute positioning with time-based sort
**Rationale**: [detailed reasoning]
**Alternatives Considered**: CSS flexbox, CSS grid

## 3. Scroll Position Persistence
**Decision**: localStorage with scrollLeft in pixels
**Rationale**: [detailed reasoning]
**Alternatives Considered**: URL hash parameters, sessionStorage

## 4. IntersectionObserver Configuration
**Decision**: root margin 100px, threshold [0, 1]
**Rationale**: [detailed reasoning]
**Alternatives Considered**: Scroll event listeners, manual viewport calculations

## 5. Responsive Breakpoints
**Decision**: Desktop (1024px+), Tablet (640-1024px), Mobile (375-640px)
**Rationale**: [detailed reasoning]
**Alternatives Considered**: Mobile-first single breakpoint, container queries

## 6. Animation Performance
**Decision**: transform + opacity only, will-change on hover
**Rationale**: [detailed reasoning]
**Alternatives Considered**: JavaScript animations, Web Animations API
```

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### 1. Data Model

**File**: `data-model.md`

**Entities** (derived from spec.md Key Entities section):

```markdown
# Data Model: Chronological Timeline View

## Entity: TimelineViewState

**Description**: Client-side state representing the user's current timeline view configuration

**Fields**:
- `viewMode`: enum ('category' | 'timeline') - Selected view mode
- `zoomLevel`: enum ('day' | 'week' | 'month' | 'quarter') - Time range zoom
- `visualScale`: number (0.5-2.0, default 1.0) - Visual scaling factor
- `scrollPosition`: number (pixels) - Horizontal scroll offset
- `timestamp`: number (ms) - Last update timestamp for cache invalidation

**Validation Rules**:
- `visualScale` must be between 0.5 and 2.0 (inclusive)
- `scrollPosition` must be >= 0
- `zoomLevel` must be one of the four defined values

**Storage**: localStorage key `timeline-view-state`

**Relationships**: None (client-side only, no database entity)

## Entity: CategorySwimlane (View Model)

**Description**: Derived data structure for rendering a category lane

**Fields**:
- `categoryId`: UUID - Category identifier
- `categoryName`: string - Display name
- `categoryColor`: string (#RRGGBB) - HEX color code
- `eventCount`: number - Total events in this category
- `events`: Event[] - Filtered/sorted events for this category
- `sortOrder`: number - Alphabetical sort position

**Validation Rules**:
- `events` must be sorted by date, then by time (earliest first)
- `sortOrder` must match alphabetical sort of category name (clarification)

**Derivation**: Computed from existing Category + Event entities via React Query

## Entity: TimelineEventCard (View Model)

**Description**: Positioned event representation for timeline rendering

**Fields**:
- `eventId`: UUID - Event identifier
- `title`: string - Event title (truncated to 50 chars)
- `date`: Date - Event date
- `time`: string (optional) - Event time for stacking order
- `priority`: enum ('High' | 'Medium' | 'Low')
- `status`: enum ('Not Started' | 'In Progress' | 'Completed')
- `categoryColor`: string (#RRGGBB)
- `xPosition`: number (pixels) - Horizontal position from timeline start
- `yPosition`: number (pixels) - Vertical position from swimlane centerline
- `position`: enum ('above' | 'below') - Side of centerline
- `stackIndex`: number - Vertical stacking offset for same-date events

**Validation Rules**:
- `xPosition` must be within calculated timeline bounds
- `yPosition` alternates above/below for adjacent events
- `stackIndex` follows time-based sort within same-date group (clarification)

**Derivation**: Computed from Event entity via positioning algorithm (research.md)

## Entity: TimeAxis (View Model)

**Description**: Date ruler configuration for horizontal timeline

**Fields**:
- `startDate`: Date - Left boundary of visible range
- `endDate`: Date - Right boundary of visible range
- `granularity`: enum ('hour' | 'day' | 'week' | 'month') - Tick spacing
- `tickPositions`: Array<{date: Date, label: string, x: number}> - Rendered date markers
- `pixelsPerDay`: number - Scale factor from research.md

**Validation Rules**:
- `startDate` must be before `endDate`
- `granularity` must match `zoomLevel` mapping (research.md)
- `tickPositions` must be evenly spaced based on granularity

**Derivation**: Computed from TimelineViewState + date range calculations

## Entity: TodayMarker (View Model)

**Description**: Current date indicator position

**Fields**:
- `date`: Date - Today's date (updated on mount)
- `xPosition`: number (pixels) - Horizontal position on timeline
- `isVisible`: boolean - Whether marker is in viewport (IntersectionObserver)

**Validation Rules**:
- `date` must be current date (no time component)
- `xPosition` recalculated on zoom/scale changes

**Derivation**: Computed from current date + positioning algorithm
```

### 2. API Contracts

**Directory**: `contracts/`

**Files**:

1. **`timeline-view-state.schema.json`** (TypeScript interfaces in JSON Schema format)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Timeline View State Schema",
  "description": "Client-side state for chronological timeline view configuration",
  "type": "object",
  "properties": {
    "viewMode": {
      "type": "string",
      "enum": ["category", "timeline"],
      "default": "category",
      "description": "Selected view mode"
    },
    "zoomLevel": {
      "type": "string",
      "enum": ["day", "week", "month", "quarter"],
      "default": "month",
      "description": "Time range zoom level"
    },
    "visualScale": {
      "type": "number",
      "minimum": 0.5,
      "maximum": 2.0,
      "default": 1.0,
      "description": "Visual scaling factor"
    },
    "scrollPosition": {
      "type": "number",
      "minimum": 0,
      "default": 0,
      "description": "Horizontal scroll offset in pixels"
    },
    "timestamp": {
      "type": "number",
      "description": "Last update timestamp (ms since epoch)"
    }
  },
  "required": ["viewMode", "zoomLevel", "visualScale", "scrollPosition", "timestamp"]
}
```

2. **`component-props.interface.ts`** (TypeScript interfaces for component contracts)

```typescript
// ViewToggle component
export interface ViewToggleProps {
  currentView: 'category' | 'timeline';
  onViewChange: (view: 'category' | 'timeline') => void;
}

// ChronologicalTimeline component
export interface ChronologicalTimelineProps {
  events: Event[];
  categories: Category[];
  onEventClick: (eventId: string) => void;
}

// TimelineAxis component
export interface TimelineAxisProps {
  startDate: Date;
  endDate: Date;
  zoomLevel: ZoomLevel;
  visualScale: number;
  pixelsPerDay: number;
}

// TimelineSwimlane component
export interface TimelineSwimlaneProps {
  category: Category;
  events: Event[];
  startDate: Date;
  endDate: Date;
  visualScale: number;
  pixelsPerDay: number;
  onEventClick: (eventId: string) => void;
}

// TimelineEventCard component
export interface TimelineEventCardProps {
  event: Event;
  position: 'above' | 'below';
  xPosition: number;
  yPosition: number;
  categoryColor: string;
  onClick: () => void;
}

// ZoomControls component
export interface ZoomControlsProps {
  currentZoomLevel: ZoomLevel;
  currentVisualScale: number;
  onZoomLevelChange: (level: ZoomLevel) => void;
  onVisualScaleChange: (scale: number) => void;
}

// JumpToTodayButton component
export interface JumpToTodayButtonProps {
  isVisible: boolean;
  onJumpToToday: () => void;
}

// TimelineNowLine component
export interface TimelineNowLineProps {
  xPosition: number;
  height: number;
}
```

**Note**: No backend API changes required. Timeline view consumes existing endpoints:
- `GET /api/events` (filtering, sorting)
- `GET /api/categories`
- Event modal reuses existing `PUT /api/events/:id`, `DELETE /api/events/:id`

### 3. Quickstart Guide

**File**: `quickstart.md`

```markdown
# Quickstart: Chronological Timeline View Development

## Prerequisites

- Node.js 20.x LTS
- npm 9.0+
- Backend running on http://localhost:3000
- Frontend running on http://localhost:5173

## Setup

1. **Checkout feature branch**:
   ```bash
   git checkout 001-timeline-view
   ```

2. **No new dependencies required** - feature uses existing stack

3. **Start development servers** (if not already running):
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Development Workflow

### Phase 1: Core Components (P1 User Stories)

**Order of implementation** (dependency-driven):

1. **Utility Module First** (`timelineCalculations.ts`)
   - Implement date range calculation (`calculateDateRange`)
   - Implement pixels-per-day calculation (`getPixelsPerDay`)
   - Implement event positioning algorithm (`calculateEventPositions`)
   - Write unit tests for all calculations

2. **Atomic Components** (no internal dependencies)
   - `ViewToggle.tsx` - Simple tab switcher
   - `TimelineNowLine.tsx` - Animated vertical line
   - `TimelineEventCard.tsx` - Compact event display
   - Write unit tests for each

3. **Composite Components** (depend on atomic)
   - `TimelineAxis.tsx` - Uses date calculations
   - `ZoomControls.tsx` - Standalone controls
   - `JumpToTodayButton.tsx` - Uses IntersectionObserver
   - Write unit tests for each

4. **Swimlane Component** (depends on TimelineEventCard)
   - `TimelineSwimlane.tsx` - Integrates event cards + positioning
   - Write unit tests with mock events

5. **Main Orchestrator** (depends on all above)
   - `ChronologicalTimeline.tsx` - Assembles all components
   - Write integration tests

6. **Page Integration** (final step)
   - Modify `Timeline.tsx` - Add view toggle + conditional rendering
   - Write E2E tests for user stories 1, 2, 4, 5 (P1 stories)

### Phase 2: Enhancements (P2 User Stories)

7. **Visual Zoom** (User Story 3)
   - Extend `ZoomControls.tsx` with visual scale buttons
   - Update positioning calculations to apply visual scale
   - Write E2E tests for zoom interactions

8. **Mobile Responsiveness** (User Story 6)
   - Add responsive styles to all components
   - Implement mobile-specific behavior (dropdown zoom, single-lane view)
   - Write responsive E2E tests

### Phase 3: Polish (P3 User Stories)

9. **Connector Lines** (User Story 7)
   - Add connector line rendering to `TimelineEventCard.tsx`
   - Style with category colors + opacity
   - Write visual regression tests

## Testing Strategy

### Unit Tests (Vitest)

```bash
# Run all tests
npm test

# Run specific component tests
npm test -- TimelineSwimlane.test.tsx

# Watch mode
npm test -- --watch
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- timeline-view.spec.ts

# Interactive mode
npm run test:e2e:ui
```

### Manual Testing Checklist

1. **User Story 1**: Switch to Timeline View → verify swimlanes + chronological positioning
2. **User Story 2**: Test horizontal scroll, time range zoom (Day/Week/Month/Quarter)
3. **User Story 3**: Test visual zoom (+/− buttons)
4. **User Story 4**: Switch views, verify persistence on refresh
5. **User Story 5**: Click events, verify modal opens, edit/delete works
6. **User Story 6**: Resize to 375px, verify mobile adaptations
7. **User Story 7**: Verify connector lines visible

## Debugging Tips

### Timeline not rendering
- Check browser console for errors
- Verify `calculateDateRange` returns valid dates
- Ensure events have valid date fields

### Event positioning incorrect
- Log `calculateEventPositions` output
- Verify `pixelsPerDay` calculation matches zoom level
- Check for timezone issues (use UTC for date comparisons)

### Scroll position not persisting
- Check localStorage in DevTools (key: `timeline-view-state`)
- Verify JSON serialization of state object
- Clear localStorage and test initial load

### Performance issues
- Use React DevTools Profiler to identify re-renders
- Verify memoization on `calculateEventPositions`
- Check for expensive operations in render loops

## Key Files Reference

- **Components**: `/frontend/src/components/timeline/*.tsx`
- **Utilities**: `/frontend/src/utils/timelineCalculations.ts`
- **Styles**: `/frontend/src/styles/timeline-animations.css`
- **Tests**: `/frontend/tests/components/timeline/*.test.tsx`
- **E2E**: `/frontend/tests/e2e/timeline-view.spec.ts`

## Next Steps After Completion

1. Run full test suite: `npm test && npm run test:e2e`
2. Verify performance metrics (SC-001 through SC-014 in spec.md)
3. Create pull request with demo video/screenshots
4. Update main PROJECT.md with timeline view documentation
```

### 4. Agent Context Update

**Action**: Run agent context update script after Phase 1 completion

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

**Expected Changes**:
- Adds timeline view component structure to `CLAUDE.md` or agent-specific context file
- Documents new utilities and hooks
- Preserves existing manual documentation

---

## Phase 1 Completion Checklist

- [ ] `research.md` created with all 6 research decisions documented
- [ ] `data-model.md` created with 5 view model entities defined
- [ ] `contracts/timeline-view-state.schema.json` created
- [ ] `contracts/component-props.interface.ts` created
- [ ] `quickstart.md` created with development workflow
- [ ] Agent context updated via script
- [ ] Constitution Check re-validated (should still pass)

---

## Phase 2: Task Generation (OUT OF SCOPE)

**Note**: Phase 2 (task generation) is handled by the `/speckit.tasks` command, which will:
- Parse `plan.md`, `research.md`, `data-model.md`
- Generate dependency-ordered task list in `tasks.md`
- Create actionable development tasks with acceptance criteria

**This `/speckit.plan` command stops after Phase 1 completion.**

---

## Implementation Notes

### Key Technical Decisions

1. **No Backend Changes**: Timeline view is purely a frontend visualization feature
2. **No New Dependencies**: Leverages existing React Query, Zustand, TailwindCSS, date-fns
3. **Modular Architecture**: 8 independent components following single-responsibility principle
4. **Performance-First**: Memoization, CSS animations, efficient positioning algorithms
5. **Progressive Enhancement**: IntersectionObserver with fallback for older browsers

### Risk Mitigation

1. **Scroll Performance**: Use React.memo + useMemo to prevent unnecessary re-renders
2. **Date Calculations**: Comprehensive unit tests for edge cases (DST, leap years, timezones)
3. **Browser Compatibility**: Test on all required browsers (Chrome, Firefox, Safari, Edge)
4. **Mobile UX**: Early responsive testing to validate single-lane approach
5. **State Persistence**: Validate localStorage availability + graceful degradation

### Success Validation

After implementation, verify all 14 Success Criteria (SC-001 through SC-014):
- Performance metrics: Chrome DevTools Performance tab
- User interaction metrics: Playwright E2E tests with timing assertions
- Mobile usability: Responsive testing on real devices or BrowserStack
- Scroll smoothness: Visual inspection + FPS monitoring

---

**Plan Version**: 1.0
**Last Updated**: 2025-10-18
**Status**: Phase 0 Research - Ready to Begin
