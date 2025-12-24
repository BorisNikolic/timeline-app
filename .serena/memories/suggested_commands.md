# Development Commands

## Backend (from /backend)
```bash
bun run dev              # Start development server (auto-reload)
bun run build            # Compile TypeScript to /dist
bun start                # Run compiled production build
bun run test             # Run tests with Vitest
bun run lint             # Check code with ESLint
bun run type-check       # TypeScript compilation check

# Database management
bun run db:migrate       # Run database migrations
bun run db:seed          # Seed initial data (categories + admin user)
bun run db:reset         # Drop and recreate database schema
```

## Frontend (from /frontend)
```bash
bun run dev              # Start Vite dev server (HMR enabled)
bun run build            # TypeScript compile + Vite production build
bun run preview          # Preview production build locally
bun run test             # Run Vitest unit tests
bun run test:e2e         # Run Playwright E2E tests
bun run lint             # Check code with ESLint
bun run type-check       # TypeScript compilation check
```

## Full-Stack Development
Start both servers concurrently:
```bash
# Terminal 1 - Backend
cd backend && bun run dev    # Runs on http://localhost:3000

# Terminal 2 - Frontend
cd frontend && bun run dev   # Runs on http://localhost:5173
```

## Database Setup
```bash
brew services start postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb festival_timeline
```

## System Utilities (macOS/Darwin)
- `git` - version control
- `ls`, `cd`, `find` - file navigation
- `grep` - text search
- `brew` - package manager
- `psql` - PostgreSQL CLI
