# Chronological Timeline View Implementation Plan

## Overview
Add a new chronological timeline view with category swimlanes, animated "TODAY" indicator, dual zoom (time range + visual scale), and horizontal scrolling. Keep both Category View (current) and Timeline View (new) accessible via tabs.

## Feature Requirements

### Visual Design
- **Category swimlanes** - Horizontal lanes for each category (Entertainment, Logistics, Marketing, Security, Venue Setup)
- **Horizontal timeline axis** - Date markers along top, auto-scaled based on zoom level
- **Animated NOW line** - Vertical line with pulse/glow effect, crosses all categories, initially centered
- **Event cards** - Positioned chronologically within swimlanes, alternating above/below centerline
- **Connector lines** - Vertical line from event card to timeline axis (lollipop style)
- **Default range** - 2 weeks before today, 2 months after today

### Interactions
- **View tabs** - Toggle between "Category View" and "Timeline View" (tabs next to "Timeline" heading)
- **Horizontal scroll** - Pan left/right through time
- **Dual zoom**:
  - Time range buttons: [Day] [Week] [Month] [Quarter]
  - Visual scale: [+] [-] buttons for zoom in/out
- **Jump to Today** - Sticky floating button (appears when TODAY line is off-screen)
- **Event click** - Open detail modal (existing functionality)

### Layout
- Tabs at top (next to heading)
- Timeline view with swimlanes (horizontally scrollable)
- Event List section below (same in both views)
- All responsive (mobile: stack categories, horizontal scroll)

---

## Implementation Steps

### Phase 1: Component Structure (New Files)

**1.1 Create ViewToggle component**
- File: `/frontend/src/components/timeline/ViewToggle.tsx`
- Props: `currentView`, `onViewChange`
- Renders tabs: "Category View" | "Timeline View"
- Styling: Active tab highlighted, inactive clickable

**1.2 Create ChronologicalTimeline component**
- File: `/frontend/src/components/timeline/ChronologicalTimeline.tsx`
- Main orchestrator for timeline view
- Manages: zoom levels, scroll position, date range
- Renders: TimelineAxis, TimelineSwimlane (per category), TimelineNowLine, ZoomControls, JumpToTodayButton

**1.3 Create TimelineAxis component**
- File: `/frontend/src/components/timeline/TimelineAxis.tsx`
- Props: `startDate`, `endDate`, `zoomLevel`, `scale`
- Renders date markers along horizontal axis
- Adapts granularity based on zoom (daily/weekly/monthly ticks)

**1.4 Create TimelineNowLine component**
- File: `/frontend/src/components/timeline/TimelineNowLine.tsx`
- Vertical line at today's date
- CSS animations: pulse effect (scale 1.0 → 1.05), glow (box-shadow)
- Fixed position within scrollable container

**1.5 Create TimelineSwimlane component**
- File: `/frontend/src/components/timeline/TimelineSwimlane.tsx`
- Props: `category`, `events`, `dateRange`, `scale`
- Renders category name + color + event count
- Positions events chronologically
- Alternates events above/below centerline
- Stacks events with same date vertically

**1.6 Create TimelineEventCard component**
- File: `/frontend/src/components/timeline/TimelineEventCard.tsx`
- Props: `event`, `position` (above/below), `xPosition`, `onClick`
- Compact card: title, date, priority badge, status icon
- Vertical connector line to axis
- Color-coded left border (category color)

**1.7 Create ZoomControls component**
- File: `/frontend/src/components/timeline/ZoomControls.tsx`
- Time range buttons: [Day] [Week] [Month] [Quarter]
- Visual scale buttons: [−] [Reset] [+]
- Positioned top-right of timeline

**1.8 Create JumpToTodayButton component**
- File: `/frontend/src/components/timeline/JumpToTodayButton.tsx`
- Floating button (fixed position)
- Shows only when TODAY line is off-screen (calculate with IntersectionObserver)
- Smooth scroll to center TODAY line on click

---

### Phase 2: State Management

**2.1 Add timeline view state**
- File: `/frontend/src/pages/Timeline.tsx`
- Add state: `viewMode` ('category' | 'timeline'), default 'category'
- Add state: `zoomLevel` ('day' | 'week' | 'month' | 'quarter'), default 'month'
- Add state: `visualScale` (number), default 1.0, range 0.5-2.0
- Persist `viewMode` preference in localStorage

**2.2 Date range calculations**
- Utility function: `calculateDateRange()`
- Returns: `startDate` (2 weeks before today), `endDate` (2 months after today)
- Adjust based on zoomLevel for better UX

---

### Phase 3: Layout Integration

**3.1 Update Timeline page**
- File: `/frontend/src/pages/Timeline.tsx`
- Add ViewToggle above existing content
- Conditionally render:
  - `viewMode === 'category'` → existing `<Timeline />` component
  - `viewMode === 'timeline'` → new `<ChronologicalTimeline />` component
- Keep EventList below in both modes

**3.2 Update Timeline component (existing)**
- No major changes, becomes "Category View"
- Ensure it works when toggled away and back

---

### Phase 4: Positioning Logic

**4.1 Event positioning algorithm**
- Function: `calculateEventPositions(events, startDate, endDate, scale)`
- For each category swimlane:
  - Sort events by date
  - Calculate X position based on date (linear scale)
  - Alternate above/below centerline
  - Stack events with same date (Y offset)
  - Return: `{ eventId, x, y, position: 'above'|'below' }`

**4.2 Scale calculations**
- Function: `getPixelsPerDay(zoomLevel, visualScale)`
- Day view: 100px/day × visualScale
- Week view: 20px/day × visualScale
- Month view: 5px/day × visualScale
- Quarter view: 2px/day × visualScale

---

### Phase 5: Styling & Animation

**5.1 Timeline container styles**
- Horizontal scroll container (overflow-x: auto)
- Fixed height per swimlane (e.g., 200px)
- Smooth scrolling (scroll-behavior: smooth)

**5.2 NOW line animation**
- CSS keyframe: `pulse` (scale + opacity)
- CSS keyframe: `glow` (box-shadow blur)
- Color: Orange/Red (#FF6B6B or #FF8C42)
- Z-index: Above events but below modals

**5.3 Connector line styles**
- Vertical line: 1-2px solid, category color with 50% opacity
- Connects card bottom edge to axis
- Dotted or dashed style

**5.4 Event card compact design**
- Max width: 180px
- Show: Title (truncated), Date, Priority badge, Status icon
- Hover: Slight lift (box-shadow)

---

### Phase 6: Responsive Design

**6.1 Desktop (1024px+)**
- All swimlanes visible
- Horizontal scroll for timeline
- Full zoom controls

**6.2 Tablet (640px - 1024px)**
- Swimlanes stack with less height
- Smaller event cards
- Simplified zoom controls

**6.3 Mobile (375px - 640px)**
- Single swimlane visible at a time (vertical scroll through categories)
- Horizontal scroll through time
- Compact zoom: dropdown instead of buttons
- Jump to Today always visible

---

### Phase 7: Testing & Polish

**7.1 Edge cases**
- Many events on same date (test stacking)
- Empty categories (show empty swimlane)
- Far future/past events (test scroll performance)
- Zoom to extremes (day view with 200 events)

**7.2 Performance**
- Virtualize swimlanes if > 10 categories
- Memo event position calculations
- Debounce scroll events

**7.3 Accessibility**
- Keyboard navigation (arrow keys to scroll)
- ARIA labels for zoom controls
- Focus management for Jump to Today

---

## File Changes Summary

### New Files (8)
1. `/frontend/src/components/timeline/ViewToggle.tsx`
2. `/frontend/src/components/timeline/ChronologicalTimeline.tsx`
3. `/frontend/src/components/timeline/TimelineAxis.tsx`
4. `/frontend/src/components/timeline/TimelineNowLine.tsx`
5. `/frontend/src/components/timeline/TimelineSwimlane.tsx`
6. `/frontend/src/components/timeline/TimelineEventCard.tsx`
7. `/frontend/src/components/timeline/ZoomControls.tsx`
8. `/frontend/src/components/timeline/JumpToTodayButton.tsx`

### Modified Files (1)
1. `/frontend/src/pages/Timeline.tsx` - Add view toggle, conditional rendering

### Utility Files (1, optional)
1. `/frontend/src/utils/timelineCalculations.ts` - Date range, positioning, scale functions

---

## Technical Decisions

**Libraries**: No external timeline libraries (keep dependencies minimal). Build with React + TailwindCSS + existing stack.

**Date handling**: Use native JavaScript Date, potentially `date-fns` for formatting (already likely in project).

**Scroll performance**: CSS `overflow-x: auto`, intersection observer for Jump to Today visibility.

**Animation**: CSS keyframes (lightweight, performant).

---

## Success Criteria

✅ Users can toggle between Category View (current) and Timeline View (new)
✅ Timeline View shows chronological positioning within category swimlanes
✅ TODAY line is visible, animated (pulse/glow), initially centered
✅ Events alternate above/below centerline, stack on same dates
✅ Horizontal scroll works smoothly
✅ Both time range zoom (Day/Week/Month/Quarter) AND visual zoom (+/−) work
✅ "Jump to Today" button appears when TODAY line is off-screen
✅ Event List remains below timeline in both views
✅ Mobile responsive (375px minimum width)
✅ All events clickable to open detail modal
✅ Default shows 2 weeks before, 2 months after today

---

## Design Decisions Summary

Based on user requirements:

1. **Approach**: Category swimlanes with chronological positioning (Approach 3)
2. **NOW line**: Animated pulse/glow, auto-scroll to keep TODAY centered initially
3. **Event density**: Stack vertically AND alternate above/below centerline
4. **View switcher**: Tabs above timeline (next to 'Timeline' heading)
5. **Scroll behavior**: Horizontal scroll with fixed viewport
6. **Zoom**: Both time range (Day/Week/Month/Quarter) AND visual scale (+/-)
7. **Jump to Today**: Sticky floating button (appears when TODAY off-screen)
8. **Event List**: Keep below timeline in both views
9. **Event connectors**: Vertical line from event card to axis
10. **Default range**: 2 weeks before, 2 months after today
