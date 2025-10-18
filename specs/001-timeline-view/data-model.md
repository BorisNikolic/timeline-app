# Data Model: Chronological Timeline View

**Feature**: Timeline View
**Date**: 2025-10-18
**Status**: Design Complete

## Overview

This document defines the view models and data structures used in the chronological timeline view. All entities are **view models** (derived from existing database entities) with no database schema changes required.

---

## Entity: TimelineViewState

**Type**: Client-side state (persisted in localStorage)

**Description**: Represents the user's current timeline view configuration, including view mode, zoom levels, scroll position, and user preferences.

**Fields**:

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| `viewMode` | `'category' \| 'timeline'` | `'category'` | Must be one of two values | Selected view mode |
| `zoomLevel` | `'day' \| 'week' \| 'month' \| 'quarter'` | `'month'` | Must be one of four values | Time range zoom level |
| `visualScale` | `number` | `1.0` | `0.5 <= value <= 2.0` | Visual scaling factor |
| `scrollPosition` | `number` | `0` | `value >= 0` | Horizontal scroll offset in pixels |
| `timestamp` | `number` | `Date.now()` | Must be valid epoch ms | Last update timestamp for cache invalidation |

**Validation Rules**:
- `visualScale` must be between 0.5 and 2.0 (inclusive)
- `scrollPosition` must be >= 0 (browser clamps to valid range automatically)
- `zoomLevel` must be one of the four defined values
- `timestamp` used to detect stale state (optional, for future cache invalidation)

**Storage**: localStorage key `timeline-view-state`

**Lifecycle**:
1. **Load**: Read from localStorage on component mount
2. **Update**: On user interaction (view toggle, zoom change, scroll)
3. **Persist**: Throttled writes to localStorage (150ms debounce)
4. **Clear**: On logout or user requests reset

**Relationships**: None (client-side only, no database entity)

**TypeScript Interface**:
```typescript
interface TimelineViewState {
  viewMode: 'category' | 'timeline';
  zoomLevel: 'day' | 'week' | 'month' | 'quarter';
  visualScale: number;
  scrollPosition: number;
  timestamp: number;
}
```

---

## Entity: CategorySwimlane

**Type**: View Model (derived from Category + Event entities)

**Description**: Represents a horizontal lane in the timeline view containing events for a specific category, ordered alphabetically by category name (per clarification).

**Fields**:

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `categoryId` | `string` (UUID) | Category.id | Category identifier |
| `categoryName` | `string` | Category.name | Display name |
| `categoryColor` | `string` (#RRGGBB) | Category.color | HEX color code for visual identification |
| `eventCount` | `number` | Computed | Total events in this category (for display) |
| `events` | `Event[]` | Filtered/joined | Events belonging to this category |
| `sortOrder` | `number` | Computed | Alphabetical sort position (0-based index) |

**Derivation Logic**:
```typescript
function deriveCategorySwimlanes(
  categories: Category[],
  events: Event[]
): CategorySwimlane[] {
  // Sort categories alphabetically (clarification requirement)
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return sortedCategories.map((category, index) => ({
    categoryId: category.id,
    categoryName: category.name,
    categoryColor: category.color,
    eventCount: events.filter(e => e.categoryId === category.id).length,
    events: events.filter(e => e.categoryId === category.id),
    sortOrder: index
  }));
}
```

**Validation Rules**:
- `events` must be sorted by date, then by time (earliest first) - per clarification
- `sortOrder` must match alphabetical sort of category name
- `categoryColor` must be valid HEX color (#RRGGBB format)

**Relationships**:
- **Derives from**: `Category` (1:1) + `Event` (1:N)
- **Used by**: `ChronologicalTimeline` component to render swimlanes

---

## Entity: TimelineEventCard

**Type**: View Model (derived from Event entity with positioning calculations)

**Description**: Represents an event's visual representation in the timeline with calculated X/Y positions for rendering.

**Fields**:

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `eventId` | `string` (UUID) | Event.id | Event identifier |
| `title` | `string` | Event.title | Event title (truncated to 50 chars for display) |
| `date` | `Date` | Event.date | Event date |
| `time` | `string?` | Event.time (optional) | Event time for stacking order (HH:MM format) |
| `priority` | `'High' \| 'Medium' \| 'Low'` | Event.priority | Priority level |
| `status` | `'Not Started' \| 'In Progress' \| 'Completed'` | Event.status | Completion status |
| `categoryColor` | `string` (#RRGGBB) | Category.color (joined) | Category color for visual coding |
| `xPosition` | `number` | Computed | Horizontal position in pixels from timeline start |
| `yPosition` | `number` | Computed | Vertical offset in pixels from swimlane centerline |
| `position` | `'above' \| 'below'` | Computed | Which side of centerline (alternating pattern) |
| `stackIndex` | `number` | Computed | Vertical stacking offset for same-date events (0-based) |

**Derivation Logic**:
```typescript
function deriveTimelineEventCard(
  event: Event,
  category: Category,
  startDate: Date,
  endDate: Date,
  pixelsPerDay: number,
  stackInfo: { position: 'above' | 'below'; stackIndex: number }
): TimelineEventCard {
  const xPosition = calculateEventX(event.date, startDate, endDate, pixelsPerDay);
  const yOffset = stackInfo.stackIndex * (EVENT_CARD_HEIGHT + STACK_SPACING);

  return {
    eventId: event.id,
    title: event.title.substring(0, 50),
    date: event.date,
    time: event.time,
    priority: event.priority,
    status: event.status,
    categoryColor: category.color,
    xPosition,
    yPosition: yOffset,
    position: stackInfo.position,
    stackIndex: stackInfo.stackIndex
  };
}
```

**Validation Rules**:
- `xPosition` must be within calculated timeline bounds (0 to timelineWidth)
- `yPosition` alternates above/below for adjacent events (even index = above, odd = below)
- `stackIndex` follows time-based sort within same-date group (earliest at bottom) - per clarification
- `title` truncated with ellipsis if exceeds 50 characters

**Relationships**:
- **Derives from**: `Event` (1:1) + `Category` (N:1 for color lookup)
- **Used by**: `TimelineEventCard` component for rendering

---

## Entity: TimeAxis

**Type**: View Model (computed from TimelineViewState)

**Description**: Represents the horizontal date ruler configuration, including tick positions and labels based on zoom level.

**Fields**:

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `startDate` | `Date` | Computed | Left boundary of visible range (default: 2 weeks before today) |
| `endDate` | `Date` | Computed | Right boundary of visible range (default: 2 months after today) |
| `granularity` | `'hour' \| 'day' \| 'week' \| 'month'` | Mapped from zoomLevel | Tick spacing unit |
| `tickPositions` | `AxisTick[]` | Computed | Array of date markers with labels and positions |
| `pixelsPerDay` | `number` | Computed from zoomLevel + visualScale | Scale factor for positioning |

**AxisTick Sub-Entity**:
```typescript
interface AxisTick {
  date: Date;           // Tick date
  label: string;        // Formatted label (e.g., "Jan 15", "Mon 10", "3:00 PM")
  x: number;            // Horizontal position in pixels
  isPrimary: boolean;   // Major vs minor tick (for styling)
}
```

**Derivation Logic**:
```typescript
function deriveTimeAxis(
  startDate: Date,
  endDate: Date,
  zoomLevel: ZoomLevel,
  visualScale: number
): TimeAxis {
  const granularity = ZOOM_TO_GRANULARITY[zoomLevel]; // day -> hour, week -> day, etc.
  const pixelsPerDay = getPixelsPerDay(zoomLevel, visualScale);
  const tickPositions = generateAxisTicks(startDate, endDate, granularity, pixelsPerDay);

  return {
    startDate,
    endDate,
    granularity,
    tickPositions,
    pixelsPerDay
  };
}

// Example: Month view with 5px/day base scale
// pixelsPerDay = 5 * 1.0 (default scale) = 5px/day
// 60-day range = 300px total width
```

**Validation Rules**:
- `startDate` must be before `endDate`
- `granularity` must match `zoomLevel` mapping (day→hour, week→day, month→week, quarter→month)
- `tickPositions` must be evenly spaced based on granularity
- `pixelsPerDay` must be > 0

**Granularity Mapping**:
```typescript
const ZOOM_TO_GRANULARITY: Record<ZoomLevel, Granularity> = {
  day: 'hour',      // Day view shows hourly ticks
  week: 'day',      // Week view shows daily ticks
  month: 'week',    // Month view shows weekly ticks
  quarter: 'month'  // Quarter view shows monthly ticks
};
```

**Relationships**:
- **Derives from**: `TimelineViewState` (zoomLevel, visualScale)
- **Used by**: `TimelineAxis` component for rendering date labels

---

## Entity: TodayMarker

**Type**: View Model (computed from current date)

**Description**: Represents the animated "TODAY" vertical line indicator position and visibility state.

**Fields**:

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `date` | `Date` | `new Date()` | Today's date (normalized to midnight UTC) |
| `xPosition` | `number` | Computed | Horizontal position on timeline in pixels |
| `isVisible` | `boolean` | IntersectionObserver | Whether marker is currently in viewport |

**Derivation Logic**:
```typescript
function deriveTodayMarker(
  startDate: Date,
  endDate: Date,
  pixelsPerDay: number,
  scrollContainer: HTMLElement | null
): TodayMarker {
  const today = startOfDay(new Date()); // Normalize to midnight
  const xPosition = calculateEventX(today, startDate, endDate, pixelsPerDay);

  // isVisible determined by IntersectionObserver (see research.md section 4)
  const isVisible = checkVisibility(xPosition, scrollContainer);

  return {
    date: today,
    xPosition,
    isVisible
  };
}
```

**Validation Rules**:
- `date` must be current date (no time component, midnight UTC)
- `xPosition` recalculated on zoom/scale changes
- `isVisible` triggers "Jump to Today" button appearance

**Relationships**:
- **Derives from**: Current system date
- **Used by**: `TimelineNowLine` component + `JumpToTodayButton` visibility logic

---

## View Model Dependency Graph

```
TimelineViewState (localStorage)
  │
  ├─> TimeAxis (date range + ticks)
  │     └─> AxisTick[] (tick positions)
  │
  └─> TodayMarker (current date position)

Category (DB) + Event[] (DB)
  │
  └─> CategorySwimlane[] (grouped events)
        │
        └─> TimelineEventCard[] (positioned events)
              └─> Requires: TimeAxis.pixelsPerDay, TimeAxis.startDate, TimeAxis.endDate
```

**Calculation Order**:
1. **Load**: TimelineViewState from localStorage
2. **Compute**: TimeAxis (date range, pixels per day)
3. **Derive**: CategorySwimlane[] (group events by category, sort alphabetically)
4. **Calculate**: TimelineEventCard[] positions (X from date, Y from stacking)
5. **Compute**: TodayMarker position
6. **Render**: Components consume view models

---

## Performance Considerations

### Memoization Strategy

**React.useMemo for expensive calculations**:
```typescript
const timeAxis = useMemo(
  () => deriveTimeAxis(startDate, endDate, zoomLevel, visualScale),
  [startDate, endDate, zoomLevel, visualScale]
);

const swimlanes = useMemo(
  () => deriveCategorySwimlanes(categories, events),
  [categories, events]
);

const eventPositions = useMemo(
  () => calculateEventPositions(swimlanes, timeAxis),
  [swimlanes, timeAxis]
);
```

**Why memoize**:
- Position calculations run on every render
- 200 events × 2 calculations = 400 operations
- Memoization caches results until dependencies change
- Expected savings: 80-95% of recalculations eliminated

### Virtual Scrolling (Future Optimization)

**If >200 events or >10 categories**:
```typescript
// Only render visible events within horizontal viewport
const visibleEvents = eventPositions.filter(pos => {
  const isInViewport =
    pos.xPosition >= scrollLeft - BUFFER &&
    pos.xPosition <= scrollLeft + viewportWidth + BUFFER;
  return isInViewport;
});
```

**Buffer**: 500px on each side for smooth scrolling

---

## Data Flow Diagram

```
User Interaction (zoom, scroll, view toggle)
  │
  ├─> Update TimelineViewState
  │     │
  │     └─> Persist to localStorage (throttled)
  │
  └─> Trigger React re-render
        │
        ├─> Recalculate TimeAxis (if zoom/scale changed)
        │
        ├─> Recalculate TimelineEventCard positions (if axis changed)
        │
        ├─> Recalculate TodayMarker (if axis changed)
        │
        └─> Render updated view
```

---

## TypeScript Definitions

```typescript
// /frontend/src/types/timeline.ts

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';
export type Granularity = 'hour' | 'day' | 'week' | 'month';
export type EventPosition = 'above' | 'below';

export interface TimelineViewState {
  viewMode: 'category' | 'timeline';
  zoomLevel: ZoomLevel;
  visualScale: number;
  scrollPosition: number;
  timestamp: number;
}

export interface CategorySwimlane {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  eventCount: number;
  events: Event[];
  sortOrder: number;
}

export interface TimelineEventCard {
  eventId: string;
  title: string;
  date: Date;
  time?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  categoryColor: string;
  xPosition: number;
  yPosition: number;
  position: EventPosition;
  stackIndex: number;
}

export interface AxisTick {
  date: Date;
  label: string;
  x: number;
  isPrimary: boolean;
}

export interface TimeAxis {
  startDate: Date;
  endDate: Date;
  granularity: Granularity;
  tickPositions: AxisTick[];
  pixelsPerDay: number;
}

export interface TodayMarker {
  date: Date;
  xPosition: number;
  isVisible: boolean;
}
```

---

## Validation & Testing

### Unit Test Coverage

**View Model Derivation**:
- ✅ `deriveCategorySwimlanes`: Alphabetical sorting, event filtering
- ✅ `deriveTimelineEventCard`: Position calculations, stacking logic
- ✅ `deriveTimeAxis`: Tick generation, granularity mapping
- ✅ `deriveTodayMarker`: Current date normalization, position calculation

**Edge Cases**:
- ✅ Empty categories (0 events) → Display empty swimlane
- ✅ Single event on date → stackIndex = 0, position = 'above'
- ✅ 50+ events on same date → Stacking limit + overflow indicator
- ✅ Out-of-range events → Clamped to timeline boundaries

### Integration Test Coverage

**React Query Integration**:
- ✅ View models update when event data refetches
- ✅ Loading states handled gracefully
- ✅ Error states display user-friendly messages

**localStorage Integration**:
- ✅ TimelineViewState persists across page refreshes
- ✅ Graceful fallback when localStorage unavailable
- ✅ Quota exceeded handling (clear old data, retry)

---

**Data Model Status**: ✅ Complete
**Ready for Implementation**: Yes
**Next Step**: Create API contracts and component interfaces
