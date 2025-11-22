# Manual Testing Guide: Multi-Timeline System

**Feature**: Multi-Timeline System
**Version**: 1.0
**Date**: 2025-11-21
**Tester**: _______________
**Environment**: _______________

---

## Overview

This guide provides step-by-step test cases for manually verifying all features of the Multi-Timeline System. The feature transforms the Festival Timeline App from a single shared timeline to a multi-timeline system supporting multiple festivals per year, team collaboration with role-based access, and historical data preservation.

---

## Prerequisites

### Environment Setup

1. **Application URL**: http://localhost:5173 (or production URL)
2. **Backend API**: http://localhost:3000 (or production URL)
3. **Database**: PostgreSQL with migrations applied

### Test Accounts Required

| Account | Email | Password | Purpose |
|---------|-------|----------|---------|
| Boris (Admin) | boris.nikolic.dev@gmail.com | TestPass123 | Primary tester/Admin |
| Test User 2 | testuser2@example.com | TestPass123 | For invitation/Editor tests |
| Test User 3 | testuser3@example.com | TestPass123 | For Viewer role tests (create when needed) |

**Note**: Create Test User 2 and 3 via the registration page before starting tests. All test passwords are set to `TestPass123`.

### Browser Requirements

- Chrome, Firefox, Safari, or Edge (latest versions)
- Clear browser cache before testing
- Have browser DevTools ready for debugging

---

## Test Case Legend

- [ ] = Not tested
- [P] = Passed
- [F] = Failed (note issue in Comments)
- [S] = Skipped (note reason)
- [B] = Blocked (note blocker)

---

## User Story 1: Create and Manage Multiple Timelines (P1)

**Goal**: Verify users can create, edit, and delete separate timelines for different festivals.

### TC-1.1: Create New Timeline

**Precondition**: Logged in as Admin User

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Navigate to Dashboard (click logo or /dashboard) | Dashboard page loads showing timeline cards | [ ] | |
| 2 | Click "Create Timeline" button | Create Timeline modal opens | [ ] | |
| 3 | Enter name: "Winter Gala 2025" | Name field accepts input | [ ] | |
| 4 | Enter description: "Annual winter celebration" | Description field accepts input | [ ] | |
| 5 | Select start date: Dec 15, 2025 | Date picker works correctly | [ ] | |
| 6 | Select end date: Dec 18, 2025 | Date picker works correctly | [ ] | |
| 7 | Select theme color: Purple | Color picker shows 8 color options | [ ] | |
| 8 | Click "Create" button | Modal closes, new timeline appears in dashboard | [ ] | |
| 9 | Verify timeline card shows correct: name, color, dates | All fields display correctly | [ ] | |

### TC-1.2: Create Second Timeline

**Precondition**: TC-1.1 completed

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Click "Create Timeline" again | Modal opens | [ ] | |
| 2 | Enter name: "Summer Fest 2025" | Name accepted | [ ] | |
| 3 | Enter dates: Jun 14-17, 2025 | Dates accepted | [ ] | |
| 4 | Select theme color: Orange | Color selected | [ ] | |
| 5 | Click "Create" | Second timeline created | [ ] | |
| 6 | Verify both timelines visible on dashboard | Two timeline cards shown | [ ] | |

### TC-1.3: Timeline Name Uniqueness

**Precondition**: "Winter Gala 2025" timeline exists

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Click "Create Timeline" | Modal opens | [ ] | |
| 2 | Enter name: "Winter Gala 2025" (duplicate) | Name accepted in field | [ ] | |
| 3 | Fill other required fields and click "Create" | Error message: "Timeline name already exists" | [ ] | |
| 4 | Change name to "Winter Gala 2025 - v2" | Name accepted | [ ] | |
| 5 | Click "Create" | Timeline created successfully | [ ] | |

### TC-1.4: Edit Timeline Settings

**Precondition**: "Winter Gala 2025" timeline exists

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Click on "Winter Gala 2025" card or its settings icon | Timeline settings page opens | [ ] | |
| 2 | Change name to "Winter Gala 2025 - Updated" | Name field editable | [ ] | |
| 3 | Change theme color to Blue | Color updates | [ ] | |
| 4 | Click "Save Changes" | Success toast: "Timeline updated" | [ ] | |
| 5 | Navigate back to Dashboard | Timeline card shows updated name and color | [ ] | |

### TC-1.5: Delete Timeline

**Precondition**: Multiple timelines exist

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to settings of "Winter Gala 2025 - v2" | Settings page opens | [ ] | |
| 2 | Scroll to "Danger Zone" section | Delete button visible | [ ] | |
| 3 | Click "Delete Timeline" | Confirmation dialog appears | [ ] | |
| 4 | Verify dialog shows timeline name | Name clearly displayed | [ ] | |
| 5 | Click "Cancel" | Dialog closes, timeline not deleted | [ ] | |
| 6 | Click "Delete Timeline" again | Confirmation dialog appears | [ ] | |
| 7 | Click "Delete" to confirm | Timeline deleted, redirect to Dashboard | [ ] | |
| 8 | Verify deleted timeline not in list | Timeline card gone | [ ] | |

### TC-1.6: Timeline Data Isolation

**Precondition**: Two timelines with different events exist

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Select "Winter Gala 2025" from switcher | Timeline loads | [ ] | |
| 2 | Note number of events and categories | Record count: ___ events, ___ categories | [ ] | |
| 3 | Switch to "Summer Fest 2025" | Different timeline loads | [ ] | |
| 4 | Verify different events/categories shown | Different content displayed | [ ] | |
| 5 | Create new event in Summer Fest | Event created | [ ] | |
| 6 | Switch back to Winter Gala | Different events shown | [ ] | |
| 7 | Verify new Summer event NOT in Winter Gala | Event isolation confirmed | [ ] | |

---

## User Story 2: Timeline Access Control and Team Collaboration (P1)

**Goal**: Verify role-based permissions work correctly (Admin, Editor, Viewer).

### TC-2.1: Invite Member with Editor Role

**Precondition**: Admin User owns a timeline, Test User 2 account exists

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Timeline Settings > Members section | Member list shows current user as Admin | [ ] | |
| 2 | Click "Invite Member" button | Invite modal opens | [ ] | |
| 3 | Search for "test2@example.com" | User found in search results | [ ] | |
| 4 | Select Test User 2 | User selected | [ ] | |
| 5 | Select role: "Editor" | Role selected | [ ] | |
| 6 | Click "Send Invite" | Success message, member added to list | [ ] | |
| 7 | Verify member shows with "Editor" badge | Role displayed correctly | [ ] | |

### TC-2.2: Verify Editor Permissions

**Precondition**: Test User 2 invited as Editor to a timeline

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Log out from Admin User | Logged out | [ ] | |
| 2 | Log in as Test User 2 | Logged in successfully | [ ] | |
| 3 | Verify timeline visible in switcher/dashboard | Timeline accessible | [ ] | |
| 4 | Select the timeline | Timeline loads | [ ] | |
| 5 | Create a new event | Event created successfully | [ ] | |
| 6 | Edit the event | Edit works | [ ] | |
| 7 | Delete the event | Delete works | [ ] | |
| 8 | Navigate to Timeline Settings | Settings page loads | [ ] | |
| 9 | Try to change timeline name | Field disabled OR save fails with error | [ ] | |
| 10 | Try to change timeline dates | Field disabled OR save fails with error | [ ] | |
| 11 | Try to invite another member | Button disabled OR action fails | [ ] | |

### TC-2.3: Invite Member with Viewer Role

**Precondition**: Admin User logged in, Test User 3 exists

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Timeline Settings > Members | Members section visible | [ ] | |
| 2 | Invite Test User 3 with "Viewer" role | Member added with Viewer role | [ ] | |

### TC-2.4: Verify Viewer Permissions

**Precondition**: Test User 3 invited as Viewer

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Log in as Test User 3 | Logged in | [ ] | |
| 2 | Select the timeline | Timeline loads | [ ] | |
| 3 | View events on timeline | Events visible | [ ] | |
| 4 | Try to create new event | Button disabled OR "Access denied" error | [ ] | |
| 5 | Try to edit existing event | Edit button hidden/disabled OR error | [ ] | |
| 6 | Try to delete event | Delete option hidden OR error | [ ] | |
| 7 | Try to export events (CSV/Excel) | Export works (viewers can export) | [ ] | |

### TC-2.5: Change Member Role

**Precondition**: Admin User logged in, Test User 2 is Editor

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Timeline Settings > Members | Members listed | [ ] | |
| 2 | Find Test User 2 (Editor) | User found | [ ] | |
| 3 | Click role dropdown for Test User 2 | Dropdown opens with Admin/Editor/Viewer | [ ] | |
| 4 | Change role to "Viewer" | Role updated | [ ] | |
| 5 | Log in as Test User 2 | Logged in | [ ] | |
| 6 | Try to create event | Should be denied (now Viewer) | [ ] | |

### TC-2.6: Remove Member

**Precondition**: Admin User logged in

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Timeline Settings > Members | Members listed | [ ] | |
| 2 | Click "Remove" button for Test User 3 | Confirmation appears | [ ] | |
| 3 | Confirm removal | Member removed from list | [ ] | |
| 4 | Log in as Test User 3 | Logged in | [ ] | |
| 5 | Check if timeline visible | Timeline NOT in switcher/dashboard | [ ] | |

### TC-2.7: Last Admin Protection

**Precondition**: Admin User is only Admin on timeline

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Timeline Settings > Members | Admin User shown as Admin | [ ] | |
| 2 | Try to change own role to Editor | Error: "Timeline must have at least one Admin" | [ ] | |
| 3 | Try to leave timeline | Error: "Cannot leave as last Admin" | [ ] | |

### TC-2.8: Access Denied for Non-Members

**Precondition**: User has no access to a specific timeline

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Log in as user with no access to target timeline | Logged in | [ ] | |
| 2 | Try to access timeline by direct URL | "Access Denied" message OR redirect to dashboard | [ ] | |
| 3 | Verify timeline not in switcher dropdown | Timeline not listed | [ ] | |

---

## User Story 3: Timeline Dashboard Overview (P2)

**Goal**: Verify dashboard displays all timelines with status and progress metrics.

### TC-3.1: Dashboard Display

**Precondition**: User has access to 3+ timelines with different statuses

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Navigate to Dashboard | Dashboard page loads | [ ] | |
| 2 | Verify all accessible timelines shown | All timelines visible as cards | [ ] | |
| 3 | Check each card displays: name | Names correct | [ ] | |
| 4 | Check each card displays: color indicator | Color dots/borders match theme | [ ] | |
| 5 | Check each card displays: date range | Dates formatted correctly | [ ] | |
| 6 | Check each card displays: status badge | Status badges visible | [ ] | |
| 7 | Check each card displays: completion % | Percentage shown (e.g., "75% complete") | [ ] | |
| 8 | Check each card displays: event count | Total events shown | [ ] | |

### TC-3.2: Dashboard Grouping

**Precondition**: Timelines exist in different statuses

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | View Dashboard | Groups visible | [ ] | |
| 2 | Verify "Active" section appears first | Active timelines at top | [ ] | |
| 3 | Verify "Planning" section follows | Planning timelines second | [ ] | |
| 4 | Verify "Completed" section follows | Completed timelines third | [ ] | |
| 5 | Verify "Archived" in separate section/link | Archived not mixed with active | [ ] | |

### TC-3.3: Dashboard Filtering

**Precondition**: Multiple timelines exist

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Find filter controls | Status, Year, Role filters visible | [ ] | |
| 2 | Filter by Status: "Planning" | Only Planning timelines shown | [ ] | |
| 3 | Clear filter | All timelines return | [ ] | |
| 4 | Filter by Year: "2025" | Only 2025 timelines shown | [ ] | |
| 5 | Filter by Role: "Admin" | Only timelines where user is Admin | [ ] | |
| 6 | Combine filters | Filters work together | [ ] | |

### TC-3.4: Dashboard Sorting

**Precondition**: Multiple timelines exist

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Find sort controls | Sort options visible | [ ] | |
| 2 | Sort by "Date" | Timelines ordered by start date | [ ] | |
| 3 | Sort by "Name" | Timelines alphabetically ordered | [ ] | |
| 4 | Sort by "Last Modified" | Most recently updated first | [ ] | |
| 5 | Sort by "Completion %" | Highest completion first | [ ] | |

### TC-3.5: Open Timeline from Dashboard

**Precondition**: Dashboard showing timelines

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Click on a timeline card or "Open" button | Timeline view opens | [ ] | |
| 2 | Verify correct timeline loaded | Events match selected timeline | [ ] | |

---

## User Story 4: Quick Timeline Switching (P2)

**Goal**: Verify header switcher allows quick navigation between timelines.

### TC-4.1: Timeline Switcher Display

**Precondition**: User has access to multiple timelines

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Look at header area | Timeline switcher dropdown visible | [ ] | |
| 2 | Verify current timeline name shown | Correct name displayed | [ ] | |
| 3 | Verify color indicator visible | Color dot matches theme | [ ] | |
| 4 | Click switcher to open dropdown | Dropdown opens | [ ] | |
| 5 | Verify all accessible timelines listed | All timelines shown | [ ] | |
| 6 | Verify timelines grouped by status | Grouped correctly | [ ] | |
| 7 | Verify archived timelines NOT in list | Archived excluded (or in separate link) | [ ] | |

### TC-4.2: Switch Between Timelines

**Precondition**: Multiple timelines exist

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Open timeline switcher | Dropdown visible | [ ] | |
| 2 | Click on different timeline | Dropdown closes | [ ] | |
| 3 | Verify header updates | New timeline name shown | [ ] | |
| 4 | Verify content updates | Events/categories change | [ ] | |
| 5 | Time switch operation | Should complete in <2 seconds | [ ] | |

### TC-4.3: Switcher Search

**Precondition**: User has 5+ timelines

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Open timeline switcher | Dropdown opens | [ ] | |
| 2 | Type in search box: "Summer" | List filters to matching timelines | [ ] | |
| 3 | Clear search | All timelines return | [ ] | |
| 4 | Type partial match: "2025" | All 2025 timelines shown | [ ] | |

### TC-4.4: Remember Last Timeline

**Precondition**: User has multiple timelines

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Switch to "Summer Fest 2025" | Timeline loaded | [ ] | |
| 2 | Log out | Logged out | [ ] | |
| 3 | Log back in | Logged in | [ ] | |
| 4 | Verify auto-loaded timeline | "Summer Fest 2025" auto-selected | [ ] | |

### TC-4.5: Deleted Timeline Handling

**Precondition**: User's last timeline will be deleted

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | As Admin User, delete another user's last timeline | Timeline deleted | [ ] | |
| 2 | Log in as that user | Logged in | [ ] | |
| 3 | Verify behavior | Directed to dashboard to select new timeline | [ ] | |

---

## User Story 5: Timeline Lifecycle Management (P2)

**Goal**: Verify status transitions and lifecycle-specific behaviors.

### TC-5.1: Status Transition - Planning to Active

**Precondition**: Timeline exists in "Planning" status

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Timeline Settings | Settings page opens | [ ] | |
| 2 | Find status dropdown/section | Current status: "Planning" | [ ] | |
| 3 | Change status to "Active" | Status updated | [ ] | |
| 4 | Check Dashboard | Timeline in "Active" section | [ ] | |
| 5 | Check Switcher | Timeline shows "Active" badge | [ ] | |

### TC-5.2: Status Transition - Active to Completed

**Precondition**: Timeline in "Active" status

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Change status to "Completed" | Status updated | [ ] | |
| 2 | View an event | Retrospective fields now visible | [ ] | |
| 3 | See "Retro Notes" field | Field is editable | [ ] | |
| 4 | See "Outcome Tag" selector | Can select Went Well/Needs Improvement/Failed | [ ] | |

### TC-5.3: Status Transition - Completed to Archived

**Precondition**: Timeline in "Completed" status

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Change status to "Archived" | Status updated | [ ] | |
| 2 | Verify read-only indicator | Banner or badge shows "Archived - Read Only" | [ ] | |
| 3 | Try to create event | Action blocked | [ ] | |
| 4 | Try to edit event | Action blocked | [ ] | |
| 5 | Check switcher | Timeline not in main list (or marked archived) | [ ] | |

### TC-5.4: Archived Read-Only for Non-Admin

**Precondition**: Archived timeline, Test User 2 is Editor on it

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Log in as Test User 2 | Logged in | [ ] | |
| 2 | Access archived timeline | Timeline loads | [ ] | |
| 3 | Verify read-only banner | "Read-only" indicator shown | [ ] | |
| 4 | Try to edit event | Blocked with message | [ ] | |
| 5 | Try to delete event | Blocked with message | [ ] | |

### TC-5.5: Admin Can Edit Archived

**Precondition**: Archived timeline, Admin User

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Access archived timeline as Admin | Timeline loads | [ ] | |
| 2 | Edit an event | Edit allowed (Admin override) | [ ] | |
| 3 | Change timeline settings | Settings editable | [ ] | |

### TC-5.6: Unarchive Timeline

**Precondition**: Archived timeline, Admin User

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Timeline Settings (or Archive page) | Settings visible | [ ] | |
| 2 | Click "Unarchive" button | Confirmation dialog (if any) | [ ] | |
| 3 | Confirm unarchive | Status changes to "Completed" | [ ] | |
| 4 | Verify timeline back in active list | Shows in switcher | [ ] | |
| 5 | Verify editing re-enabled | Events can be edited again | [ ] | |

### TC-5.7: Status Transition Restrictions

**Precondition**: Timeline in "Completed" status

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Try to change to "Planning" | Should be blocked (backward transition) | [ ] | |
| 2 | Try to change to "Active" | Should be blocked (backward transition) | [ ] | |
| 3 | Can change to "Archived" | Forward transition allowed | [ ] | |

---

## User Story 6: Copy Timeline with Date Shifting (P3)

**Goal**: Verify timeline copy with automatic date recalculation.

### TC-6.1: Basic Timeline Copy

**Precondition**: "Summer Fest 2024" timeline exists with 10+ events (Jun 15-18, 2024)

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Find Copy button (Dashboard card or Settings) | Button visible | [ ] | |
| 2 | Click "Copy Timeline" | Copy dialog opens | [ ] | |
| 3 | Enter new name: "Summer Fest 2025" | Name accepted | [ ] | |
| 4 | Set new dates: Jun 14-17, 2025 | Dates accepted | [ ] | |
| 5 | Leave "Keep assigned persons" checked | Option checked | [ ] | |
| 6 | Leave "Include retrospective notes" unchecked | Option unchecked | [ ] | |
| 7 | Click "Copy" | Copy process starts | [ ] | |
| 8 | Wait for completion | Success message shown | [ ] | |
| 9 | Open "Summer Fest 2025" | New timeline loads | [ ] | |
| 10 | Verify event count matches source | Same number of events | [ ] | |

### TC-6.2: Verify Date Shifting

**Precondition**: Source timeline has event on Jun 16, 2024 (Day 2 of 4-day festival)

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Check event date in source timeline | Jun 16, 2024 | [ ] | |
| 2 | Check same event in copied timeline | Jun 15, 2025 (Day 2 of new dates, shifted 1 day earlier) | [ ] | |
| 3 | Verify relative position preserved | Same day-of-festival relationship | [ ] | |

### TC-6.3: Copy Options - Clear Assigned Persons

**Precondition**: Source timeline has events with assigned persons

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Start copy process | Dialog opens | [ ] | |
| 2 | UNCHECK "Keep assigned persons" | Option unchecked | [ ] | |
| 3 | Complete copy | Timeline copied | [ ] | |
| 4 | Check events in new timeline | Assigned person fields are empty | [ ] | |

### TC-6.4: Copy Options - Include Retrospective Notes

**Precondition**: Source timeline (Completed) has events with retro notes

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Start copy process | Dialog opens | [ ] | |
| 2 | CHECK "Include retrospective notes" | Option checked | [ ] | |
| 3 | Complete copy | Timeline copied | [ ] | |
| 4 | Check events in new timeline | Retro notes preserved | [ ] | |

### TC-6.5: Status Reset on Copy

**Precondition**: Source timeline has events with various statuses

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Note source has Completed, In Progress, Not Started events | Various statuses | [ ] | |
| 2 | Copy the timeline | Copy completed | [ ] | |
| 3 | Check all events in new timeline | All statuses reset to "Not Started" | [ ] | |

### TC-6.6: Categories Copied

**Precondition**: Source timeline has custom categories

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Note categories in source timeline | Record: ___ categories | [ ] | |
| 2 | Copy the timeline | Copy completed | [ ] | |
| 3 | Check categories in new timeline | Same categories exist (independent copies) | [ ] | |
| 4 | Edit category in new timeline | Does NOT affect source | [ ] | |

### TC-6.7: Large Timeline Copy (Performance)

**Precondition**: Timeline with 100+ events

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Start copy of large timeline | Copy starts | [ ] | |
| 2 | Monitor progress | Progress indicator shown (if applicable) | [ ] | |
| 3 | Time the operation | Should complete in <10 seconds | [ ] | |
| 4 | Verify all events copied | Count matches | [ ] | |

---

## User Story 7: Timeline Templates (P3)

**Goal**: Verify template functionality for standardized timeline creation.

### TC-7.1: Mark Timeline as Template

**Precondition**: Completed timeline with good event structure

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Timeline Settings | Settings page opens | [ ] | |
| 2 | Find "Template" toggle/checkbox | Option visible | [ ] | |
| 3 | Enable "Mark as Template" | Setting saved | [ ] | |
| 4 | Verify success feedback | Toast or indicator | [ ] | |

### TC-7.2: Templates Visible to Other Users

**Precondition**: Template marked, other user logged in

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Log in as different user | Logged in | [ ] | |
| 2 | Click "Create Timeline" | Dialog opens | [ ] | |
| 3 | Look for Template section | "Start from Template" option visible | [ ] | |
| 4 | Verify template listed | Template timeline shown | [ ] | |

### TC-7.3: Create Timeline from Template

**Precondition**: Template exists

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Start new timeline creation | Dialog opens | [ ] | |
| 2 | Select template option | Template selection shows | [ ] | |
| 3 | Choose template | Template selected | [ ] | |
| 4 | Enter new name and dates | Fields filled | [ ] | |
| 5 | Create timeline | Timeline created | [ ] | |
| 6 | Verify events pre-populated | Events from template exist | [ ] | |
| 7 | Verify dates relative to new range | Dates shifted correctly | [ ] | |

### TC-7.4: Template Independence

**Precondition**: Timeline created from template

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Edit an event in new timeline | Event modified | [ ] | |
| 2 | Check same event in template | Template unchanged | [ ] | |
| 3 | Delete event in new timeline | Event deleted | [ ] | |
| 4 | Check template | Template still has event | [ ] | |

### TC-7.5: Unmark Template

**Precondition**: Timeline is marked as template

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to template's settings | Settings page | [ ] | |
| 2 | Uncheck "Mark as Template" | Setting saved | [ ] | |
| 3 | Log in as other user | Logged in | [ ] | |
| 4 | Create new timeline | Dialog opens | [ ] | |
| 5 | Check template section | Template no longer listed | [ ] | |

---

## User Story 8: Post-Festival Retrospective (P3)

**Goal**: Verify retrospective notes and outcome tags functionality.

### TC-8.1: Retrospective Fields on Completed Timeline

**Precondition**: Timeline in "Completed" status

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Open an event | Event detail/edit form opens | [ ] | |
| 2 | Find "Retrospective Notes" field | Field visible | [ ] | |
| 3 | Find "Outcome Tag" selector | Selector visible | [ ] | |
| 4 | Verify outcome options | "Went Well", "Needs Improvement", "Failed" | [ ] | |

### TC-8.2: Add Retrospective Notes

**Precondition**: Completed timeline

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Open event | Event opens | [ ] | |
| 2 | Enter retro notes: "Vendor arrived late, caused 30min delay" | Text entered | [ ] | |
| 3 | Save event | Notes saved | [ ] | |
| 4 | Reopen event | Notes persisted | [ ] | |

### TC-8.3: Set Outcome Tags

**Precondition**: Completed timeline

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Open event | Event opens | [ ] | |
| 2 | Select outcome: "Went Well" | Tag selected | [ ] | |
| 3 | Save and close | Saved | [ ] | |
| 4 | View event card on timeline | Green "Went Well" badge visible | [ ] | |
| 5 | Set another event to "Needs Improvement" | Yellow badge | [ ] | |
| 6 | Set another event to "Failed" | Red badge | [ ] | |

### TC-8.4: Outcome Tag Badges on Event Cards

**Precondition**: Events with different outcome tags

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | View timeline with tagged events | Cards visible | [ ] | |
| 2 | Verify "Went Well" shows green badge | Green indicator | [ ] | |
| 3 | Verify "Needs Improvement" shows yellow badge | Yellow indicator | [ ] | |
| 4 | Verify "Failed" shows red badge | Red indicator | [ ] | |

### TC-8.5: Retrospective Notes Hover Preview

**Precondition**: Events have retro notes

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Hover over event card with retro notes | Tooltip/preview appears | [ ] | |
| 2 | Verify notes summary visible | Notes text shown | [ ] | |
| 3 | Hover over event without notes | No retro preview | [ ] | |

### TC-8.6: Filter by Outcome Tag

**Precondition**: Events with different outcome tags

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Find filter controls | Filters visible | [ ] | |
| 2 | Filter by "Needs Improvement" | Only those events shown | [ ] | |
| 3 | Filter by "Failed" | Only failed events shown | [ ] | |
| 4 | Clear filter | All events return | [ ] | |

### TC-8.7: Retro Not Available on Planning/Active

**Precondition**: Timeline in "Planning" or "Active" status

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Open event | Event form opens | [ ] | |
| 2 | Look for Retrospective Notes | Field NOT visible or disabled | [ ] | |
| 3 | Look for Outcome Tag | Selector NOT visible or disabled | [ ] | |

---

## User Story 9: Archive Management (P3)

**Goal**: Verify archive section and management features.

### TC-9.1: Archive View Accessible

**Precondition**: At least one archived timeline exists

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Find "Archive" link (Dashboard or nav) | Link visible | [ ] | |
| 2 | Click Archive link | Archive page opens | [ ] | |
| 3 | Verify archived timelines listed | Archived timelines shown | [ ] | |

### TC-9.2: Archived Excluded from Main Switcher

**Precondition**: Archived timeline exists

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Open timeline switcher | Dropdown opens | [ ] | |
| 2 | Check for archived timeline | NOT in main list | [ ] | |
| 3 | Look for "View Archive" option | Link to archive (if applicable) | [ ] | |

### TC-9.3: Archive Search

**Precondition**: Multiple archived timelines exist

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Go to Archive page | Page loads | [ ] | |
| 2 | Use search: "2023" | Only 2023 timelines shown | [ ] | |
| 3 | Search by name: "Summer" | Matching archives shown | [ ] | |

### TC-9.4: Archive Year Filter

**Precondition**: Archived timelines from multiple years

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Find year filter | Filter visible | [ ] | |
| 2 | Select "2023" | Only 2023 archives shown | [ ] | |
| 3 | Select "2024" | Only 2024 archives shown | [ ] | |

### TC-9.5: Access Archived Timeline

**Precondition**: Archived timeline exists

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Click on archived timeline in Archive page | Timeline view opens | [ ] | |
| 2 | Verify events visible | Events displayed | [ ] | |
| 3 | Verify read-only indicator | Read-only banner shown | [ ] | |

### TC-9.6: Unarchive from Archive Page

**Precondition**: Admin on archived timeline

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Find Unarchive button on archive list/card | Button visible | [ ] | |
| 2 | Click Unarchive | Confirmation (if any) | [ ] | |
| 3 | Confirm action | Timeline status becomes "Completed" | [ ] | |
| 4 | Verify timeline back in main switcher | Shows in active list | [ ] | |

---

## Edge Cases

### EC-1: User's Only Timeline Deleted

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | User has access to only one timeline | Setup confirmed | [ ] | |
| 2 | Admin deletes that timeline | Timeline deleted | [ ] | |
| 3 | User tries to access app | Redirected to dashboard with prompt to create/request access | [ ] | |

### EC-2: Concurrent Edit Conflict

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Open timeline settings in two browser tabs | Both open | [ ] | |
| 2 | Change name in Tab 1 and save | Save succeeds | [ ] | |
| 3 | Change name in Tab 2 (without refresh) and save | Conflict error OR auto-refresh prompt | [ ] | |

### EC-3: Event Date Outside New Timeline Range

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Timeline has event on Jun 20 | Event exists | [ ] | |
| 2 | Change timeline end date to Jun 18 | Warning shown | [ ] | |
| 3 | Save changes | Event retains Jun 20 date | [ ] | |
| 4 | Verify warning about out-of-range events | Warning displayed | [ ] | |

### EC-4: Archived Timeline Preference Cleared

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | User's last timeline is archived | Timeline archived | [ ] | |
| 2 | User logs in | Logged in | [ ] | |
| 3 | Verify behavior | Timeline selector shown, archived not auto-loaded | [ ] | |

---

## Performance Tests

### PT-1: Dashboard Load Time (50+ Timelines)

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Create/access 50+ timelines | Timelines exist | [ ] | |
| 2 | Navigate to Dashboard | Start timer | [ ] | |
| 3 | Wait for full load | All cards visible | [ ] | |
| 4 | Record time | Should be <3 seconds | [ ] | Time: ___ |

### PT-2: Timeline Switch Time

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Have two timelines with 100+ events each | Timelines ready | [ ] | |
| 2 | Start on Timeline A | Ready | [ ] | |
| 3 | Switch to Timeline B | Start timer | [ ] | |
| 4 | Wait for content load | Events visible | [ ] | |
| 5 | Record time | Should be <2 seconds | [ ] | Time: ___ |

### PT-3: Timeline Copy Time (100 Events)

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Timeline with 100 events | Ready | [ ] | |
| 2 | Start copy | Timer starts | [ ] | |
| 3 | Wait for completion | Copy done | [ ] | |
| 4 | Record time | Should be <10 seconds | [ ] | Time: ___ |

---

## Mobile Responsiveness Tests

### MR-1: Dashboard on Mobile (375px)

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Set viewport to 375px width | Mobile view | [ ] | |
| 2 | Navigate to Dashboard | Dashboard loads | [ ] | |
| 3 | Verify cards stack vertically | Single column layout | [ ] | |
| 4 | Verify all info visible | No cut-off content | [ ] | |
| 5 | Verify touch targets adequate | Buttons easily tappable | [ ] | |

### MR-2: Timeline Switcher on Mobile

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Set viewport to 375px width | Mobile view | [ ] | |
| 2 | Tap timeline switcher | Dropdown opens | [ ] | |
| 3 | Verify dropdown doesn't overflow | Contained in viewport | [ ] | |
| 4 | Tap to select timeline | Selection works | [ ] | |

### MR-3: Create Timeline Form on Mobile

| Step | Action | Expected Result | Status | Comments |
|------|--------|-----------------|--------|----------|
| 1 | Set viewport to 375px width | Mobile view | [ ] | |
| 2 | Open Create Timeline modal | Modal opens | [ ] | |
| 3 | Verify form fields accessible | All fields visible/scrollable | [ ] | |
| 4 | Date picker works on mobile | Can select dates | [ ] | |
| 5 | Submit form | Form submits correctly | [ ] | |

---

## Test Summary

| User Story | Total Tests | Passed | Failed | Blocked | Skipped |
|------------|-------------|--------|--------|---------|---------|
| US1 - Create/Manage Timelines | 6 | | | | |
| US2 - Access Control | 8 | | | | |
| US3 - Dashboard | 5 | | | | |
| US4 - Quick Switching | 5 | | | | |
| US5 - Lifecycle | 7 | | | | |
| US6 - Copy Timeline | 7 | | | | |
| US7 - Templates | 5 | | | | |
| US8 - Retrospective | 7 | | | | |
| US9 - Archive | 6 | | | | |
| Edge Cases | 4 | | | | |
| Performance | 3 | | | | |
| Mobile | 3 | | | | |
| **TOTAL** | **66** | | | | |

---

## Issues Log

| Issue # | Test Case | Severity | Description | Steps to Reproduce | Expected vs Actual |
|---------|-----------|----------|-------------|-------------------|-------------------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

**Severity Levels**: Critical (blocks usage), High (major function broken), Medium (workaround exists), Low (cosmetic/minor)

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | | | |
| Developer | | | |
| Product Owner | | | |

---

**Notes:**
- Record any environment-specific observations
- Document any deviations from test steps
- Note browser/device used for each test session
