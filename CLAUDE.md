# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Festival Timeline Management App - A full-stack collaborative event planning tool with:
- **Frontend**: React 18 + TypeScript + Vite (deployed to GitHub Pages)
- **Backend**: Express.js + TypeScript + Bun (deployed to Render)
- **Mobile**: React Native + Expo (Pyramid Festival app)
- **Database**: PostgreSQL 16 (Neon)

## Development Commands

### Backend (`/backend`)
```bash
bun run dev              # Hot-reload dev server on http://localhost:3000
bun run build            # Compile TypeScript to /dist
bun run start            # Run production build
bun run test             # Vitest tests
bun run lint             # ESLint
bun run type-check       # TypeScript check

# Database
bun run db:migrate       # Run migrations + seed
bun run db:seed          # Seed data only
bun run db:reset         # Drop and recreate
```

### Frontend (`/frontend`)
```bash
bun run dev              # Vite dev server on http://localhost:5173
bun run build            # Production build
bun run test             # Vitest component tests
bun run test:e2e         # Playwright E2E tests
bun run test:e2e:ui      # Playwright with UI
bun run lint             # ESLint
```

### React Native (`/ReactNative`)
```bash
npx expo start           # Start Expo dev server
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator

# Run on physical device:
# 1. Install Expo Go app on your phone
# 2. Run `npx expo start`
# 3. Scan QR code with Camera (iOS) or Expo Go (Android)
```

## Architecture

### Backend - Service Layer Pattern
```
src/api/           → Route handlers (thin, delegate to services)
src/services/      → Business logic (EventService, CategoryService, etc.)
src/middleware/    → Auth (JWT), validation (Zod), error handling
src/db/            → PostgreSQL pool, migrations, seeds
```

### Frontend - Component-Based
```
src/components/    → Feature-grouped components (auth/, timeline/, events/, schedule/)
src/pages/         → Route pages (Timeline, Schedule, Dashboard, Archive)
src/hooks/         → Custom hooks (useEvents, useTimelines, useMembers, etc.)
src/services/      → API clients (Axios with interceptors)
src/stores/        → Zustand stores (timelineStore)
src/contexts/      → React Context (AuthContext)
```

### React Native
```
src/screens/       → Screen components (ScheduleScreen, MyEventsScreen)
src/components/    → Reusable components (EventCard, DayPicker, StageFilter)
src/hooks/         → Custom hooks (useEvents, useReminders)
src/services/      → API client, notifications
src/theme/         → Colors, typography, spacing
```

### State Management
- **React Query**: Server state (events, categories, timelines)
- **Zustand**: Client state (timeline selection)
- **React Context**: Auth state (user, token)
- **localStorage**: JWT token persistence

## Database Schema

Core tables: `users`, `categories`, `events`, `timelines`, `timeline_members`, `invitations`

Key enums:
- `event_status`: 'Not Started', 'In Progress', 'Completed'
- `event_priority`: 'High', 'Medium', 'Low'
- `member_role`: 'Admin', 'Editor', 'Viewer'

## Key Patterns

### SQL Queries
Always use parameterized queries:
```typescript
// Correct
query('SELECT * FROM events WHERE id = $1', [id])

// Never do this
query(`SELECT * FROM events WHERE id = ${id}`)
```

### API Endpoints
- Protected routes: `/api/events`, `/api/categories`, `/api/timelines`
- Public routes: `/api/public/*` (read-only, for mobile app)
- Auth routes: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`

### Frontend Axios Config
- 90s timeout (handles Render free tier cold starts)
- Request interceptor adds `Authorization: Bearer` header
- Response interceptor handles 401 redirects

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=<openssl rand -base64 32>
JWT_EXPIRY=24h
PORT=3000
CORS_ORIGIN=http://localhost:5173
RESEND_API_KEY=<for email invitations>
FRONTEND_URL=http://localhost:5173
ALLOWED_EMAILS=<comma-separated whitelist>
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3000
```

### React Native
API URL configured in `src/services/api.js`

## Testing

```bash
# Backend
cd backend && bun run test

# Frontend unit tests
cd frontend && bun run test

# Frontend E2E (requires both servers running)
cd frontend && bun run test:e2e
```

## Deployment

- **Frontend**: GitHub Pages (auto-deploy via GitHub Actions on push to main)
- **Backend**: Render (auto-deploy on push to main, 15-30s cold starts on free tier)
- **Database**: Neon PostgreSQL (auto-scales to zero)
- **Mobile**: Expo managed builds

## Troubleshooting

**Database connection fails**:
- Check PostgreSQL running: `brew services list`
- Verify `DATABASE_URL` in backend/.env

**Port conflicts**:
- Kill process: `lsof -ti :3000 | xargs kill -9`

**Auth errors**:
- Check `JWT_SECRET` is set
- Verify `CORS_ORIGIN` matches frontend URL

**Slow first request**:
- Normal for Render free tier (cold starts 15-30s)

**Git push permission denied**:
- This repo uses the `BorisNikolic` GitHub account
- If push fails with "Permission denied to borisprimer", switch accounts:
  ```bash
  gh auth switch --user BorisNikolic
  ```
- Check current account: `gh auth status`
