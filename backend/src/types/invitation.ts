// Invitation types for Email Timeline Invites
// Feature: 002-email-timeline-invites

import { MemberRole } from './timeline';

// Invitation status enum matching database type
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

// Timeline invitation entity (full database record)
export interface TimelineInvitation {
  id: string;
  email: string;
  tokenHash: string;
  role: MemberRole;
  status: InvitationStatus;
  timelineId: string;
  invitedBy: string;
  targetUserId: string | null;
  expiresAt: string;  // ISO timestamp
  acceptedAt: string | null;
  acceptedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Public invitation (excludes sensitive tokenHash)
export interface TimelineInvitationPublic {
  id: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  timelineId: string;
  timelineName: string;
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
}

// Token validation response for frontend
export interface InvitationValidation {
  valid: boolean;
  expired?: boolean;
  email?: string;
  role?: MemberRole;
  timelineId?: string;
  timelineName?: string;
  inviterName?: string;
  isExistingUser?: boolean;
}

// DTOs for create/accept operations
export interface CreateInvitationDto {
  email: string;
  role: MemberRole;
}

export interface AcceptNewUserDto {
  name: string;
  password: string;
}

// Response after accepting invitation
export interface AcceptInvitationResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  };
  timeline: {
    id: string;
    name: string;
    description: string | null;
  };
  role: MemberRole;
  token?: string;  // JWT token (only for new user registration)
}

// Error codes for invitation operations
export type InvitationErrorCode =
  | 'INVALID_TOKEN'
  | 'INVITATION_EXPIRED'
  | 'INVITATION_CANCELLED'
  | 'EMAIL_MISMATCH'
  | 'ALREADY_MEMBER'
  | 'EMAIL_SEND_FAILED'
  | 'VALIDATION_ERROR';

export class InvitationError extends Error {
  constructor(
    public code: InvitationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'InvitationError';
  }
}
