# Quickstart: Chronological Timeline View Development

**Feature**: Timeline View
**Branch**: `001-timeline-view`
**Date**: 2025-10-18

## Prerequisites

- Node.js 20.x LTS
- npm 9.0+
- PostgreSQL 16 running with festival_timeline database
- Backend running on http://localhost:3000
- Frontend running on http://localhost:5173

## Setup

### 1. Verify You're on Feature Branch

```bash
git branch --show-current
# Should show: 001-timeline-view
```

### 2. Verify Dependencies (No New Dependencies Required!)

```bash
# Check existing dependencies
cd frontend && npm list date-fns react-window zustand
# All should be present in package.json

cd ../backend && npm list
# Backend dependencies unchanged
```

### 3. Start Development Servers (If Not Already Running)

```bash
# Terminal 1 - Backend
cd backend && npm run dev
# Should see: Server running on http://localhost:3000

# Terminal 2 - Frontend
cd frontend && npm run dev
# Should see: Local: http://localhost:5173
```

### 4. Verify Backend API

```bash
curl http://localhost:3000/api/events
# Should return JSON array of events

curl http://localhost:3000/api/categories
# Should return JSON array of categories
```

---

## Development Workflow

### Implementation Order (Dependency-Driven)

Follow this exact order to minimize integration issues:

---

### Phase 1: Core Utilities & Types

**Priority**: P1 (Required for all components)

#### Step 1.1: Create Type Definitions

```bash
# Create types file
touch frontend/src/types/timeline.ts
```

**File**: `/frontend/src/types/timeline.ts`
- Copy types from `contracts/component-props.interface.ts`
- Add utility types from `data-model.md`

**Test**: `npm run type-check` should pass

#### Step 1.2: Create Timeline Calculations Utility

```bash
# Create utils file
touch frontend/src/utils/timelineCalculations.ts
```

**File**: `/frontend/src/utils/timelineCalculations.ts`

**Implement (in order)**:
1. `calculateDefaultDateRange()` - Returns start/end dates (2 weeks before, 2 months after today)
2. `getPixelsPerDay(zoomLevel, visualScale)` - Returns px/day based on zoom
3. `calculateTimelineWidth(startDate, endDate, pixelsPerDay)` - Total timeline width
4. `calculateEventX(eventDate, startDate, endDate, width)` - X position for event
5. `calculateEventPositions(events, startDate, endDate, pixelsPerDay)` - All event positions with stacking

**Test**:
```bash
# Create test file
touch frontend/tests/utils/timelineCalculations.test.ts

# Run tests
npm test -- timelineCalculations.test.ts
```

**Expected Coverage**: 100% of utility functions

---

### Phase 2: Custom Hooks

**Priority**: P1 (Required for state management)

#### Step 2.1: Create View State Hook

```bash
touch frontend/src/hooks/useTimelineViewState.ts
```

**File**: `/frontend/src/hooks/useTimelineViewState.ts`

**Implement**:
- localStorage persistence
- State initialization with defaults
- Update functions for each field (viewMode, zoomLevel, visualScale, scrollPosition)
- Reset function

**Test**:
```bash
touch frontend/tests/hooks/useTimelineViewState.test.ts
npm test -- useTimelineViewState.test.ts
```

#### Step 2.2: Create Scroll Restoration Hook

```bash
touch frontend/src/hooks/useScrollRestoration.ts
```

**File**: `/frontend/src/hooks/useScrollRestoration.ts`

**Implement** (per research.md section 3):
- useLayoutEffect for restoration (before paint)
- useEffect for persistence (throttled)
- localStorage error handling (Safari Private Mode, quota exceeded)
- IntersectionObserver fallback detection

**Test**:
```bash
touch frontend/tests/hooks/useScrollRestoration.test.ts
npm test -- useScrollRestoration.test.ts
```

---

### Phase 3: Atomic Components

**Priority**: P1 (No dependencies, can be built in parallel)

Build these in any order (they're independent):

#### Component 3.1: ViewToggle

```bash
mkdir -p frontend/src/components/timeline
touch frontend/src/components/timeline/ViewToggle.tsx
```

**Props**: `ViewToggleProps` from contracts
**Styling**: TailwindCSS tabs (active tab highlighted)
**Test**: Click handling, active state styling

#### Component 3.2: TimelineNowLine

```bash
touch frontend/src/components/timeline/TimelineNowLine.tsx
```

**Props**: `TimelineNowLineProps` from contracts
**Styling**: Vertical line with CSS animations (pulse + glow)
**Animation**: Create `/frontend/src/styles/timeline-animations.css` (keyframes from research.md section 6)

#### Component 3.3: TimelineEventCard

```bash
touch frontend/src/components/timeline/TimelineEventCard.tsx
```

**Props**: `TimelineEventCardProps` from contracts
**Layout**: Absolute positioning, compact design (max-width 180px)
**Content**: Title (truncated), date, priority badge, status icon
**Connector**: Vertical line from card to axis (dotted, category color at 50% opacity)

**Test each component**:
```bash
touch frontend/tests/components/timeline/ViewToggle.test.tsx
touch frontend/tests/components/timeline/TimelineNowLine.test.tsx
touch frontend/tests/components/timeline/TimelineEventCard.test.tsx

npm test -- ViewToggle.test.tsx
npm test -- TimelineNowLine.test.tsx
npm test -- TimelineEventCard.test.tsx
```

---

### Phase 4: Composite Components

**Priority**: P1 (Depend on atomic components)

#### Component 4.1: TimelineAxis

```bash
touch frontend/src/components/timeline/TimelineAxis.tsx
```

**Dependencies**: `timelineCalculations.ts`
**Props**: `TimelineAxisProps` from contracts
**Logic**:
- Generate tick positions using `date-fns` (addHours, addDays, addWeeks, addMonths)
- Format labels based on granularity
- Render tick marks with primary/secondary styling

#### Component 4.2: ZoomControls

```bash
touch frontend/src/components/timeline/ZoomControls.tsx
```

**Dependencies**: None
**Props**: `ZoomControlsProps` from contracts
**Layout**:
- Desktop: Horizontal buttons (Day | Week | Month | Quarter) + (− | Reset | +)
- Mobile: Dropdown select + scale buttons

#### Component 4.3: JumpToTodayButton

```bash
touch frontend/src/components/timeline/JumpToTodayButton.tsx
```

**Dependencies**: None
**Props**: `JumpToTodayButtonProps` from contracts
**Behavior**: Floating button (fixed position), smooth scroll on click
**Visibility**: Controlled by prop (IntersectionObserver logic in parent)

**Test**:
```bash
touch frontend/tests/components/timeline/TimelineAxis.test.tsx
touch frontend/tests/components/timeline/ZoomControls.test.tsx
touch frontend/tests/components/timeline/JumpToTodayButton.test.tsx

npm test -- TimelineAxis.test.tsx
npm test -- ZoomControls.test.tsx
npm test -- JumpToTodayButton.test.tsx
```

---

### Phase 5: Swimlane Component

**Priority**: P1 (Integrates event cards with positioning)

#### Component 5.1: TimelineSwimlane

```bash
touch frontend/src/components/timeline/TimelineSwimlane.tsx
```

**Dependencies**: TimelineEventCard, timelineCalculations.ts
**Props**: `TimelineSwimlaneProps` from contracts
**Layout**:
- CSS Grid for swimlane structure
- Relative positioning container
- Absolute positioned event cards
- Dynamic height based on max stack depth

**Logic**:
- Call `calculateEventPositions` for category events
- Sort events by date, then time (per clarification)
- Render TimelineEventCard for each positioned event
- Implement above/below alternating pattern

**Test**:
```bash
touch frontend/tests/components/timeline/TimelineSwimlane.test.tsx
npm test -- TimelineSwimlane.test.tsx
```

**Key Test Cases**:
- Single event rendering
- Multiple events same date (stacking)
- Empty category (empty swimlane)
- 50+ events same date (overflow handling)

---

### Phase 6: Main Orchestrator

**Priority**: P1 (Assembles all components)

#### Component 6.1: ChronologicalTimeline

```bash
touch frontend/src/components/timeline/ChronologicalTimeline.tsx
```

**Dependencies**: ALL previous components + hooks
**Props**: `ChronologicalTimelineProps` from contracts

**State Management**:
```typescript
const { viewMode, zoomLevel, visualScale, scrollPosition, ... } = useTimelineViewState();
const scrollContainerRef = useRef<HTMLDivElement>(null);
const { clearSavedPosition } = useScrollRestoration(scrollContainerRef, { ... });
```

**Data Flow**:
1. Fetch events/categories via React Query (`useEvents`, `useCategories`)
2. Calculate date range (`calculateDefaultDateRange`)
3. Derive CategorySwimlane view models (group events by category, sort alphabetically)
4. Calculate TODAY position
5. Setup IntersectionObserver for TODAY line visibility
6. Render components

**Layout**:
```tsx
<div className="chronological-timeline">
  <ZoomControls ... />
  <div ref={scrollContainerRef} className="overflow-x-auto">
    <TimelineAxis ... />
    <TimelineNowLine ... />
    {swimlanes.map(lane => (
      <TimelineSwimlane key={lane.categoryId} ... />
    ))}
  </div>
  <JumpToTodayButton isVisible={!todayLineVisible} ... />
</div>
```

**Test**:
```bash
touch frontend/tests/components/timeline/ChronologicalTimeline.test.tsx
npm test -- ChronologicalTimeline.test.tsx
```

---

### Phase 7: Page Integration

**Priority**: P1 (Final step for MVP)

#### Step 7.1: Modify Timeline Page

**File**: `/frontend/src/pages/Timeline.tsx`

**Changes**:
1. Import ViewToggle and ChronologicalTimeline
2. Add view mode state (with useTimelineViewState hook)
3. Render ViewToggle above existing content
4. Conditionally render based on viewMode:
   - `viewMode === 'category'` → Existing Timeline component
   - `viewMode === 'timeline'` → New ChronologicalTimeline component
5. Keep EventList below (visible in both modes)

**Code**:
```typescript
import { ViewToggle } from '../components/timeline/ViewToggle';
import { ChronologicalTimeline } from '../components/timeline/ChronologicalTimeline';
import { useTimelineViewState } from '../hooks/useTimelineViewState';

function TimelinePage() {
  const { viewMode, setViewMode } = useTimelineViewState();
  const { data: events = [], isLoading } = useEvents();
  const { data: categories = [] } = useCategories();

  return (
    <Layout>
      <div className="timeline-page">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Timeline</h1>
          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
        </div>

        {viewMode === 'category' ? (
          <Timeline /> {/* Existing component */}
        ) : (
          <ChronologicalTimeline
            events={events}
            categories={categories}
            onEventClick={handleEventClick}
          />
        )}

        <EventList events={events} /> {/* Always visible */}
      </div>
    </Layout>
  );
}
```

#### Step 7.2: E2E Tests for P1 User Stories

**File**: `/frontend/tests/e2e/timeline-view.spec.ts`

```bash
touch frontend/tests/e2e/timeline-view.spec.ts
```

**Test Coverage**:
- ✅ User Story 1: View Events Chronologically
- ✅ User Story 2: Navigate Through Time
- ✅ User Story 4: Switch Between Views
- ✅ User Story 5: Interact with Events

**Run**:
```bash
npm run test:e2e -- timeline-view.spec.ts
```

---

### Phase 8: P2 User Stories (Enhancements)

**Priority**: P2 (Can be deferred if needed)

#### Enhancement 8.1: Visual Zoom (User Story 3)

**Changes**:
- Already implemented in ZoomControls (visualScale state)
- Verify +/− buttons update visualScale
- Verify position recalculation on scale change

**Test**:
- E2E test for visual zoom interactions

#### Enhancement 8.2: Mobile Responsiveness (User Story 6)

**Changes**:
- Add responsive Tailwind classes to all components
- Implement single-lane view on mobile (CSS: `md:grid-rows-auto lg:grid-rows-5`)
- Change ZoomControls to dropdown on mobile
- Always show JumpToTodayButton on mobile

**Test**:
- E2E test at 375px viewport width
- Test on real iOS/Android devices (optional, use BrowserStack)

---

### Phase 9: P3 User Stories (Polish)

**Priority**: P3 (Nice-to-have)

#### Polish 9.1: Connector Lines (User Story 7)

**Changes**:
- Update TimelineEventCard to render vertical connector line
- Style with category color at 50% opacity
- Use SVG line or CSS border-left

**Test**:
- Visual regression test (Playwright screenshots)

---

## Testing Strategy

### Unit Tests (Vitest)

**Run all unit tests**:
```bash
npm test
```

**Run specific test file**:
```bash
npm test -- TimelineSwimlane.test.tsx
```

**Watch mode** (re-run on file changes):
```bash
npm test -- --watch
```

**Coverage report**:
```bash
npm test -- --coverage
```

**Target Coverage**:
- Utilities: 100%
- Hooks: 90%+
- Components: 80%+

---

### E2E Tests (Playwright)

**Run all E2E tests**:
```bash
npm run test:e2e
```

**Run specific test file**:
```bash
npm run test:e2e -- timeline-view.spec.ts
```

**Interactive mode** (UI with step-through):
```bash
npm run test:e2e:ui
```

**Headed mode** (see browser):
```bash
npm run test:e2e -- --headed
```

**Debug mode**:
```bash
npm run test:e2e -- --debug
```

---

### Manual Testing Checklist

Before creating PR, manually verify:

- [ ] **User Story 1**: Switch to Timeline View → see swimlanes + chronological events
- [ ] **User Story 2**: Horizontal scroll works, time range zoom changes granularity
- [ ] **User Story 3**: Visual zoom (+/−) works, events scale correctly
- [ ] **User Story 4**: View toggle persists on refresh, filters maintained
- [ ] **User Story 5**: Click event → modal opens, edit/delete works
- [ ] **User Story 6**: Resize to 375px → mobile layout adapts
- [ ] **User Story 7**: Connector lines visible, color-coded
- [ ] **Edge Case**: 50 events same date → stacking works, "+N more" indicator
- [ ] **Edge Case**: Empty category → empty swimlane renders
- [ ] **Edge Case**: Safari Private Mode → no errors, fallback to TODAY
- [ ] **Edge Case**: Switch views with modal open → modal stays open

---

## Debugging Tips

### Timeline Not Rendering

**Symptoms**: Blank screen or error in console

**Checklist**:
1. Check browser console for errors
2. Verify `calculateDateRange` returns valid dates:
   ```typescript
   console.log('Date range:', calculateDefaultDateRange());
   ```
3. Ensure events have valid `date` fields (not null/undefined)
4. Check React Query loading state:
   ```typescript
   console.log('Events:', events, 'Loading:', isLoading);
   ```

---

### Event Positioning Incorrect

**Symptoms**: Events overlap, misaligned, or missing

**Debug Steps**:
1. Log position calculations:
   ```typescript
   const positions = calculateEventPositions(...);
   console.table(positions);
   ```
2. Verify `pixelsPerDay` matches zoom level:
   ```typescript
   console.log('Pixels per day:', getPixelsPerDay(zoomLevel, visualScale));
   ```
3. Check for timezone issues (use UTC):
   ```typescript
   console.log('Event date (UTC):', event.date.toISOString());
   ```
4. Inspect DOM element positions (Chrome DevTools):
   - Right-click event card → Inspect
   - Check `left`, `top`, `transform` styles

---

### Scroll Position Not Persisting

**Symptoms**: Scroll resets to start on page refresh

**Debug Steps**:
1. Check localStorage in DevTools:
   - Application tab → Local Storage
   - Look for key `timeline-view-state`
2. Verify JSON is valid:
   ```typescript
   const saved = localStorage.getItem('timeline-view-state');
   console.log('Saved state:', JSON.parse(saved));
   ```
3. Check for localStorage errors (Safari Private Mode):
   ```typescript
   try {
     localStorage.setItem('test', '1');
     console.log('localStorage available');
   } catch (error) {
     console.error('localStorage unavailable:', error);
   }
   ```
4. Clear localStorage and test initial load:
   ```bash
   localStorage.clear();
   location.reload();
   ```

---

### Performance Issues / Laggy Scrolling

**Symptoms**: Scroll stutters, high CPU usage, slow zoom changes

**Debug Steps**:
1. Open Chrome DevTools Performance tab
2. Record while scrolling/zooming
3. Look for:
   - Long tasks (>50ms)
   - Excessive renders (check React DevTools Profiler)
   - Layout thrashing (Recalculate Style, Layout events)
4. Check memoization:
   ```typescript
   // Add logging to useMemo
   const positions = useMemo(() => {
     console.log('Recalculating positions'); // Should only log when dependencies change
     return calculateEventPositions(...);
   }, [events, startDate, endDate, pixelsPerDay]);
   ```
5. Verify passive scroll listeners:
   ```typescript
   element.addEventListener('scroll', handler, { passive: true });
   ```

---

### Animation Jank (TODAY Line)

**Symptoms**: Choppy pulse/glow animation, scroll feels slow

**Debug Steps**:
1. Check GPU acceleration (Chrome DevTools Layers tab):
   - Timeline element should show "Compositing Reasons: will-change"
2. Verify CSS keyframes use only `transform` and `opacity`
3. Remove `will-change` from static elements:
   ```css
   /* WRONG: Always on */
   .today-line { will-change: transform; }

   /* RIGHT: Only during animation */
   .today-line:hover { will-change: transform; }
   ```
4. Test FPS (Chrome DevTools Performance → FPS meter)

---

## Key Files Reference

### Source Files

| File | Purpose |
|------|---------|
| `/frontend/src/components/timeline/ViewToggle.tsx` | View mode tabs |
| `/frontend/src/components/timeline/ChronologicalTimeline.tsx` | Main orchestrator |
| `/frontend/src/components/timeline/TimelineAxis.tsx` | Date ruler |
| `/frontend/src/components/timeline/TimelineNowLine.tsx` | TODAY indicator |
| `/frontend/src/components/timeline/TimelineSwimlane.tsx` | Category lane |
| `/frontend/src/components/timeline/TimelineEventCard.tsx` | Event card |
| `/frontend/src/components/timeline/ZoomControls.tsx` | Zoom buttons |
| `/frontend/src/components/timeline/JumpToTodayButton.tsx` | Scroll to today |
| `/frontend/src/utils/timelineCalculations.ts` | Position calculations |
| `/frontend/src/hooks/useTimelineViewState.ts` | View state management |
| `/frontend/src/hooks/useScrollRestoration.ts` | Scroll persistence |
| `/frontend/src/styles/timeline-animations.css` | CSS animations |

### Test Files

| File | Purpose |
|------|---------|
| `/frontend/tests/components/timeline/*.test.tsx` | Component unit tests |
| `/frontend/tests/utils/timelineCalculations.test.ts` | Utility tests |
| `/frontend/tests/hooks/*.test.ts` | Hook tests |
| `/frontend/tests/e2e/timeline-view.spec.ts` | E2E tests |

### Documentation

| File | Purpose |
|------|---------|
| `/specs/001-timeline-view/spec.md` | Requirements |
| `/specs/001-timeline-view/plan.md` | Implementation plan |
| `/specs/001-timeline-view/research.md` | Technical decisions |
| `/specs/001-timeline-view/data-model.md` | View models |
| `/specs/001-timeline-view/quickstart.md` | This file |

---

## Next Steps After Completion

### 1. Run Full Test Suite

```bash
# Unit tests
cd frontend && npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### 2. Performance Validation

Verify all Success Criteria (SC-001 through SC-014 in spec.md):

```bash
# Chrome DevTools Performance tab
# Record while:
# - Initial render (target: <2s)
# - Zoom change (target: <1s)
# - Scroll with 200 events (target: 60fps)
```

### 3. Browser Compatibility Testing

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### 4. Responsive Testing

Test at breakpoints:
- ✅ Desktop: 1920px, 1440px, 1280px
- ✅ Tablet: 1024px, 768px
- ✅ Mobile: 640px, 414px, 375px

### 5. Create Pull Request

```bash
# Ensure branch is up to date
git fetch origin
git rebase origin/main

# Push feature branch
git push origin 001-timeline-view

# Create PR via GitHub UI or gh CLI:
gh pr create --title "Add chronological timeline view" --body "$(cat <<EOF
## Summary
Implements chronological timeline view with category swimlanes, dual zoom, and animated TODAY indicator.

## Checklist
- [x] All 7 user stories implemented and tested
- [x] 14 success criteria verified
- [x] Unit tests pass (coverage >80%)
- [x] E2E tests pass
- [x] Performance targets met (<2s render, 60fps scroll)
- [x] Browser compatibility tested
- [x] Mobile responsive (375px minimum)

## Demo
[Include screenshots or video]

## Related
- Spec: /specs/001-timeline-view/spec.md
- Plan: /specs/001-timeline-view/plan.md
EOF
)"
```

### 6. Update Main Documentation

After PR merge, update:
- `/README.md` - Add timeline view to feature list
- `/PROJECT.md` - Document timeline view implementation
- `/CLAUDE.md` - Add timeline component structure reference

---

## Getting Help

### Common Issues

1. **"Cannot find module 'date-fns'"**
   - Run `npm install` in `/frontend` directory
   - Verify `package.json` includes date-fns@3.0.6

2. **"localStorage is not defined"**
   - This is expected in Node.js test environment
   - Use happy-dom or jsdom (already configured in Vitest)

3. **"IntersectionObserver is not defined"**
   - Install Playwright or add polyfill for tests
   - Production browsers all support IntersectionObserver

4. **Type errors in components**
   - Ensure `/frontend/src/types/timeline.ts` is created
   - Run `npm run type-check` for detailed errors

### Resources

- **Implementation Plan**: `/specs/001-timeline-view/plan.md`
- **Research Findings**: `/specs/001-timeline-view/research.md`
- **Data Models**: `/specs/001-timeline-view/data-model.md`
- **API Contracts**: `/specs/001-timeline-view/contracts/`
- **Project Constitution**: `/.specify/memory/constitution.md`

---

**Last Updated**: 2025-10-18
**Status**: Ready for Development
**Estimated Effort**: 3-5 days for P1 stories
