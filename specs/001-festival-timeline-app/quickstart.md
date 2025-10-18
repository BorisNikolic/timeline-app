# Quickstart Guide: Festival Timeline Management App

**Created**: 2025-10-18
**Purpose**: Get developers up and running with local development environment

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: 20.x LTS ([download](https://nodejs.org/))
- **pnpm**: 8.x+ (install with `npm install -g pnpm`)
- **PostgreSQL**: 16.x ([download](https://www.postgresql.org/download/))
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with TypeScript extensions)

**Verify installations**:
```bash
node --version    # Should be v20.x.x
pnpm --version    # Should be 8.x.x+
psql --version    # Should be 16.x
```

---

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd timeline_app
```

### 2. Install Dependencies

```bash
# Install all dependencies for monorepo
pnpm install

# Or install separately:
cd backend && pnpm install
cd ../frontend && pnpm install
```

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE festival_timeline;
CREATE USER timeline_admin WITH PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE festival_timeline TO timeline_admin;
\q
```

### 2. Run Migrations

```bash
cd backend
pnpm run db:migrate

# This runs the migration SQL from data-model.md:
# - Creates enums (user_role, event_status, event_priority)
# - Creates tables (users, categories, events)
# - Creates indexes
# - Seeds default admin user and categories
```

### 3. Verify Database

```bash
psql -U timeline_admin -d festival_timeline

\dt  # List tables (should see: users, categories, events)
SELECT * FROM categories;  # Should see 8 default categories
\q
```

---

## Backend Setup

### 1. Environment Configuration

Create `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql://timeline_admin:dev_password_123@localhost:5432/festival_timeline

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here-replace-in-production
JWT_EXPIRY=24h

# Server
PORT=3000
NODE_ENV=development

# OAuth (optional - leave empty for email/password only)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/microsoft/callback

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Security Note**: Never commit `.env` to version control. Use `.env.example` template.

### 2. Start Backend Server

```bash
cd backend
pnpm run dev

# Server starts at http://localhost:3000
# API docs available at http://localhost:3000/api-docs (Swagger UI)
```

**Expected output**:
```
[server] Server listening on port 3000
[db] Database connected successfully
[websocket] Socket.IO server initialized
```

### 3. Verify Backend

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","database":"connected","timestamp":"2025-10-18T..."}
```

---

## Frontend Setup

### 1. Environment Configuration

Create `frontend/.env` file:

```env
# API Base URL
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# OAuth (must match backend)
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=
```

### 2. Start Frontend Server

```bash
cd frontend
pnpm run dev

# Vite dev server starts at http://localhost:5173
```

**Expected output**:
```
VITE v5.x.x  ready in 250 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### 3. Open Application

Navigate to [http://localhost:5173](http://localhost:5173)

**Default credentials**:
- Email: `admin@festival.app`
- Password: `admin123`

---

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
7. Copy Client ID and Client Secret to `.env` files

### Microsoft OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations" → "New registration"
3. Name: "Festival Timeline App"
4. Redirect URI: `http://localhost:3000/auth/microsoft/callback`
5. After creation, go to "Certificates & secrets" → "New client secret"
6. Copy Application (client) ID and client secret value to `.env` files

---

## Running Tests

### Backend Tests

```bash
cd backend

# Unit tests
pnpm run test

# Integration tests (requires database)
pnpm run test:integration

# Coverage report
pnpm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Component tests
pnpm run test

# E2E tests (requires backend running)
pnpm run test:e2e

# E2E with UI
pnpm run test:e2e:ui
```

### Full Test Suite

```bash
# From project root
pnpm run test:all
```

---

## Development Workflows

### Creating a New Event (Manual Test)

1. Login at http://localhost:5173
2. Click "Add Event" button
3. Fill form:
   - Title: "Setup main stage"
   - Date: Select future date
   - Category: "Venue Setup"
   - Assigned Person: "Alice"
   - Status: "In Progress"
   - Priority: "High"
4. Click "Save"
5. Event appears on timeline within 3 seconds

### Real-time Sync Test

1. Open app in two browser windows (or incognito mode)
2. Login to both
3. Create event in Window 1
4. Verify event appears in Window 2 within 3 seconds
5. Edit event in Window 2
6. Verify changes reflect in Window 1

### Export Test

1. Create several events across different categories
2. Navigate to timeline view
3. Click "Export" → "PDF"
4. Verify PDF downloads within 5 seconds
5. Try CSV export → verify all event data included

---

## Common Development Tasks

### Database Reset

```bash
cd backend
pnpm run db:reset  # Drops and recreates database with seed data
```

### Generate TypeScript Types from OpenAPI

```bash
cd backend
pnpm run generate:types
# Creates type definitions in frontend/src/types/api.ts
```

### Linting & Formatting

```bash
# Check code style
pnpm run lint

# Auto-fix issues
pnpm run lint:fix

# Format with Prettier
pnpm run format
```

### Database Migrations

```bash
cd backend

# Create new migration
pnpm run db:migration:create add_event_attachments

# Run pending migrations
pnpm run db:migrate

# Rollback last migration
pnpm run db:rollback
```

---

## Troubleshooting

### Database Connection Fails

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@16

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in backend/.env
PORT=3001
```

### WebSocket Connection Fails

**Error**: `WebSocket connection to 'ws://localhost:3000' failed`

**Solutions**:
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check CORS settings in `backend/.env`
3. Verify `VITE_WS_URL` matches backend port
4. Clear browser cache and reload

### OAuth Callback Error

**Error**: `redirect_uri_mismatch`

**Solution**:
- Verify callback URL in OAuth provider settings exactly matches URL in `.env`
- For Google: Must be `http://localhost:3000/auth/google/callback` (no trailing slash)
- For Microsoft: Same - check Azure Portal redirect URI

### Timeline Loads Slowly (>2s)

**Debug**:
```bash
# Check event count
psql -U timeline_admin -d festival_timeline -c "SELECT COUNT(*) FROM events;"

# If >200 events, verify indexes exist
psql -U timeline_admin -d festival_timeline -c "\d events"

# Should see indexes on: date, categoryId, status, priority
```

### Tests Fail with Database Errors

**Solution**:
```bash
# Create separate test database
psql -U postgres -c "CREATE DATABASE festival_timeline_test;"

# Update backend/.env.test
DATABASE_URL=postgresql://timeline_admin:dev_password_123@localhost:5432/festival_timeline_test

# Run migrations on test DB
NODE_ENV=test pnpm run db:migrate
```

---

## Development Tools

### VS Code Extensions (Recommended)

- **ESLint**: `dbaeumer.vscode-eslint`
- **Prettier**: `esbenp.prettier-vscode`
- **TypeScript**: `ms-vscode.vscode-typescript-next`
- **Tailwind CSS IntelliSense**: `bradlc.vscode-tailwindcss`
- **Prisma** (if using Prisma ORM): `Prisma.prisma`
- **REST Client**: `humao.rest-client` (for testing API endpoints)

### Browser Extensions

- **React Developer Tools**: For inspecting component state
- **Redux DevTools**: For debugging Zustand state (if configured)
- **WebSocket Inspector**: For monitoring Socket.IO events

### Useful Commands

```bash
# Watch mode for backend (auto-restart on changes)
cd backend && pnpm run dev

# Watch mode for frontend (hot module reload)
cd frontend && pnpm run dev

# Build for production
pnpm run build  # Builds both backend and frontend

# Type checking (no compilation)
pnpm run type-check

# Generate API documentation
cd backend && pnpm run docs:generate
```

---

## Next Steps

1. **Read Architecture Docs**:
   - [spec.md](./spec.md) - Feature specification
   - [data-model.md](./data-model.md) - Database schema
   - [contracts/openapi.yaml](./contracts/openapi.yaml) - API reference
   - [contracts/websocket.md](./contracts/websocket.md) - Real-time protocol

2. **Explore Codebase**:
   - `backend/src/api/` - REST endpoint handlers
   - `backend/src/realtime/` - Socket.IO event handlers
   - `frontend/src/components/timeline/` - Timeline visualization
   - `frontend/src/services/` - API client and WebSocket client

3. **Run Full Test Suite**: `pnpm run test:all`

4. **Try Export Features**: Test PDF, CSV, and Excel exports

5. **Check Performance**: Seed 200+ events and verify <2s load time

---

## Getting Help

- **Documentation**: See `/specs/001-festival-timeline-app/` directory
- **API Reference**: http://localhost:3000/api-docs (when backend running)
- **Issues**: [Report issues on GitHub](<repository-url>/issues)
- **Constitution**: See `.specify/memory/constitution.md` for project principles

---

## Production Deployment

See [deployment guide](./deployment.md) for instructions on deploying to:
- Railway.app
- Render.com
- DigitalOcean App Platform
- Docker containerization

**Important**: Never use default credentials or `.env` values in production!

---

**Status**: ✅ Local development environment ready
**Next**: Start implementing features from [tasks.md](./tasks.md) (generated via `/speckit.tasks`)
