# Code Style and Conventions

## TypeScript
- Strict mode enabled
- Interface naming: PascalCase (e.g., `EventWithDetails`)
- Enum values: String enums matching database enums exactly
- No `internal` modifier (use `public` for what should be public)

## Database
- All queries use parameterized values: `query('SELECT * FROM events WHERE id = $1', [id])`
- Foreign key constraints: ON DELETE RESTRICT
- UUID primary keys generated with `gen_random_uuid()`

## React Components
- Functional components with hooks (no class components)
- Props interfaces defined inline or exported if shared
- Event handlers prefixed with `handle` (e.g., `handleEditEvent`)
- Zustand stores follow pattern: `const { data, actions } = useStore()`

## File Organization
- Components organized by feature domain
- Hooks in dedicated `/hooks` directory
- Types in `/types` directory
- Utilities in `/utils` directory

## API Patterns
- Route handlers in `/api/` with Zod validation
- Business logic in `/services/`
- Middleware for cross-cutting concerns

## Security
- Parameterized SQL queries (no string interpolation)
- JWT tokens for authentication
- Input validation with Zod
- CORS configuration for frontend URL
