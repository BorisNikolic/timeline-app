-- Migration: 004_invitations.sql
-- Description: Add email invitation system for timeline collaboration
-- Date: 2026-01-08
-- Feature: 002-email-timeline-invites

BEGIN;

-- 1. Create invitation status enum
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- 2. Create timeline_invitations table
CREATE TABLE timeline_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  email VARCHAR(255) NOT NULL,                    -- Invitee email (always stored lowercase)
  tokenHash VARCHAR(255) NOT NULL,                -- bcrypt hash of invitation token
  role member_role NOT NULL DEFAULT 'Viewer',     -- Role to assign on acceptance
  status invitation_status NOT NULL DEFAULT 'pending',

  -- Relationships
  timelineId UUID NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
  invitedBy UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  targetUserId UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL if new user

  -- Tracking
  expiresAt TIMESTAMP NOT NULL,                   -- 7 days from creation
  acceptedAt TIMESTAMP,                           -- When invitation was accepted
  acceptedByUserId UUID REFERENCES users(id) ON DELETE SET NULL,  -- Who accepted

  -- Metadata
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 3. Indexes
CREATE INDEX idx_invitations_timeline ON timeline_invitations(timelineId);
CREATE INDEX idx_invitations_email ON timeline_invitations(LOWER(email));
CREATE INDEX idx_invitations_status ON timeline_invitations(status) WHERE status = 'pending';
CREATE INDEX idx_invitations_expires ON timeline_invitations(expiresAt) WHERE status = 'pending';

-- 4. Unique constraint: one pending invite per email per timeline
CREATE UNIQUE INDEX idx_invitations_pending_unique
  ON timeline_invitations(timelineId, LOWER(email))
  WHERE status = 'pending';

-- 5. Trigger for updatedAt
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON timeline_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
