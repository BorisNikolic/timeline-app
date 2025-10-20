# Festival Timeline Management App

A collaborative web application for managing festival events with visual timeline organization by category.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3+-orange.svg)](https://bun.sh/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

## Quick Start

```bash
# 1. Install Bun
brew install oven-sh/bun/bun

# 2. Setup PostgreSQL
brew install postgresql@16
brew services start postgresql@16
createdb festival_timeline

# 3. Backend setup
cd backend
bun install
cp .env.example .env
bun run db:migrate
bun run db:seed
bun run dev  # Runs on http://localhost:3000

# 4. Frontend setup (new terminal)
cd frontend
bun install
cp .env.example .env
bun run dev  # Runs on http://localhost:5173

# 5. Access the app
# URL: http://localhost:5173/auth
# Login: admin@festival.app / admin123
```

## Features

- ✅ **Visual Timeline** - Events organized in horizontal category lanes
- ✅ **Team Collaboration** - Multiple users manage shared timeline
- ✅ **Status Tracking** - Progress tracking with statuses and priorities
- ✅ **Data Export** - CSV and Excel export with complete event data
- ✅ **Mobile Responsive** - Works on devices 375px+ width
- ✅ **Virtual Scrolling** - Handles 200+ events smoothly

## Documentation

- **[PROJECT.md](PROJECT.md)** - Comprehensive project documentation (features, architecture, database schema, implementation status)
- **[CLAUDE.md](CLAUDE.md)** - Development guide for Claude Code instances
- **[.specify/memory/constitution.md](.specify/memory/constitution.md)** - Project principles and quality standards

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand, React Query, react-window

**Backend**: Bun 1.3+, Express, TypeScript, PostgreSQL 16, Passport.js, JWT, bcrypt

**Testing**: Vitest, Playwright, React Testing Library, Supertest

## Project Structure

```
timeline_app/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── api/      # Route handlers
│   │   ├── services/ # Business logic
│   │   ├── db/       # Database migrations and queries
│   │   └── middleware/
│   └── .env.example
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── .env.example
├── CLAUDE.md         # Development guide
├── PROJECT.md        # Full documentation
└── README.md         # This file
```

## Development Commands

**Backend**:
```bash
bun run dev           # Start development server (hot reload with bun --watch)
bun run test          # Run tests
bun run db:migrate    # Run database migrations
bun run db:seed       # Seed initial data
bun run lint          # Check code quality
```

**Frontend**:
```bash
bun run dev           # Start Vite dev server (HMR enabled)
bun run test          # Run component tests
bun run test:e2e      # Run E2E tests
bun run build         # Production build
bun run lint          # Check code quality
```

## Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql://timeline_admin:dev_password_123@localhost:5432/festival_timeline
JWT_SECRET=your-secret-key-here
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:3000
```

## Implementation Status

✅ **Phase 1-3**: Setup and Foundation (34/34 tasks)
✅ **User Story 1**: Quick Event Creation (18/18 tasks)
✅ **User Story 2**: Category Organization (15/15 tasks)
✅ **User Story 3**: Team Assignment (6/6 tasks)
✅ **User Story 4**: Status & Priority Tracking (10/10 tasks)
✅ **User Story 5**: Event Editing & Deletion (10/10 tasks)
✅ **User Story 6**: Event List View with Sorting (17/17 tasks)
✅ **User Story 7**: Data Export (11/11 tasks)
✅ **Phase 10**: Authentication (14/14 tasks)

**Total**: 136 of 150 tasks (90.7%) - Production ready

## Testing

```bash
# Backend tests
cd backend && bun run test

# Frontend tests
cd frontend && bun run test

# E2E tests (requires both servers running)
cd frontend && bun run test:e2e
```

## Troubleshooting

**Database connection fails**:
- Ensure PostgreSQL is running: `brew services list`
- Verify DATABASE_URL in backend/.env

**Port conflicts**:
- Kill process on port 3000: `lsof -ti :3000 | xargs kill -9`
- Or change PORT in backend/.env

**Authentication errors**:
- Ensure JWT_SECRET is set in backend/.env
- Check CORS_ORIGIN matches frontend URL

See [CLAUDE.md](CLAUDE.md) for detailed troubleshooting guide.

## Contributing

1. Follow TypeScript strict mode conventions
2. Use parameterized SQL queries for security
3. Write tests for new features
4. Ensure mobile responsiveness (375px+)
5. Run `bun run lint` before committing

## License

MIT

## Support

For development guidance, see:
- [CLAUDE.md](CLAUDE.md) - Development workflows and architecture
- [PROJECT.md](PROJECT.md) - Complete project documentation
- [.specify/memory/constitution.md](.specify/memory/constitution.md) - Quality standards

---

**Version**: 1.0.0 | **Status**: Production Ready | **Last Updated**: 2025-10-18
