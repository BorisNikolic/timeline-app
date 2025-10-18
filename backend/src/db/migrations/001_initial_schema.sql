-- Festival Timeline Management App - Initial Schema
-- Created: 2025-10-18
-- Database: PostgreSQL 16

-- Create enums for event status and priority
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

-- Create unique index on email (case-insensitive)
CREATE UNIQUE INDEX idx_users_email_lower ON users(LOWER(email));

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  createdBy UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create unique index on category name (case-insensitive)
CREATE UNIQUE INDEX idx_categories_name_lower ON categories(LOWER(name));
CREATE INDEX idx_categories_createdBy ON categories(createdBy);

-- Add color format validation
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

-- Create indexes for events table
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_categoryId ON events(categoryId);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_priority ON events(priority);
CREATE INDEX idx_events_assignedPerson ON events(assignedPerson);
CREATE INDEX idx_events_createdBy ON events(createdBy);

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updatedAt updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO timeline_admin;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO timeline_admin;
