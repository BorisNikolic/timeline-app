# Data Model: Festival Timeline Management App

**Created**: 2025-10-18
**Database**: PostgreSQL 16
**Purpose**: Define entities, relationships, and validation rules

## Overview

The data model supports a single shared timeline where all users collaborate on the same set of events and categories. The design prioritizes data integrity, simple collaboration, and efficient querying for timeline visualization.

---

## Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    User      │         │   Category   │         │    Event     │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │───┐     │ id (PK)      │──┐      │ id (PK)      │
│ email        │   │     │ name         │  │      │ title        │
│ passwordHash │   │     │ color        │  │      │ date         │
│ name         │   │     │ createdBy ───┼──┘      │ description  │
│ role         │   │     │ createdAt    │         │ categoryId ──┼─→ Category
│ createdAt    │   │     └──────────────┘         │ assignedPerson
│ updatedAt    │   │                              │ status       │
└──────────────┘   │                              │ priority     │
                   └──────────────────────────────┼─ createdBy   │
                                                  │ createdAt    │
                                                  │ updatedAt    │
                                                  └──────────────┘
```

---

## Entities

### 1. User

**Purpose**: Represents team members who can create, view, and manage events.

**Table**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (used for login) |
| passwordHash | VARCHAR(255) | NOT NULL | Bcrypt hash of password |
| name | VARCHAR(255) | NOT NULL | Display name |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
```sql
CREATE INDEX idx_users_email ON users(email);
```

**Validation Rules**:
- Email must be valid format (regex validation)
- Password must be ≥8 characters (enforced at application layer)
- Name must be 1-255 characters

---

### 2. Category

**Purpose**: Represents organizational groupings for events (venue, marketing, logistics, etc.).

**Table**: `categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Category name |
| color | VARCHAR(7) | NOT NULL | Hex color code for timeline visualization (#RRGGBB) |
| createdBy | UUID | FOREIGN KEY(users.id), NOT NULL | User who created this category |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
```sql
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_createdBy ON categories(createdBy);
```

**Validation Rules**:
- Name must be 1-100 characters
- Name must be unique (case-insensitive)
- Color must be valid hex format (#RRGGBB)
- createdBy must reference existing user
- All users can create, modify, and delete any categories

**Default Categories**:
Initial seed data should include:
- Venue Setup (#4A90E2)
- Marketing (#50C878)
- Logistics (#F5A623)
- Entertainment (#9013FE)
- Food & Beverage (#FF6B6B)
- Security (#5C7CFA)
- Registration (#FFD43B)
- Cleanup (#868E96)

---

### 3. Event

**Purpose**: Represents tasks or milestones in the festival planning process.

**Table**: `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Event title |
| date | DATE | NOT NULL | Event date (can be past, present, or future) |
| description | TEXT | NULL | Optional detailed description |
| categoryId | UUID | FOREIGN KEY(categories.id), NOT NULL | Category assignment |
| assignedPerson | VARCHAR(255) | NULL | Name of assigned person (free text, not FK) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'Not Started' | Current status (see enum) |
| priority | VARCHAR(50) | NOT NULL, DEFAULT 'Medium' | Priority level (see enum) |
| createdBy | UUID | FOREIGN KEY(users.id), NOT NULL | User who created this event |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Enums**:
```sql
CREATE TYPE event_status AS ENUM ('Not Started', 'In Progress', 'Completed');
CREATE TYPE event_priority AS ENUM ('High', 'Medium', 'Low');
```

**Indexes**:
```sql
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_categoryId ON events(categoryId);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_priority ON events(priority);
CREATE INDEX idx_events_assignedPerson ON events(assignedPerson);
CREATE INDEX idx_events_createdBy ON events(createdBy);
```

**Validation Rules**:
- Title must be 1-255 characters
- Date is required (can be any date - past allowed for historical tracking)
- Description can be empty or up to 10,000 characters
- categoryId must reference existing category
- assignedPerson is free text (0-255 characters) - allows flexibility for external contractors
- status must be one of enum values
- priority must be one of enum values
- createdBy must reference existing user

**Soft Delete**: Not implemented - actual DELETE operations (with confirmation)

---

## Relationships

### User → Category (One-to-Many)
- One user can create multiple categories
- Each category has exactly one creator
- Foreign key: `categories.createdBy → users.id`
- On user delete: RESTRICT (cannot delete user who created categories)

### User → Event (One-to-Many)
- One user can create multiple events
- Each event has exactly one creator
- Foreign key: `events.createdBy → users.id`
- On user delete: RESTRICT (cannot delete user who created events)

### Category → Event (One-to-Many)
- One category can contain multiple events
- Each event belongs to exactly one category
- Foreign key: `events.categoryId → categories.id`
- On category delete: RESTRICT (cannot delete category with existing events)

---

## Data Integrity Rules

### Concurrent Edit Handling (FR-018)

**Strategy**: Last-write-wins with optimistic locking

```typescript
// Application-level implementation
UPDATE events
SET
  title = $1,
  date = $2,
  updatedAt = NOW()
WHERE
  id = $3
  AND updatedAt = $4  -- Optimistic lock check
RETURNING *;
```

- If `updatedAt` doesn't match, query returns 0 rows → conflict detected
- Application can choose to:
  - **Last-write-wins**: Force update with new timestamp
  - **Notify user**: Show conflict message with option to overwrite

### Validation at Database Level

```sql
-- Enforce email uniqueness (case-insensitive)
CREATE UNIQUE INDEX idx_users_email_lower ON users(LOWER(email));

-- Enforce category name uniqueness (case-insensitive)
CREATE UNIQUE INDEX idx_categories_name_lower ON categories(LOWER(name));

-- Ensure color format
ALTER TABLE categories
ADD CONSTRAINT chk_color_format
CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
```

---

## Migration Strategy

### Initial Schema (v1)

```sql
-- Create enums
CREATE TYPE event_status AS ENUM ('Not Started', 'In Progress', 'Completed');
CREATE TYPE event_priority AS ENUM ('High', 'Medium', 'Low');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email_lower ON users(LOWER(email));

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  createdBy UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_categories_name_lower ON categories(LOWER(name));
CREATE INDEX idx_categories_createdBy ON categories(createdBy);
ALTER TABLE categories ADD CONSTRAINT chk_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  categoryId UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  assignedPerson VARCHAR(255),
  status event_status NOT NULL DEFAULT 'Not Started',
  priority event_priority NOT NULL DEFAULT 'Medium',
  createdBy UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_categoryId ON events(categoryId);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_priority ON events(priority);
CREATE INDEX idx_events_assignedPerson ON events(assignedPerson);
CREATE INDEX idx_events_createdBy ON events(createdBy);
```

### Seed Data

```sql
-- Default admin user (password: admin123 - bcrypt hash)
INSERT INTO users (email, passwordHash, name)
VALUES (
  'admin@festival.app',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ztJ8cqFf1Q8G',
  'Admin User'
);

-- Default categories
INSERT INTO categories (name, color, createdBy) VALUES
  ('Venue Setup', '#4A90E2', (SELECT id FROM users WHERE email = 'admin@festival.app')),
  ('Marketing', '#50C878', (SELECT id FROM users WHERE email = 'admin@festival.app')),
  ('Logistics', '#F5A623', (SELECT id FROM users WHERE email = 'admin@festival.app')),
  ('Entertainment', '#9013FE', (SELECT id FROM users WHERE email = 'admin@festival.app')),
  ('Food & Beverage', '#FF6B6B', (SELECT id FROM users WHERE email = 'admin@festival.app')),
  ('Security', '#5C7CFA', (SELECT id FROM users WHERE email = 'admin@festival.app')),
  ('Registration', '#FFD43B', (SELECT id FROM users WHERE email = 'admin@festival.app')),
  ('Cleanup', '#868E96', (SELECT id FROM users WHERE email = 'admin@festival.app'));
```

---

## Performance Considerations

### Query Optimization

**Timeline Load** (SC-004: <2s with 200+ events):
```sql
-- Fetch events for timeline with category info
SELECT
  e.id, e.title, e.date, e.status, e.priority, e.assignedPerson,
  c.name as categoryName, c.color as categoryColor,
  u.name as createdByName
FROM events e
JOIN categories c ON e.categoryId = c.id
JOIN users u ON e.createdBy = u.id
WHERE e.date BETWEEN $1 AND $2  -- Date range filter
ORDER BY e.date ASC;
```

**Filtering** (SC-006: <1s):
```sql
-- Indexed columns (status, priority, categoryId) enable fast filtering
SELECT * FROM events
WHERE
  status = 'In Progress'
  AND priority = 'High'
  AND categoryId = $1
ORDER BY date ASC;
```

### Pagination

For very large timelines (>1000 events):
```sql
SELECT * FROM events
WHERE date >= $1
ORDER BY date ASC
LIMIT 100 OFFSET $2;
```

---

## TypeScript Type Definitions

```typescript
// Enums
export enum EventStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed'
}

export enum EventPriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

// Entity types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdBy: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  description?: string;
  categoryId: string;
  assignedPerson?: string;
  status: EventStatus;
  priority: EventPriority;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO types (for API responses)
export interface EventWithDetails extends Event {
  category: Category;
  createdByUser: Pick<User, 'id' | 'name'>;
}
```

---

## Next Steps

1. ✅ Data model complete
2. → Generate API contracts (OpenAPI spec)
3. → Create quickstart.md
4. → Re-evaluate Constitution Check
