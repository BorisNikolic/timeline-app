# Implementation Plan: Multi-Timeline System

**Branch**: `001-multi-timeline-system` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-multi-timeline-system/spec.md`

## Summary

Transform the Festival Timeline App from a single shared timeline to a multi-timeline system supporting multiple festivals per year, historical data preservation, and cross-timeline learning. This involves adding Timeline entity as the root container, implementing role-based access control (Admin/Editor/Viewer), creating a timeline dashboard and switcher UI, and adding timeline copy/template functionality with retrospective features.

## Technical Context

**Language/Version**: TypeScript 5.3+ (Bun 1.3+ runtime for backend, Vite for frontend)
**Primary Dependencies**:
- Backend: Express.js 4.18, Passport.js (JWT auth), Zod (validation), pg (PostgreSQL)
- Frontend: React 18, React Query (TanStack), Zustand, React Router, TailwindCSS, date-fns
**Storage**: PostgreSQL 16
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (desktop and mobile responsive, 375px min width)
**Project Type**: Web application (separate frontend/backend)
**Performance Goals**:
- Dashboard loads 50+ timelines in <3 seconds (SC-003)
- Timeline switching in <2 seconds (SC-002)
- Timeline copy with 100 events in <10 seconds (SC-004)
**Constraints**:
- Mobile-first responsive design
- All existing data must be preserved (migration creates "Default Timeline")
- No breaking changes to event/category core functionality
**Scale/Scope**:
- Unlimited timelines per user
- Support for 500+ events per timeline (existing virtual scrolling)
- 10+ concurrent users (existing)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User-First Design ✅
| Requirement | Status | Evidence |
|-------------|--------|----------|
| Features map to user stories | ✅ | 9 user stories with acceptance criteria in spec.md |
| Independently testable | ✅ | Each story has "Independent Test" section |
| Measurable value | ✅ | 12 success criteria defined (SC-001 through SC-012) |
| Supports core use case | ✅ | Extends festival event organization to multiple festivals |

### II. Performance at Scale ✅
| Requirement | Status | Evidence |
|-------------|--------|----------|
| Timeline visualization <2s | ✅ | SC-002: Timeline switch <2s |
| Sorting/filtering <1s | ✅ | Existing implementation maintained |
| Support 10 concurrent users | ✅ | Existing architecture supports this |
| Dashboard loads 50+ timelines <3s | ✅ | SC-003 explicitly defined |

### III. Mobile-First Responsive Design ✅
| Requirement | Status | Evidence |
|-------------|--------|----------|
| Support 375px width | ✅ | Existing responsive CSS maintained |
| Full functionality all sizes | ✅ | Dashboard cards and switcher will be responsive |
| Touch-optimized | ✅ | Existing touch interactions extended |

### IV. Data Portability ✅
| Requirement | Status | Evidence |
|-------------|--------|----------|
| Export to CSV/Excel | ✅ | Existing export functionality maintained per-timeline |
| 100% data accuracy | ✅ | Existing implementation preserved |

### Gate Result: **PASS** - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```
specs/001-multi-timeline-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API specifications)
│   ├── timelines.yaml   # Timeline CRUD endpoints
│   ├── members.yaml     # Member management endpoints
│   └── dashboard.yaml   # Dashboard endpoints
└── tasks.md             # Phase 2 output (by /speckit.tasks)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── api/
│   │   ├── timelines.ts     # NEW: Timeline routes
│   │   ├── members.ts       # NEW: Member management routes
│   │   ├── dashboard.ts     # NEW: Dashboard routes
│   │   ├── events.ts        # MODIFIED: Add timeline scoping
│   │   └── categories.ts    # MODIFIED: Add timeline scoping
│   ├── services/
│   │   ├── TimelineService.ts    # NEW
│   │   ├── MemberService.ts      # NEW
│   │   ├── DashboardService.ts   # NEW
│   │   ├── EventService.ts       # MODIFIED
│   │   └── CategoryService.ts    # MODIFIED
│   ├── middleware/
│   │   └── timelineAuth.ts       # NEW: Timeline role authorization
│   └── db/
│       └── migrations/
│           └── 003_multi_timeline.sql  # NEW: Schema migration
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── timeline/            # MODIFIED: Timeline view components
│   │   ├── dashboard/           # NEW: Dashboard components
│   │   │   ├── TimelineDashboard.tsx
│   │   │   ├── TimelineCard.tsx
│   │   │   └── DashboardFilters.tsx
│   │   ├── shared/
│   │   │   ├── TimelineSwitcher.tsx  # NEW
│   │   │   └── TimelineForm.tsx      # NEW
│   │   └── members/             # NEW: Member management
│   │       ├── MemberList.tsx
│   │       └── InviteMember.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx    # NEW
│   │   └── TimelineSettingsPage.tsx  # NEW
│   ├── hooks/
│   │   ├── useTimelines.ts      # NEW
│   │   ├── useCurrentTimeline.ts # NEW
│   │   └── useTimelineRole.ts   # NEW
│   ├── stores/
│   │   └── timelineStore.ts     # NEW: Zustand store for current timeline
│   └── context/
│       └── TimelineContext.tsx  # NEW
└── tests/
```

**Structure Decision**: Web application structure with separate frontend/backend. New modules added alongside existing code. Migration strategy ensures backward compatibility with existing data.

## Complexity Tracking

*No constitution violations - table empty*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |
