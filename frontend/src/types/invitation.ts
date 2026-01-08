// ============================================================================
// Email Timeline Invites Types (Feature: 002-email-timeline-invites)
// ============================================================================

import { MemberRole } from './timeline';

// Invitation status matching backend
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

// Token validation response from API
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

// Public invitation data (for listing)
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

// Request to create an invitation
export interface CreateInvitationRequest {
  email: string;
  role: MemberRole;
}

// Request to accept invitation as new user
export interface AcceptNewUserRequest {
  name: string;
  password: string;
}

// Response after accepting an invitation
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

// Error response from invitation endpoints
export interface InvitationErrorResponse {
  error: string;
  message: string;
  isExistingUser?: boolean;
  details?: Array<{ path: string; message: string }>;
}
