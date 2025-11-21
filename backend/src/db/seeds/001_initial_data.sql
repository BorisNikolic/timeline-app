-- Festival Timeline Management App - Initial Seed Data
-- Created: 2025-10-18
-- Updated: 2025-10-21 - Customized for Boris Nikolic

-- Admin user
-- Email: boris.nikolic.dev@gmail.com
-- Password: EGznJd2HHTzpdQMDfoWpkQ==
-- IMPORTANT: Save this password securely! You'll need it for first login.
INSERT INTO users (email, passwordHash, name)
VALUES (
  'boris.nikolic.dev@gmail.com',
  '$2b$12$.3NrNIlmxS5YPBOFoHi0MOLOD.so4FHvLxq65EOOA07eFprF/yE.m',
  'Boris Nikolic'
) ON CONFLICT DO NOTHING;

-- Single category: Logistics
INSERT INTO categories (name, color, createdBy)
SELECT
  category.name,
  category.color,
  (SELECT id FROM users WHERE email = 'boris.nikolic.dev@gmail.com')
FROM (VALUES
  ('Logistics', '#F5A623')
) AS category(name, color)
ON CONFLICT DO NOTHING;

-- Single sample event
INSERT INTO events (title, date, description, categoryId, assignedPerson, status, priority, createdBy)
SELECT
  event.title,
  event.date::date,
  event.description,
  (SELECT id FROM categories WHERE name = event.category_name),
  event.assignedPerson,
  event.status::event_status,
  event.priority::event_priority,
  (SELECT id FROM users WHERE email = 'boris.nikolic.dev@gmail.com')
FROM (VALUES
  ('Sample task', '2025-11-01', 'This is a sample event for testing', 'Logistics', NULL, 'Not Started', 'Medium')
) AS event(title, date, description, category_name, assignedPerson, status, priority)
ON CONFLICT DO NOTHING;
