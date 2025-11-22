# Feature Specification: Multi-Timeline System

**Feature Branch**: `001-multi-timeline-system`
**Created**: 2025-11-21
**Status**: Draft
**Input**: Transform the Festival Timeline App from a single shared timeline to a multi-timeline system that supports multiple festivals per year, historical data preservation, and cross-timeline learning.

## Clarifications

### Session 2025-11-21

- Q: Should invitations require email delivery or use in-app mechanism? → A: In-app pending request; email is optional notification only.
- Q: Can timeline lifecycle states skip steps or must follow strict sequence? → A: Sequential with skip-ahead allowed; no backward transitions except Unarchive→Completed.
- Q: When is the optional email notification for invitations sent? → A: Email notifications are deferred to future iteration. MVP uses in-app pending requests only. No email infrastructure required for initial release.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Multiple Timelines (Priority: P1)

As a festival organizer, I need to create separate timelines for different festivals (e.g., "Spring Festival 2025", "Summer Fest 2025") so that I can plan multiple events per year without mixing their tasks and data.

**Why this priority**: This is the foundational capability. Without multiple timelines, no other features can function. It enables the core transformation from single to multi-timeline architecture.

**Independent Test**: Can be fully tested by creating 2-3 timelines with different names, date ranges, and colors, then verifying each timeline maintains its own events and categories separately.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the dashboard, **When** they click "Create Timeline" and enter name "Winter Gala 2025", date range Dec 15-18, and select purple theme color, **Then** a new timeline is created and appears in their timeline list with those settings.

2. **Given** a user with access to multiple timelines, **When** they switch between timelines, **Then** each timeline displays only its own events and categories.

3. **Given** a timeline owner, **When** they edit timeline settings (name, dates, color), **Then** changes are saved and reflected across all views.

4. **Given** a timeline owner, **When** they delete a timeline, **Then** the timeline and all its events/categories are permanently removed after confirmation.

---

### User Story 2 - Timeline Access Control and Team Collaboration (Priority: P1)

As a timeline owner, I need to invite team members with specific permission levels (Admin, Editor, Viewer) so that the right people can contribute appropriately to festival planning.

**Why this priority**: Equal priority with Story 1 because multi-user collaboration is essential for a festival planning tool. Without access control, timelines would either be fully open or fully private, neither suitable for team coordination.

**Independent Test**: Can be tested by creating a timeline, inviting users with different roles, and verifying each role can only perform their permitted actions.

**Acceptance Scenarios**:

1. **Given** a timeline owner, **When** they invite a user with "Editor" role, **Then** that user can view the timeline, create/edit/delete events, but cannot modify timeline settings or manage members.

2. **Given** a timeline owner, **When** they invite a user with "Viewer" role, **Then** that user can view events and export data, but cannot create, edit, or delete anything.

3. **Given** a timeline Admin, **When** they change another member's role from Editor to Viewer, **Then** that member's permissions are immediately restricted.

4. **Given** a user with no timeline access, **When** they attempt to view or access that timeline, **Then** they see an "Access Denied" message or the timeline doesn't appear in their list.

5. **Given** an Archived timeline, **When** a non-Admin user attempts to edit events, **Then** editing is blocked and they see a "Read-only" indicator.

---

### User Story 3 - Timeline Dashboard Overview (Priority: P2)

As a user managing multiple festivals, I need a dashboard showing all my accessible timelines with their status and progress so that I can quickly assess which festivals need attention.

**Why this priority**: High value for users with multiple timelines. Provides essential navigation and situational awareness, though the system can function without it using basic list navigation.

**Independent Test**: Can be tested by creating multiple timelines with different statuses and event completion rates, then verifying the dashboard accurately displays all metrics.

**Acceptance Scenarios**:

1. **Given** a user with access to 5 timelines, **When** they open the dashboard, **Then** they see a card grid showing all 5 timelines with name, color indicator, date range, status badge, and completion percentage.

2. **Given** timelines in various states, **When** viewing the dashboard, **Then** timelines are grouped by status: Active first, then Planning, then Archived (separate section).

3. **Given** the dashboard view, **When** user applies filters (Status: Planning, Year: 2025), **Then** only matching timelines are displayed.

4. **Given** a timeline card, **When** user clicks "Open", **Then** they navigate to that timeline's event view.

---

### User Story 4 - Quick Timeline Switching (Priority: P2)

As a user working on multiple festivals, I need a persistent timeline switcher in the header so that I can quickly jump between timelines without returning to the dashboard.

**Why this priority**: Significant productivity improvement for users managing multiple concurrent festivals. Reduces navigation friction considerably.

**Independent Test**: Can be tested by accessing multiple timelines and using the header dropdown to switch between them, verifying the UI updates correctly each time.

**Acceptance Scenarios**:

1. **Given** a logged-in user with timeline access, **When** they click the timeline switcher dropdown, **Then** they see a list of their accessible timelines with color indicators, grouped by status.

2. **Given** the timeline switcher open, **When** user types in the search box, **Then** timelines are filtered by name match.

3. **Given** user switches to "Summer Fest 2025" timeline, **When** they later log in again, **Then** the system automatically loads "Summer Fest 2025" (remembers last active timeline).

4. **Given** user's last timeline was deleted or access revoked, **When** they log in, **Then** they are directed to the timeline dashboard to select a new timeline.

---

### User Story 5 - Timeline Lifecycle Management (Priority: P2)

As a timeline owner, I need to update timeline status through its lifecycle (Planning -> Active -> Completed -> Archived) so that the system behavior adapts appropriately to each phase.

**Why this priority**: Important for organizing timelines and enabling retrospective features, though basic functionality works without explicit lifecycle states.

**Independent Test**: Can be tested by transitioning a timeline through all states and verifying the appropriate behaviors and restrictions at each stage.

**Acceptance Scenarios**:

1. **Given** a timeline in "Planning" status, **When** owner changes status to "Active", **Then** the status badge updates and the timeline moves to the "Active" section in dashboard/switcher.

2. **Given** a timeline in "Completed" status, **When** users view events, **Then** retrospective features (notes, outcome tags) become available.

3. **Given** a timeline in "Archived" status, **When** any non-Admin user attempts to edit, **Then** all edit actions are disabled with read-only indication.

4. **Given** an Admin viewing an archived timeline, **When** they click "Unarchive", **Then** the timeline returns to "Completed" status and editing is re-enabled.

---

### User Story 6 - Copy Timeline with Date Shifting (Priority: P3)

As a returning festival organizer, I need to copy an existing timeline to a new one with automatic date recalculation so that I can quickly start planning the next year's festival based on last year's success.

**Why this priority**: High value for repeat festivals but not essential for initial adoption. Users can manually recreate events if needed.

**Independent Test**: Can be tested by copying a timeline with 10+ events across multiple categories, specifying new festival dates, and verifying all events appear with correctly shifted dates.

**Acceptance Scenarios**:

1. **Given** "Summer Fest 2024" timeline (Jun 15-18) with 50 events, **When** user copies it to "Summer Fest 2025" with new dates Jun 14-17, **Then** all events are copied with dates shifted proportionally (1 day earlier).

2. **Given** the copy dialog, **When** user unchecks "Keep assigned persons", **Then** copied events have blank assignment fields.

3. **Given** the copy dialog, **When** user checks "Include retrospective notes", **Then** copied events include notes from the source timeline.

4. **Given** source events with various statuses, **When** timeline is copied, **Then** all copied events have status reset to "Not Started".

---

### User Story 7 - Timeline Templates (Priority: P3)

As an organization running similar festivals, I need to designate timelines as templates so that new festival organizers can start with proven event structures.

**Why this priority**: Valuable for organizations with standardized processes, but copy timeline functionality provides a workaround.

**Independent Test**: Can be tested by marking a timeline as template, verifying it appears in template section during new timeline creation, and creating a new timeline from it.

**Acceptance Scenarios**:

1. **Given** a completed timeline, **When** owner marks it as "Template", **Then** it appears in the templates section when any user creates a new timeline.

2. **Given** a user creating a new timeline, **When** they select a template, **Then** the new timeline is pre-populated with all events from the template (dates relative to new timeline's date range).

3. **Given** a template timeline, **When** changes are made to the template, **Then** existing timelines created from it are NOT affected (they are independent copies).

---

### User Story 8 - Post-Festival Retrospective (Priority: P3)

As a festival organizer who just completed an event, I need to add retrospective notes and outcome tags to events so that future planning can learn from what worked and what didn't.

**Why this priority**: Significant long-term value for organizational learning, but not essential for core planning functionality.

**Independent Test**: Can be tested by marking a timeline as Completed, adding notes and outcome tags to several events, then copying that timeline and verifying notes are preserved.

**Acceptance Scenarios**:

1. **Given** a timeline marked "Completed", **When** user views an event, **Then** they see fields for "Retrospective Notes" and "Outcome Tag" (Went Well / Needs Improvement / Failed).

2. **Given** an event with "Failed" outcome tag, **When** viewing the timeline copy dialog, **Then** that event is highlighted for review before copying.

3. **Given** archived timelines with outcome tags, **When** user filters by "Needs Improvement", **Then** only events with that tag are displayed.

4. **Given** retrospective notes on an event, **When** hovering over the event card, **Then** a summary of the notes is visible without opening the full event.

---

### User Story 9 - Archive Management (Priority: P3)

As a long-time user, I need a separate archive section for past timelines so that my active work isn't cluttered by historical data while preserving it for reference.

**Why this priority**: UX improvement for users with many timelines, but system functions adequately with all timelines in one list.

**Independent Test**: Can be tested by archiving several timelines, navigating to the archive view, searching/filtering within archives, and unarchiving a timeline.

**Acceptance Scenarios**:

1. **Given** 10+ timelines including 5 archived, **When** user views timeline switcher, **Then** only non-archived timelines appear (archived are in separate section/link).

2. **Given** the archive view, **When** user searches "2023", **Then** only archived timelines with "2023" in their name or date range are shown.

3. **Given** an Admin viewing archived timeline, **When** they click "Unarchive", **Then** timeline is restored to active list in "Completed" status.

---

### Edge Cases

- What happens when a user's only accessible timeline is deleted? User is redirected to dashboard with prompt to create or request access to a timeline.
- What happens when copying a timeline with 500+ events? System shows progress indicator and processes in batches to prevent timeout; user can navigate away and return.
- How does the system handle concurrent edits to timeline settings by two Admins? Last write wins with timestamp; conflict notification shown if user's version is stale.
- What happens when a template is deleted that was used to create other timelines? No impact on existing timelines; they are independent copies.
- What happens when timeline date range is changed after events exist? Events retain their dates; warning shown if events fall outside new range.
- How are per-timeline categories handled when copying? Categories are copied as new independent categories in the target timeline.
- What happens to a user's "last timeline" preference when that timeline is archived? System clears preference and shows timeline selector on next login.

## Requirements *(mandatory)*

### Functional Requirements

**Timeline Core**
- **FR-001**: System MUST allow users to create unlimited timelines, each with a unique name, description, start date, end date, and theme color.
- **FR-002**: System MUST enforce timeline name uniqueness per user (same user cannot have two timelines with identical names).
- **FR-003**: System MUST support four lifecycle states for timelines: Planning, Active, Completed, and Archived. Transitions may skip forward (e.g., Planning→Archived for cancellation) but not backward, except Archived→Completed via Unarchive.
- **FR-004**: System MUST persist all timelines indefinitely for historical reference.
- **FR-005**: System MUST allow timeline owners to delete timelines with confirmation, permanently removing all associated events, categories, and member associations.

**Access Control**
- **FR-006**: System MUST automatically assign "Admin" role to the user who creates a timeline.
- **FR-007**: System MUST support three permission roles: Admin (full control), Editor (create/edit/delete events), Viewer (read-only access).
- **FR-008**: System MUST restrict users to only see and access timelines where they have been granted membership.
- **FR-009**: System MUST enforce read-only mode for all non-Admin users on Archived timelines.
- **FR-010**: System MUST allow Admins to invite existing users via in-app pending request with a specific role assignment; email notification is optional.
- **FR-011**: System MUST allow Admins to change member roles or remove members.
- **FR-012**: System MUST prevent the last Admin from being removed or demoted (timeline must always have at least one Admin).

**User Experience**
- **FR-013**: System MUST provide a timeline switcher dropdown accessible from all pages showing accessible timelines grouped by status.
- **FR-014**: System MUST support search/filter within the timeline switcher for users with many timelines.
- **FR-015**: System MUST remember each user's last active timeline and auto-load it on login.
- **FR-016**: System MUST display timeline theme color in switcher, header accent, and dashboard cards.
- **FR-017**: System MUST provide a dashboard showing all accessible timelines with: name, color, date range, status, completion stats, and event counts by status.
- **FR-018**: System MUST support dashboard filtering by status, year, and user's role.
- **FR-019**: System MUST support dashboard sorting by date, name, last modified, and completion percentage.

**Timeline Copy & Templates**
- **FR-020**: System MUST allow copying a timeline with automatic date shifting based on new festival dates.
- **FR-021**: System MUST provide option to keep or clear assigned persons when copying.
- **FR-022**: System MUST provide option to include or exclude retrospective notes when copying.
- **FR-023**: System MUST reset all event statuses to "Not Started" when copying a timeline.
- **FR-024**: System MUST copy all categories from source timeline as independent categories in the new timeline.
- **FR-025**: System MUST allow marking any timeline as a "Template" (visible to all users for creating new timelines).
- **FR-026**: System MUST show template timelines in a dedicated section during new timeline creation.

**Retrospective Features**
- **FR-027**: System MUST enable retrospective notes field on events when timeline status is "Completed" or "Archived".
- **FR-028**: System MUST support outcome tagging for completed events: "Went Well", "Needs Improvement", "Failed".
- **FR-029**: System MUST display outcome tags as visual badges on event cards.
- **FR-030**: System MUST highlight events tagged "Failed" when copying a timeline.
- **FR-031**: System MUST support filtering events by outcome tag in completed/archived timelines.

**Archive Management**
- **FR-032**: System MUST provide a separate archive view/section for archived timelines.
- **FR-033**: System MUST exclude archived timelines from the main timeline switcher list.
- **FR-034**: System MUST support search and filter by year/name within archive view.
- **FR-035**: System MUST allow Admins to unarchive timelines, returning them to "Completed" status.

**Data Isolation**
- **FR-036**: System MUST scope all events to a specific timeline (events cannot exist without a timeline).
- **FR-037**: System MUST scope all categories to a specific timeline (categories are per-timeline).
- **FR-038**: System MUST track source event reference when copying events to enable lineage tracking.

**Migration**
- **FR-039**: System MUST create a "Default Timeline" for all existing events during migration.
- **FR-040**: System MUST assign all existing users as Admins of the default timeline.
- **FR-041**: System MUST preserve all existing data with no data loss during migration.

### Key Entities

- **Timeline**: Represents a festival event planning container. Contains name, description, date range (start/end dates), theme color, lifecycle status, and template flag. Owned by a user, can have multiple members with different roles.

- **Timeline Member**: Represents a user's access to a specific timeline with their role (Admin, Editor, Viewer). Links users to timelines with permission levels.

- **User Preference**: Stores per-user settings including their last active timeline for auto-loading on login.

- **Event** (modified): Now belongs to a timeline. Gains retrospective notes, outcome tag, and source event reference for copy tracking.

- **Category** (modified): Now belongs to a timeline, enabling different category structures per festival.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new timeline with all required fields in under 60 seconds.
- **SC-002**: Users can switch between timelines in under 2 seconds using the header dropdown.
- **SC-003**: Dashboard loads and displays 50+ timelines with completion stats in under 3 seconds.
- **SC-004**: Timeline copy with 100 events completes in under 10 seconds with accurate date shifting.
- **SC-005**: Users can find and access any of their timelines within 3 clicks from any page.
- **SC-006**: 95% of users can successfully invite a team member and assign the correct role on first attempt.
- **SC-007**: Archived timelines do not appear in active navigation, reducing visual clutter by separation.
- **SC-008**: Retrospective notes and outcome tags are visible on event cards without requiring additional clicks (hover reveals summary).
- **SC-009**: System correctly enforces role permissions 100% of the time (no unauthorized actions succeed).
- **SC-010**: Migration preserves 100% of existing events and user associations with zero data loss.
- **SC-011**: Users managing 10+ festivals report improved organization through timeline separation and dashboard overview.
- **SC-012**: Template usage reduces new timeline setup effort compared to manual event creation.

## Assumptions

- Timeline names are unique per user but different users can have timelines with the same name.
- Theme colors are selected from a predefined palette (8-10 colors) for consistency, not arbitrary hex values.
- Invitations are in-app pending requests visible to existing users; invited users must already have an account (no external user invitation in initial scope).
- Date shifting during copy uses calendar days as the unit (events maintain their day-of-festival relationship).
- "Completion percentage" on dashboard is calculated as: (Completed events / Total events) * 100.
- Templates are globally visible to all authenticated users (not organization-scoped).
- Retrospective features (notes, tags) are available immediately when status changes to Completed, no separate "enable" action needed.
- Performance benchmarks assume typical web application infrastructure and user expectations.
