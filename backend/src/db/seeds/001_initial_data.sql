-- Festival Timeline Management App - Initial Seed Data
-- Created: 2025-10-18

-- Default admin user (password: admin123 - bcrypt hash with 12 rounds)
-- Note: This is for development only. Change in production!
INSERT INTO users (email, passwordHash, name)
VALUES (
  'admin@festival.app',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ztJ8cqFf1Q8G',
  'Admin User'
) ON CONFLICT DO NOTHING;

-- Default categories with colors
INSERT INTO categories (name, color, createdBy)
SELECT
  category.name,
  category.color,
  (SELECT id FROM users WHERE email = 'admin@festival.app')
FROM (VALUES
  ('Venue Setup', '#4A90E2'),
  ('Marketing', '#50C878'),
  ('Logistics', '#F5A623'),
  ('Entertainment', '#9013FE'),
  ('Food & Beverage', '#FF6B6B'),
  ('Security', '#5C7CFA'),
  ('Registration', '#FFD43B'),
  ('Cleanup', '#868E96')
) AS category(name, color)
ON CONFLICT DO NOTHING;

-- Sample events for demonstration (optional - can be removed for production)
INSERT INTO events (title, date, description, categoryId, assignedPerson, status, priority, createdBy)
SELECT
  event.title,
  event.date::date,
  event.description,
  (SELECT id FROM categories WHERE name = event.category_name),
  event.assignedPerson,
  event.status::event_status,
  event.priority::event_priority,
  (SELECT id FROM users WHERE email = 'admin@festival.app')
FROM (VALUES
  ('Setup main stage structure', '2025-11-01', 'Install main stage framework and lighting rigging', 'Venue Setup', 'John Doe', 'Not Started', 'High'),
  ('Book headliner artist', '2025-10-25', 'Confirm and sign contract with headliner', 'Entertainment', 'Sarah Smith', 'In Progress', 'High'),
  ('Launch social media campaign', '2025-10-20', 'Start Instagram and Facebook promotional posts', 'Marketing', 'Mike Johnson', 'Completed', 'Medium'),
  ('Order portable restrooms', '2025-10-28', 'Arrange delivery of 50 portable restroom units', 'Logistics', 'Emily Brown', 'Not Started', 'Medium'),
  ('Hire security staff', '2025-10-30', 'Contract 20 security personnel for event day', 'Security', 'David Wilson', 'In Progress', 'High')
) AS event(title, date, description, category_name, assignedPerson, status, priority)
ON CONFLICT DO NOTHING;
