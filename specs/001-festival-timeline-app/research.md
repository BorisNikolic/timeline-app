# Technology Research: Festival Timeline Management App

**Created**: 2025-10-18
**Purpose**: Resolve technical unknowns and select appropriate technologies for implementation

## Research Summary

This document captures technology choices for building a collaborative festival timeline management web application. Decisions prioritize rapid development, real-time capabilities, and alignment with constitutional performance and usability requirements.

---

## 1. Language & Runtime

### Decision: TypeScript + Node.js

**Chosen**:
- **Frontend**: TypeScript 5.3+
- **Backend**: Node.js 20.x LTS with TypeScript

**Rationale**:
- Single language across stack reduces context switching
- TypeScript provides type safety for complex data models (Event, Category, User)
- Node.js ecosystem has mature real-time libraries (Socket.IO, WebSockets)
- Strong community support for both frontend and backend
- Fast development velocity for MVP

**Alternatives Considered**:
- Python + FastAPI: Slower WebSocket performance, separate frontend language
- Go: Excellent performance but steeper learning curve, less ecosystem for rapid UI development
- Java/Spring: Over-engineered for small-medium scale requirements

---

## 2. Frontend Framework

### Decision: React 18 + Vite

**Chosen**:
- React 18.2+ (with hooks and concurrent features)
- Vite 5.x (build tool)
- TailwindCSS 3.x (styling)

**Rationale**:
- React's component model fits timeline visualization well (category lanes, event cards)
- Large ecosystem for timeline libraries and UI components
- Vite provides fast dev server and build times (supports <2s load requirement)
- TailwindCSS enables rapid responsive design (375px+ requirement)
- React 18 concurrent features help with real-time updates

**Alternatives Considered**:
- Vue 3: Less mature timeline component ecosystem
- Svelte: Smaller community, fewer enterprise-ready component libraries
- Angular: Too heavy for small-medium scale application

**Key Libraries**:
- `react-beautiful-dnd` or `@dnd-kit/core`: Drag-and-drop for timeline interaction
- `date-fns`: Date manipulation and formatting
- `zustand` or `jotai`: Lightweight state management for real-time updates
- `react-query`: Server state management and caching

---

## 3. Backend Framework

### Decision: Express.js + TypeScript

**Chosen**:
- Express.js 4.18+
- TypeScript for type safety
- `ts-node-dev` for development

**Rationale**:
- Minimal, unopinionated framework - no unnecessary complexity
- Mature middleware ecosystem (auth, validation, CORS)
- Easy integration with Socket.IO for real-time features
- Well-documented for REST API patterns
- Fast startup for development

**Alternatives Considered**:
- NestJS: Too structured for small app, adds learning curve
- Fastify: Better performance but less ecosystem maturity
- Koa: Smaller community, fewer middleware options

---

## 4. Database

### Decision: PostgreSQL 16

**Chosen**:
- PostgreSQL 16.x
- `pg` driver for Node.js
- Optional: Prisma ORM for type-safe queries

**Rationale**:
- ACID compliance ensures data integrity for concurrent edits
- Excellent support for relational data (Event ↔ Category, Event ↔ User)
- JSONB columns for flexible metadata if needed
- Mature, reliable, open-source
- Handles 10-100 concurrent users easily

**Schema Design**:
- `users` table: id, email, passwordHash, name, role
- `categories` table: id, name, color, createdBy, createdAt
- `events` table: id, title, date, description, categoryId, assignedPerson, status, priority, createdBy, createdAt, updatedAt
- Indexes on date, status, priority for fast filtering

**Alternatives Considered**:
- MongoDB: Document model doesn't fit relational structure well
- MySQL: PostgreSQL has better JSON support and full-text search
- SQLite: Not suitable for concurrent multi-user access

---

## 5. Real-time Communication

### Decision: Socket.IO 4.x

**Chosen**:
- Socket.IO 4.7+ (WebSocket library)
- Redis adapter for horizontal scaling (future)

**Rationale**:
- Built-in fallback mechanisms (WebSocket → long polling)
- Room-based architecture perfect for single timeline broadcast
- Easy integration with Express.js
- Automatic reconnection handling
- Meets <3s sync requirement easily

**Implementation Pattern**:
```typescript
// Server emits on event changes
io.emit('event:created', eventData);
io.emit('event:updated', eventData);
io.emit('event:deleted', eventId);

// Clients listen and update local state
socket.on('event:created', (event) => {
  // Update React state
});
```

**Alternatives Considered**:
- Native WebSocket API: No fallback, more manual reconnection logic
- Server-Sent Events (SSE): One-way only, doesn't fit bidirectional needs
- GraphQL Subscriptions: Overkill for simple event broadcasting

---

## 6. Authentication

### Decision: Passport.js + JWT

**Chosen**:
- Passport.js (authentication middleware)
- Passport-local (email/password)
- Passport-google-oauth20 (Google OAuth)
- Passport-microsoft (Microsoft OAuth)
- JWT for stateless session tokens

**Rationale**:
- Passport has strategies for all required auth methods
- JWT enables stateless authentication (scales easily)
- Well-documented integration patterns
- Open self-registration model (FR-024) supported

**Flow**:
1. User registers/logs in → Server generates JWT
2. Client stores JWT in localStorage
3. Client sends JWT in Authorization header for API requests
4. Server validates JWT on each request

**Alternatives Considered**:
- Session-based auth: Requires sticky sessions or shared session store
- Auth0/Firebase Auth: Third-party dependency, cost implications
- OAuth-only: Needs email/password fallback per spec

---

## 7. Export Functionality

### Decision: Puppeteer + CSV libraries

**Chosen**:
- **PDF/Image**: Puppeteer 21.x (headless browser)
- **CSV/Excel**: `papaparse` (CSV) + `exceljs` (Excel format)

**Rationale**:
- Puppeteer renders actual timeline HTML → PDF/PNG with high fidelity
- Meets <5s export requirement with optimization
- CSV/Excel libraries handle 100% data accuracy requirement
- Standard output formats compatible with all tools

**Implementation**:
- PDF/Image: Server-side endpoint that launches headless browser, renders timeline, captures screenshot/PDF
- CSV/Excel: Backend generates file from database query, streams to client

**Alternatives Considered**:
- jsPDF: Manual layout is complex for timeline visualization
- html2canvas: Lower quality than Puppeteer
- Custom PDF generation: Time-consuming, error-prone

---

## 8. Testing Frameworks

### Decision: Vitest + Playwright

**Chosen**:
- **Frontend Unit**: Vitest + React Testing Library
- **Backend Unit**: Vitest (Node.js compatible)
- **E2E**: Playwright
- **Integration**: Supertest (API testing)

**Rationale**:
- Vitest is Vite-native, fast, modern API
- React Testing Library promotes user-centric tests
- Playwright supports all required browsers (Chrome, Firefox, Safari, Edge)
- Supertest simplifies REST API testing

**Alternatives Considered**:
- Jest: Slower than Vitest, requires additional config for ESM
- Cypress: Good but Playwright has better multi-browser support
- Mocha/Chai: Older API, less TypeScript-friendly

---

## 9. Deployment & Hosting

### Decision: Docker + Cloud Platform

**Chosen** (Recommendations):
- **Containerization**: Docker + Docker Compose
- **Hosting Options**:
  - Railway.app (easy Node.js + PostgreSQL deployment)
  - Render.com (free PostgreSQL, auto-deploy from Git)
  - DigitalOcean App Platform
  - Vercel (frontend) + Railway (backend + DB)

**Rationale**:
- Docker ensures consistent dev/prod environments
- Cloud platforms handle scaling for 10-100 users
- Auto-deploy from Git supports rapid iteration
- Free tiers available for MVP

**Alternatives Considered**:
- AWS/GCP/Azure: Overkill for initial scale, higher complexity
- Heroku: Pricing changes make alternatives more attractive
- Self-hosted VPS: More management overhead

---

## 10. Development Tools

### Decisions

**Package Manager**: pnpm (faster than npm, more efficient than yarn)

**Linting & Formatting**:
- ESLint (with TypeScript plugins)
- Prettier (code formatting)
- Husky (git hooks)

**API Documentation**: OpenAPI 3.0 spec + Swagger UI

**Environment Management**: dotenv for local, platform env vars for production

---

## Performance Optimization Strategies

To meet constitutional performance requirements:

1. **Timeline Load <2s (SC-004)**:
   - Lazy load event details (fetch summary first, details on click)
   - Virtualize long lists with `react-window`
   - Implement date range filtering (only load visible timeframe)
   - Use indexes on event.date for fast queries

2. **Filtering <1s (SC-006)**:
   - Client-side filtering for loaded events
   - Debounce filter inputs (300ms)
   - Indexed database queries for server-side filters

3. **Real-time Sync <3s (SC-005)**:
   - Socket.IO rooms for efficient broadcasting
   - Optimistic UI updates (update immediately, reconcile with server)
   - Throttle rapid updates (batch within 100ms window)

4. **Mobile Performance (375px, SC-009)**:
   - Responsive CSS with mobile-first approach
   - Touch event optimization
   - Reduced animations on low-power devices
   - Code splitting for faster initial load

---

## Security Considerations

1. **Authentication**:
   - bcrypt for password hashing (12 rounds)
   - JWT expiration (24 hours)
   - HTTPS required in production

2. **Authorization**:
   - Middleware checks for authenticated routes
   - Role-based access control (Admin, Organizer, Viewer)

3. **Data Validation**:
   - Input validation with `zod` or `joi`
   - SQL injection protection (parameterized queries)
   - XSS protection (sanitize user inputs)

4. **Rate Limiting**:
   - `express-rate-limit` for API endpoints
   - Prevent brute force attacks on auth

---

## Next Steps

All technical unknowns have been resolved. Proceed to:
1. **Phase 1**: Generate data-model.md with detailed schemas
2. **Phase 1**: Create API contracts (OpenAPI spec)
3. **Phase 1**: Write quickstart.md for developer onboarding
