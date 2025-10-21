# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Overview

This repository contains three key documentation files:

- **[README.md](README.md)** - Quick start guide, feature overview, and basic setup instructions
- **[PROJECT.md](PROJECT.md)** - Comprehensive project documentation including all user stories, architecture details, database schema, implementation status, and project principles
- **[CLAUDE.md](CLAUDE.md)** - This file - Development guide for Claude Code with commands, architecture patterns, and troubleshooting

For detailed information about user stories, requirements, database schema, and implementation status, refer to [PROJECT.md](PROJECT.md).

## Project Overview

Festival Timeline Management App - A collaborative event planning tool for managing festival tasks with visual timeline organization by category. Built with TypeScript full-stack: React 18 + Vite frontend, Express.js backend, PostgreSQL 16 database.

**Status**: Production ready - 136 of 150 tasks complete (90.7%). All 7 user stories implemented and tested.

## Development Commands

### Backend (from `/backend`)
```bash
bun run dev              # Start development server (ts-node-dev, auto-reload)
bun run build            # Compile TypeScript to /dist
bun start                # Run compiled production build
bun run test                 # Run tests with Vitest
bun run lint             # Check code with ESLint
bun run type-check       # TypeScript compilation check (no emit)

# Database management
bun run db:migrate       # Run database migrations
bun run db:seed          # Seed initial data (categories + admin user)
bun run db:reset         # Drop and recreate database schema
```

### Frontend (from `/frontend`)
```bash
bun run dev              # Start Vite dev server (HMR enabled)
bun run build            # TypeScript compile + Vite production build
bun run preview          # Preview production build locally
bun run test                 # Run Vitest unit tests
bun run test:e2e         # Run Playwright E2E tests
bun run lint             # Check code with ESLint
bun run type-check       # TypeScript compilation check (no emit)
```

### Full-Stack Development
Start both servers concurrently:
```bash
# Terminal 1 - Backend
cd backend && bun run dev    # Runs on http://localhost:3000

# Terminal 2 - Frontend
cd frontend && bun run dev   # Runs on http://localhost:5173
```

## Architecture

### Backend Architecture

**Service Layer Pattern**: Business logic separated from HTTP handlers
- `/src/api/` - Express route handlers with Zod validation
- `/src/services/` - Business logic (EventService, CategoryService, UserService)
- `/src/middleware/` - Auth, error handling, validation
- `/src/db/` - PostgreSQL connection pool, migrations, query utilities

**Key Patterns**:
- **Parameterized SQL queries**: All database queries use parameterized inputs to prevent SQL injection
- **Optimistic locking**: Events use `updatedAt` timestamp for conflict detection
- **Service layer**: Each entity (Event, Category, User) has a dedicated service class with business logic
- **JWT authentication**: Passport.js local strategy with JWT tokens (stored in localStorage on frontend)

**API Structure**:
```
GET  /api/auth/login, /api/auth/register, /api/auth/me
GET  /api/events?startDate=&endDate=&sortBy=&status=&priority=
POST /api/events
PUT  /api/events/:id
DELETE /api/events/:id

GET  /api/categories
POST /api/categories
PUT  /api/categories/:id
DELETE /api/categories/:id

GET  /api/export/events-csv
GET  /api/export/events-excel
```

### Frontend Architecture

**State Management**:
- **React Query (TanStack Query)**: Server state, caching, mutations (events, categories)
- **Zustand**: Client state (categories store with optimistic updates)
- **React Context**: Authentication state (AuthContext)
- **localStorage**: JWT token persistence

**Component Organization**:
```
/src/components/
  /auth/          - Login, Register, PrivateRoute
  /events/        - EventForm, EventModal, EventList, EventCard, EventDetailView
                    EventDuplicateButton, QuickStatusDropdown, QuickDatePresets
                    BulkSelectionControls
  /timeline/      - Timeline, CategoryLane, EventCard
  /categories/    - CategoryForm
  /dashboard/     - StatusDashboardWidget
  /search/        - EventSearchInput
  /shared/        - Layout, StatusBadge, PriorityBadge, DeleteConfirmDialog
                    KeyboardShortcutProvider
  /export/        - ExportMenu
```

**Key Frontend Patterns**:
- **Virtual scrolling**: `react-window` used for category lanes (10+ categories) and event lists (50+ events)
- **Optimistic UI updates**: Zustand stores update immediately before server confirmation
- **Axios interceptors**: Auto-inject JWT tokens, handle 401 redirects
- **Mobile-first responsive**: 375px minimum width, TailwindCSS utilities in `/src/styles/responsive.css`

### UX Enhancements (Feature 002-ux-enhancements)

**8 Productivity Features** added to improve daily workflow efficiency:

**P1 Features (Critical)**:
1. **Quick Status Toggle**: Click status badge on event cards to update in 1 click (vs 5 clicks)
   - Component: `QuickStatusDropdown` in `/src/components/events/`
   - Uses React Query optimistic updates for instant feedback
   - Automatic rollback on error

2. **Visual Priority Indicators**: Color-coded borders on event cards
   - High: Red border (`border-red-500`)
   - Medium: Yellow border (`border-yellow-500`)
   - Low: Gray border (`border-gray-300`)
   - Enhanced `PriorityBadge` component with WCAG AA contrast compliance

**P2 Features (High-Value)**:
3. **Event Duplication**: Copy events with pre-filled form
   - Component: `EventDuplicateButton`
   - Auto-prefixes title with "Copy of..."
   - User reviews before saving (prevents accidental duplicates)

4. **Keyboard Shortcuts**: Global keyboard navigation
   - `N` - New event modal
   - `/` - Focus search input
   - `E` - Open export menu
   - `ESC` - Close modals
   - `Ctrl+S` / `Cmd+S` - Save form
   - Hook: `useKeyboardShortcuts` with context-aware filtering
   - Provider: `KeyboardShortcutProvider` in `/src/components/shared/`

5. **Quick Date Presets**: One-click common date selection
   - Component: `QuickDatePresets`
   - Buttons: Today, Tomorrow, Next Week (+7d), Next Month (+30d)
   - Utility: `datePresets.ts` with native Date API calculations

6. **Status Dashboard**: Real-time event count aggregation
   - Component: `StatusDashboardWidget` in `/src/components/dashboard/`
   - Shows counts by status (Not Started, In Progress, Completed)
   - Displays total events and completion percentage
   - Client-side aggregation with `useMemo` (<50ms for 500 events)

**P3 Features (Nice-to-Have)**:
7. **Text Search**: Filter events by title/description
   - Component: `EventSearchInput` in `/src/components/search/`
   - Hook: `useEventSearch` with debounced filtering
   - Client-side regex matching (30-50ms for 500 events)
   - Input sanitization to prevent regex injection
   - Combines with existing filters (category, status, priority)

8. **Bulk Status Updates**: Multi-select and batch update
   - Component: `BulkSelectionControls` in `/src/components/events/`
   - Hook: `useBulkEventUpdate` with `useReducer` state management
   - Select All / Clear Selection helpers
   - Promise.allSettled for partial success handling
   - Toast notifications: "Updated X of Y events"
   - 24px checkboxes for mobile accessibility

**Implementation Details**:
- **Zero backend changes**: All features use existing API endpoints
- **Zero new dependencies**: Uses existing React, TailwindCSS, React Query
- **Zero database migrations**: No schema changes required
- **Client-side operations**: Search, dashboard aggregation for optimal performance
- **Accessibility**: ARIA labels, keyboard navigation, mobile-friendly touch targets
- **Toast notifications**: Custom toast utility in `/src/utils/toast.ts`

**File Locations**:
```
frontend/src/
├── components/
│   ├── events/
│   │   ├── QuickStatusDropdown.tsx
│   │   ├── EventDuplicateButton.tsx
│   │   ├── QuickDatePresets.tsx
│   │   └── BulkSelectionControls.tsx
│   ├── dashboard/
│   │   └── StatusDashboardWidget.tsx
│   ├── search/
│   │   └── EventSearchInput.tsx
│   └── shared/
│       └── KeyboardShortcutProvider.tsx
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   ├── useBulkEventUpdate.ts
│   └── useEventSearch.ts
├── utils/
│   ├── datePresets.ts
│   ├── searchHelpers.ts
│   └── toast.ts
└── types/
    ├── bulk.ts
    └── search.ts
```

### Database Schema

**Enums**: `event_status` ('Not Started', 'In Progress', 'Completed'), `event_priority` ('High', 'Medium', 'Low')

**Tables**:
- `users`: id (UUID), email (unique, case-insensitive index), passwordHash (bcrypt), name
- `categories`: id (UUID), name (unique), color (#RRGGBB hex), createdBy → users
- `events`: id (UUID), title, date, description, categoryId → categories, assignedPerson (text), status (enum), priority (enum), createdBy → users, createdAt, updatedAt

**Critical indexes**:
- `events(date)`, `events(categoryId)`, `events(status)`, `events(priority)` for timeline/list queries
- `users(LOWER(email))`, `categories(LOWER(name))` for case-insensitive uniqueness

## Environment Setup

### Prerequisites
- Bun 1.3+ (JavaScript runtime)
- PostgreSQL 16
- 

### First-Time Setup

1. **Install Bun**:
```bash
brew install oven-sh/bun/bun
# Verify installation
bun --version  # Should show 1.3.0 or later
```

2. **PostgreSQL setup** (macOS with Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb festival_timeline
```

3. **Backend setup**:
```bash
cd backend
bun install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
bun run db:migrate    # Create schema
bun run db:seed       # Load initial data
bun run dev
```

4. **Frontend setup**:
```bash
cd frontend
bun install
cp .env.example .env
# VITE_API_URL should point to backend (default: http://localhost:3000)
bun run dev
```

5. **Access the app**: http://localhost:5173/auth
   - Demo credentials: `admin@festival.app` / `admin123` (from seed data)

## Critical Implementation Details

### Authentication Flow
1. User logs in → Backend validates credentials → Returns JWT + user object
2. Frontend stores JWT in `localStorage.setItem('token', jwt)`
3. Axios request interceptor adds `Authorization: Bearer ${token}` to all requests
4. Backend Passport JWT strategy validates token on protected routes
5. On 401 response → Axios interceptor clears token and redirects to `/auth`

### Event Querying with Filters
`EventService.getEvents()` supports dynamic SQL building with filters:
- **Date range**: `WHERE date BETWEEN $1 AND $2`
- **Sort by urgency**: `ORDER BY ABS(EXTRACT(EPOCH FROM (date - CURRENT_DATE))) ASC`
- **Sort by priority**: `CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 END`
- All queries use parameterized values for security

### Export Functionality
- **CSV**: Uses `json2csv` library with field mapping
- **Excel**: Uses `ExcelJS` with styled headers (gray background, bold text)
- Both return Blob responses with proper MIME types and filename headers
- Frontend creates temporary `<a>` element with ObjectURL for download

### Performance Optimizations
- **Virtual scrolling**: Automatically enabled for 10+ category lanes or 50+ event list items
- **Database connection pooling**: Max 20 connections, 30s idle timeout, 2s connection timeout
- **Slow query logging**: Queries >100ms logged to console (in `db/connection.ts`)
- **React Query caching**: Default 5min stale time for event/category lists

## Testing Strategy

### Backend Tests
- Unit tests: Services with mocked database queries
- Integration tests: Full API endpoints with test database
- Run with `bun run test` (Vitest)

### Frontend Tests
- Component tests: React Testing Library with happy-dom
- E2E tests: Playwright for full user flows
- Run with `bun run test` (Vitest) or `bun run test:e2e` (Playwright)

## Common Troubleshooting

### Database connection issues
- Verify PostgreSQL is running: `brew services list`
- Check DATABASE_URL in backend/.env matches your PostgreSQL config
- Test connection: `psql -d festival_timeline`

### Port conflicts
- Backend default port 3000, frontend 5173
- Change with PORT in .env (backend) or Vite config (frontend)

### Authentication errors
- Ensure JWT_SECRET is set in backend/.env (not default placeholder)
- Check token exists: `localStorage.getItem('token')` in browser console
- Verify CORS_ORIGIN in backend/.env matches frontend URL

## Code Conventions

### TypeScript
- Strict mode enabled
- Interface naming: PascalCase (e.g., `EventWithDetails`)
- Enum values: String enums matching database enums exactly

### Database
- All queries use parameterized values: `query('SELECT * FROM events WHERE id = $1', [id])`
- Foreign key constraints: ON DELETE RESTRICT (prevent orphaned data)
- UUID primary keys generated with `gen_random_uuid()`

### React Components
- Functional components with hooks (no class components)
- Props interfaces defined inline or exported if shared
- Event handlers prefixed with `handle` (e.g., `handleEditEvent`)
- Zustand stores follow pattern: `const { data, actions } = useStore()`

## Additional Resources

- **[PROJECT.md](PROJECT.md)** - Complete project documentation with:
  - All 7 user stories and acceptance criteria
  - Detailed architecture and technology decisions
  - Full database schema with relationships
  - Implementation status and remaining tasks
  - Constitution and quality standards
  - Security measures and performance optimizations
  - Future enhancement roadmap

- **[README.md](README.md)** - Quick reference for:
  - Fast setup commands
  - Feature checklist
  - Common development tasks
  - Basic troubleshooting

- **[.specify/memory/constitution.md](.specify/memory/constitution.md)** - Project principles:
  - User-First Design
  - Performance at Scale
  - Mobile-First Responsive Design
  - Data Portability

When working on new features or debugging, consult PROJECT.md for complete context on user stories, requirements, and architectural decisions.
