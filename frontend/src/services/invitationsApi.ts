import apiClient from './api-client';
import {
  InvitationValidation,
  TimelineInvitationPublic,
  CreateInvitationRequest,
  AcceptNewUserRequest,
  AcceptInvitationResponse,
} from '../types/invitation';

/**
 * Invitation API endpoints
 * Provides methods for email invitation flow
 */
export const invitationsApi = {
  /**
   * Validate an invitation token
   * Public endpoint - no auth required
   */
  validateToken: async (token: string): Promise<InvitationValidation> => {
    const response = await apiClient.get(`/api/invitations/validate/${token}`);
    return response.data;
  },

  /**
   * Accept invitation as a new user (creates account)
   * Public endpoint - no auth required
   */
  acceptNewUser: async (token: string, data: AcceptNewUserRequest): Promise<AcceptInvitationResponse> => {
    const response = await apiClient.post(`/api/invitations/accept/${token}`, data);
    return response.data;
  },

  /**
   * Accept invitation as an existing user
   * Requires authentication
   */
  acceptExistingUser: async (token: string): Promise<AcceptInvitationResponse> => {
    const response = await apiClient.post(`/api/invitations/accept/${token}`, {});
    return response.data;
  },

  /**
   * Create a new email invitation (Admin only)
   */
  create: async (timelineId: string, data: CreateInvitationRequest): Promise<TimelineInvitationPublic> => {
    const response = await apiClient.post(`/api/timelines/${timelineId}/invitations`, data);
    return response.data;
  },

  /**
   * List pending invitations for a timeline (Admin only)
   */
  listPending: async (timelineId: string): Promise<{ invitations: TimelineInvitationPublic[] }> => {
    const response = await apiClient.get(`/api/timelines/${timelineId}/invitations`);
    return response.data;
  },

  /**
   * Resend an invitation email (Admin only)
   */
  resend: async (timelineId: string, invitationId: string): Promise<TimelineInvitationPublic> => {
    const response = await apiClient.post(`/api/timelines/${timelineId}/invitations/${invitationId}/resend`);
    return response.data;
  },

  /**
   * Cancel a pending invitation (Admin only)
   */
  cancel: async (timelineId: string, invitationId: string): Promise<void> => {
    await apiClient.delete(`/api/timelines/${timelineId}/invitations/${invitationId}`);
  },
};

export default invitationsApi;
