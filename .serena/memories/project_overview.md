# Festival Timeline App - Project Overview

## Purpose
A collaborative event planning tool for managing festival tasks with visual timeline organization by category. Team members can add, edit, and track events with details like date, responsible person, status, and priority.

## Tech Stack
- **Runtime**: Bun 1.3+
- **Frontend**: React 18 + Vite, TypeScript, TailwindCSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL 16
- **State Management**: React Query (server state), Zustand (client state), React Context (auth)
- **Testing**: Vitest (unit), Playwright (E2E)

## Project Structure
```
/backend          - Express.js API server
  /src/api/       - Route handlers with Zod validation
  /src/services/  - Business logic (EventService, CategoryService, UserService)
  /src/middleware/- Auth, error handling, validation
  /src/db/        - PostgreSQL connection, migrations, queries

/frontend         - React + Vite application
  /src/components/- UI components organized by feature
  /src/hooks/     - Custom React hooks
  /src/utils/     - Helper functions
  /src/types/     - TypeScript type definitions

/specs            - Feature specifications
/.github          - CI/CD workflows
```

## Key Architecture Patterns
- **Service Layer Pattern**: Business logic separated from HTTP handlers
- **Parameterized SQL queries**: All queries use parameterized inputs
- **JWT Authentication**: Passport.js with JWT tokens
- **Optimistic UI updates**: Zustand stores update before server confirmation
- **Virtual scrolling**: react-window for large lists (10+ categories, 50+ events)
