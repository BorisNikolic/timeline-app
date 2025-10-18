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
npm run dev              # Start development server (ts-node-dev, auto-reload)
npm run build            # Compile TypeScript to /dist
npm start                # Run compiled production build
npm test                 # Run tests with Vitest
npm run lint             # Check code with ESLint
npm run type-check       # TypeScript compilation check (no emit)

# Database management
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed initial data (categories + admin user)
npm run db:reset         # Drop and recreate database schema
```

### Frontend (from `/frontend`)
```bash
npm run dev              # Start Vite dev server (HMR enabled)
npm run build            # TypeScript compile + Vite production build
npm run preview          # Preview production build locally
npm test                 # Run Vitest unit tests
npm run test:e2e         # Run Playwright E2E tests
npm run lint             # Check code with ESLint
npm run type-check       # TypeScript compilation check (no emit)
```

### Full-Stack Development
Start both servers concurrently:
```bash
# Terminal 1 - Backend
cd backend && npm run dev    # Runs on http://localhost:3000

# Terminal 2 - Frontend
cd frontend && npm run dev   # Runs on http://localhost:5173
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
  /timeline/      - Timeline, CategoryLane, EventCard
  /categories/    - CategoryForm
  /shared/        - Layout, StatusBadge, PriorityBadge, DeleteConfirmDialog
  /export/        - ExportMenu
```

**Key Frontend Patterns**:
- **Virtual scrolling**: `react-window` used for category lanes (10+ categories) and event lists (50+ events)
- **Optimistic UI updates**: Zustand stores update immediately before server confirmation
- **Axios interceptors**: Auto-inject JWT tokens, handle 401 redirects
- **Mobile-first responsive**: 375px minimum width, TailwindCSS utilities in `/src/styles/responsive.css`

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
- Node.js 20.x LTS
- PostgreSQL 16
- npm 9.0+

### First-Time Setup

1. **PostgreSQL setup** (macOS with Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb festival_timeline
```

2. **Backend setup**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run db:migrate    # Create schema
npm run db:seed       # Load initial data
npm run dev
```

3. **Frontend setup**:
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should point to backend (default: http://localhost:3000)
npm run dev
```

4. **Access the app**: http://localhost:5173/auth
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
- Run with `npm test` (Vitest)

### Frontend Tests
- Component tests: React Testing Library with happy-dom
- E2E tests: Playwright for full user flows
- Run with `npm test` (Vitest) or `npm run test:e2e` (Playwright)

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
