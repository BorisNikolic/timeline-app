# Feature Specification: Chronological Timeline View

**Feature Branch**: `001-timeline-view`
**Created**: 2025-10-18
**Status**: Draft
**Input**: User description: "We are building a visual timeline feature, read more @TIMELINE_VIEW_PLAN.md"

## Clarifications

### Session 2025-10-18

- Q: How should category swimlanes be ordered vertically in the timeline view? → A: Alphabetical by category name
- Q: When multiple events occur on the same date within a category, in what order should they be stacked vertically? → A: Chronological by event time (earliest at bottom, latest at top)
- Q: Should the timeline always center on TODAY on initial load, or should it remember and restore the user's last scroll position? → A: Remember and restore last scroll position (with "center on TODAY" as fallback for first visit)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Events Chronologically by Category (Priority: P1)

As a festival organizer, I need to see all festival tasks arranged chronologically within category swimlanes so I can understand when different types of activities occur relative to each other and identify scheduling conflicts or gaps.

**Why this priority**: This is the core value proposition of the timeline view - providing chronological context that the existing category view lacks. Without this, the timeline view offers no additional value.

**Independent Test**: Can be fully tested by navigating to the timeline, switching to Timeline View, and verifying that events appear in chronological order within their category lanes, delivering immediate temporal context.

**Acceptance Scenarios**:

1. **Given** I am on the festival timeline page with events in multiple categories, **When** I switch to Timeline View, **Then** I see horizontal category swimlanes with events positioned chronologically along a time axis
2. **Given** I have events in Entertainment, Logistics, and Security categories, **When** I view the timeline, **Then** each category appears as a separate horizontal lane with its color and name visible
3. **Given** multiple events exist on the same date in one category, **When** viewing the timeline, **Then** events stack vertically within the lane and alternate above/below a centerline to maximize readability
4. **Given** I am viewing the timeline, **When** I look at today's date, **Then** I see an animated vertical "TODAY" line with a pulse effect crossing all category lanes

---

### User Story 2 - Navigate Through Time (Priority: P1)

As a festival organizer, I need to pan horizontally through time and adjust the visible time range so I can focus on specific planning periods (upcoming week, next month, entire festival timeline).

**Why this priority**: Without navigation, users can only see a fixed time window. Navigation is essential for the timeline to be useful beyond the default 2-week/2-month range.

**Independent Test**: Can be fully tested by scrolling horizontally, clicking time range buttons (Day/Week/Month/Quarter), and verifying the timeline adjusts the visible window and date granularity accordingly.

**Acceptance Scenarios**:

1. **Given** I am viewing the timeline, **When** I scroll horizontally left or right, **Then** the timeline pans smoothly through past or future dates
2. **Given** I am viewing the Month time range, **When** I click the "Week" button, **Then** the timeline zooms to show one week centered on today with daily date markers
3. **Given** I am viewing the timeline, **When** I click the "Day" button, **Then** the timeline shows today with hourly granularity
4. **Given** I am viewing the timeline, **When** I click the "Quarter" button, **Then** the timeline shows a 3-month period with weekly date markers
5. **Given** the TODAY line is off-screen, **When** I look for navigation aids, **Then** I see a "Jump to Today" floating button that scrolls the timeline to center on today when clicked

---

### User Story 3 - Adjust Visual Density (Priority: P2)

As a festival organizer, I need to zoom in and out of the timeline visually so I can see more detail on crowded periods or get a higher-level overview of sparse periods.

**Why this priority**: Enhances usability for timelines with varying event density, but the feature is usable without it since time range zoom (P1) provides basic density control.

**Independent Test**: Can be fully tested by clicking the visual zoom buttons (+/−) and verifying event cards and spacing scale proportionally while maintaining the same time range.

**Acceptance Scenarios**:

1. **Given** I am viewing the timeline at default scale, **When** I click the "+" zoom button, **Then** event cards and spacing increase in size (up to 2x scale) without changing the time range shown
2. **Given** I am viewing the timeline at 2x scale, **When** I click the "−" zoom button, **Then** event cards and spacing decrease in size (down to 0.5x scale)
3. **Given** I am viewing the timeline at a non-default scale, **When** I click the "Reset" button, **Then** the visual scale returns to 1.0x (default)
4. **Given** I zoom in visually, **When** viewing the timeline, **Then** I can see more detail on event cards and the timeline requires more horizontal scrolling

---

### User Story 4 - Switch Between Category and Timeline Views (Priority: P1)

As a festival organizer, I need to toggle between the existing Category View (vertical grouping) and the new Timeline View (chronological) so I can choose the organization method that best suits my current task.

**Why this priority**: Essential for maintaining backward compatibility and allowing users to benefit from both organizational paradigms without losing access to the familiar interface.

**Independent Test**: Can be fully tested by clicking view toggle tabs and verifying the interface switches between the two views while preserving the event list below and maintaining selected filters.

**Acceptance Scenarios**:

1. **Given** I am on the Timeline page, **When** I see the view controls, **Then** I see two tabs labeled "Category View" and "Timeline View" next to the page heading
2. **Given** I am viewing Category View (default), **When** I click the "Timeline View" tab, **Then** the interface switches to the chronological timeline with category swimlanes
3. **Given** I am viewing Timeline View, **When** I click the "Category View" tab, **Then** the interface switches back to the vertical category lanes
4. **Given** I have filters or sort settings applied, **When** I switch between views, **Then** my filters and sort settings persist
5. **Given** I switch to Timeline View, **When** I refresh the page, **Then** my view preference is remembered (via localStorage)
6. **Given** I am viewing Timeline View and scroll to a specific date, **When** I refresh the page or return later, **Then** the timeline restores my last scroll position

---

### User Story 5 - Interact with Events in Timeline (Priority: P1)

As a festival organizer, I need to click on event cards in the timeline to view details, edit them, or delete them so I can manage events directly from the chronological view.

**Why this priority**: Without interaction, the timeline is read-only and provides no workflow value beyond visualization. This is essential for basic usability.

**Independent Test**: Can be fully tested by clicking event cards in the timeline and verifying the existing event modal opens with full edit/delete capabilities.

**Acceptance Scenarios**:

1. **Given** I am viewing the timeline, **When** I click on any event card, **Then** the event detail modal opens showing full event information
2. **Given** the event modal is open from the timeline, **When** I edit and save the event, **Then** the timeline updates immediately to reflect the new date, category, or details
3. **Given** the event modal is open from the timeline, **When** I delete the event, **Then** the event disappears from the timeline and the modal closes
4. **Given** I hover over an event card, **When** viewing the card, **Then** I see a visual hover effect (shadow lift) indicating it's interactive

---

### User Story 6 - Responsive Timeline on Mobile (Priority: P2)

As a festival organizer using a mobile device, I need the timeline view to adapt to smaller screens so I can access chronological planning on the go.

**Why this priority**: Important for accessibility and modern web expectations, but desktop users (primary audience for complex planning tools) get full value without this.

**Independent Test**: Can be fully tested by resizing the browser to mobile width (375px) and verifying the timeline remains usable with adapted controls and layout.

**Acceptance Scenarios**:

1. **Given** I am viewing the timeline on a mobile device (375px width), **When** I view category swimlanes, **Then** I see one category lane at a time with vertical scrolling to access other categories
2. **Given** I am on mobile, **When** I use zoom controls, **Then** time range buttons appear as a compact dropdown menu instead of separate buttons
3. **Given** I am on mobile, **When** the TODAY line is off-screen, **Then** the "Jump to Today" button is always visible (not conditional)
4. **Given** I am on mobile, **When** I view event cards, **Then** cards are compact and readable with truncated text and tap targets at least 44px

---

### User Story 7 - Visual Clarity with Connector Lines (Priority: P3)

As a festival organizer, I want to see visual connector lines from event cards to the timeline axis so I can easily trace the exact date of events positioned above or below the centerline.

**Why this priority**: Nice-to-have enhancement for visual clarity, but date information is already available on event cards and the time axis. The timeline is functional without this.

**Independent Test**: Can be fully tested by viewing the timeline and verifying that vertical lines extend from each event card to the timeline axis in the card's category color.

**Acceptance Scenarios**:

1. **Given** I am viewing the timeline, **When** I look at an event card, **Then** I see a vertical dotted line connecting the card to the timeline axis
2. **Given** multiple events are positioned above and below the centerline, **When** viewing the timeline, **Then** each connector line is color-coded with its category color at 50% opacity
3. **Given** events are densely packed, **When** viewing connector lines, **Then** lines remain visible and distinguishable without excessive visual clutter

---

### Edge Cases

- **What happens when there are 50+ events in a single category on one day?** Events stack vertically with overflow scrolling within the swimlane, and visual zoom can be reduced to see more events simultaneously
- **What happens when a user has events spanning 2 years?** The Quarter time range provides the highest-level view; users scroll horizontally to navigate through the full range
- **What happens when there are no events in a category?** The category swimlane displays as empty with just the category name and color, maintaining visual consistency
- **What happens when the user's browser doesn't support IntersectionObserver?** The "Jump to Today" button remains always visible as a fallback
- **What happens when events have past dates (before today)?** Events appear to the left of the TODAY line in historical context, allowing review of completed tasks
- **How does the timeline handle very long event titles?** Event cards truncate titles with ellipsis, full title visible on hover or when modal opens
- **What happens when switching views while an event modal is open?** The modal remains open and functional; switching views does not close modals
- **What happens when a user zooms to Day view but has no events on that day?** The timeline shows an empty day with the axis and TODAY line visible, allowing users to add events for that date
- **How does horizontal scrolling perform with 200+ events?** Event rendering uses memoization and efficient positioning calculations to maintain smooth scrolling; virtualization is not needed as only visible events in viewport are rendered by browser

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a view toggle with two tabs: "Category View" and "Timeline View"
- **FR-002**: System MUST render category swimlanes as horizontal lanes, one per category, with category name, color, and event count displayed, ordered alphabetically by category name
- **FR-003**: System MUST position events chronologically along a horizontal time axis within their category swimlane
- **FR-004**: System MUST display a vertical "TODAY" line at the current date's position with a pulsing animation effect
- **FR-005**: System MUST restore the user's last scroll position on timeline load if available (persisted in localStorage), otherwise center the TODAY line on first visit
- **FR-006**: System MUST allow horizontal scrolling through past and future dates
- **FR-007**: System MUST provide time range zoom controls with four options: Day, Week, Month, Quarter
- **FR-008**: System MUST adjust date axis granularity based on selected time range (hourly for Day, daily for Week, weekly for Month, monthly for Quarter)
- **FR-009**: System MUST provide visual zoom controls (+, Reset, −) that scale event cards and spacing from 0.5x to 2.0x
- **FR-010**: System MUST alternate event cards above and below a centerline within each swimlane to maximize space utilization
- **FR-011**: System MUST stack events vertically when multiple events occur on the same date within a category, ordered chronologically by event time (earliest at bottom, latest at top)
- **FR-012**: System MUST display event cards with title, date, priority badge, and status icon
- **FR-013**: System MUST render vertical connector lines from event cards to the timeline axis
- **FR-014**: System MUST open the event detail modal when a user clicks on any event card
- **FR-015**: System MUST show a "Jump to Today" floating button when the TODAY line is not visible in the viewport
- **FR-016**: System MUST smoothly scroll to center the TODAY line when the "Jump to Today" button is clicked
- **FR-017**: System MUST persist the user's view preference (Category vs Timeline) in localStorage
- **FR-018**: System MUST load with a default visible range of 2 weeks before today and 2 months after today
- **FR-019**: System MUST maintain the event list section below the timeline in both Category and Timeline views
- **FR-020**: System MUST adapt timeline layout for mobile devices (375px minimum width) with single-lane visibility and vertical scrolling between categories
- **FR-021**: System MUST preserve applied filters and sort settings when switching between views
- **FR-022**: System MUST update the timeline immediately when an event is created, edited, or deleted
- **FR-023**: System MUST display events with category-colored left borders on event cards
- **FR-024**: System MUST show connector lines in category colors with 50% opacity
- **FR-025**: System MUST truncate long event titles with ellipsis on timeline cards
- **FR-026**: System MUST provide hover effects on event cards (shadow lift) to indicate interactivity

### Key Entities

- **Timeline View State**: Represents the user's current view configuration including:
  - Selected view mode (Category or Timeline)
  - Current zoom level (Day/Week/Month/Quarter)
  - Current visual scale (0.5x to 2.0x)
  - Current scroll position (persisted in localStorage, restored on load)
  - View preference persistence (view mode, zoom level, visual scale, scroll position)

- **Category Swimlane**: Represents a horizontal lane in the timeline containing:
  - Category identifier
  - Category name and color
  - Event count
  - Chronologically positioned events
  - Above/below centerline positioning logic
  - Swimlanes are ordered alphabetically by category name

- **Timeline Event Card**: Represents an event's visual representation in the timeline containing:
  - Event identifier and basic details (title, date, priority, status)
  - Chronological X position (calculated from date)
  - Vertical Y position (above/below centerline, stacking offset based on event time)
  - When stacked: ordered chronologically by event time (earliest at bottom, latest at top)
  - Connector line coordinates
  - Category color association

- **Time Axis**: Represents the horizontal timeline ruler containing:
  - Start and end date range
  - Date marker positions and labels
  - Granularity level (hourly/daily/weekly/monthly)
  - Scale factor for positioning calculations

- **TODAY Marker**: Represents the current date indicator containing:
  - Current date position
  - Visibility state
  - Animation state

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between Category View and Timeline View in under 1 second with no visible lag
- **SC-002**: Timeline View renders and displays all events within 2 seconds for timelines containing up to 200 events
- **SC-003**: Users can identify the current date (TODAY line) within 2 seconds of viewing the timeline
- **SC-004**: Users can navigate to any date within the default range (2 weeks before, 2 months after) using horizontal scroll within 5 seconds
- **SC-005**: Clicking an event card opens the event detail modal within 500ms
- **SC-006**: The "Jump to Today" button returns users to the current date within 1 second with smooth scrolling
- **SC-007**: Time range changes (Day/Week/Month/Quarter) recalculate and re-render the timeline within 1 second
- **SC-008**: Visual zoom adjustments (+/− buttons) update the timeline scale within 500ms
- **SC-009**: The timeline remains usable and readable on mobile devices at 375px width with all core interactions accessible
- **SC-010**: User view preference (Category vs Timeline) persists across browser sessions 100% of the time
- **SC-011**: 90% of users can successfully locate and interact with an event in Timeline View on their first attempt
- **SC-012**: Horizontal scrolling remains smooth (60fps) with up to 200 events displayed
- **SC-013**: Event positions update immediately (within 500ms) after an event is edited or created
- **SC-014**: Events with the same date in a category stack without overlapping, maintaining visual clarity for up to 10 events on the same date

### Assumptions

- Users have a modern browser with ES6 support and IntersectionObserver API (fallback provided for "Jump to Today" button)
- The festival planning period typically spans 3-6 months, making the default 2.5-month view reasonable
- Users will primarily use desktop/tablet devices for complex timeline planning (mobile support is supplementary)
- Existing event data includes accurate dates for chronological positioning
- Users are familiar with the existing Category View and event management workflows
- Performance targets assume typical festival timelines with 50-200 total events across 5-10 categories
- The current date (TODAY) is relevant and users will frequently reference it during planning
- Users prefer smooth animations and visual feedback for navigation actions
- localStorage is available for persisting view preferences
- The existing event modal component can be reused without modification for timeline interactions

### Non-Functional Considerations

- **Performance**: Timeline rendering must handle up to 200 events without virtualization using efficient memoization and positioning calculations
- **Accessibility**: Keyboard navigation (arrow keys for scrolling), ARIA labels on controls, focus management for "Jump to Today" button
- **Browser Compatibility**: Must work on Chrome, Firefox, Safari, Edge (last 2 versions)
- **Responsiveness**: Must adapt to screen widths from 375px (mobile) to 1920px+ (desktop)
- **Animation Performance**: CSS keyframe animations for TODAY line must not impact scroll performance
- **Data Integrity**: Switching views must not cause data loss or state inconsistencies
