import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '../services/invitationsApi';
import {
  TimelineInvitationPublic,
  CreateInvitationRequest,
  AcceptNewUserRequest,
  AcceptInvitationResponse,
} from '../types/invitation';
import { showToast } from '../utils/toast';

/**
 * Query key factory for invitations
 */
export const invitationKeys = {
  all: ['invitations'] as const,
  validation: (token: string) => ['invitations', 'validate', token] as const,
  byTimeline: (timelineId: string) => ['invitations', 'timeline', timelineId] as const,
};

/**
 * Hook to validate an invitation token
 */
export function useValidateInvitation(token: string | undefined) {
  return useQuery({
    queryKey: invitationKeys.validation(token!),
    queryFn: () => invitationsApi.validateToken(token!),
    enabled: !!token,
    staleTime: 60000, // 1 minute
    retry: false, // Don't retry on invalid token
  });
}

/**
 * Hook to fetch pending invitations for a timeline
 */
export function usePendingInvitations(timelineId: string | undefined) {
  return useQuery({
    queryKey: invitationKeys.byTimeline(timelineId!),
    queryFn: async () => {
      const result = await invitationsApi.listPending(timelineId!);
      return result.invitations;
    },
    enabled: !!timelineId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to create a new email invitation
 */
export function useCreateInvitation(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationRequest) => invitationsApi.create(timelineId, data),
    onSuccess: (invitation: TimelineInvitationPublic) => {
      // Update cache with new invitation
      queryClient.setQueryData<TimelineInvitationPublic[]>(
        invitationKeys.byTimeline(timelineId),
        (old) => (old ? [...old, invitation] : [invitation])
      );
      showToast(`Invitation sent to ${invitation.email}`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send invitation', 'error');
    },
  });
}

/**
 * Hook to accept invitation as a new user
 */
export function useAcceptInvitationNewUser() {
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: AcceptNewUserRequest }) =>
      invitationsApi.acceptNewUser(token, data),
    onSuccess: (response: AcceptInvitationResponse) => {
      // Store token for auto-login
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      showToast(`Welcome to ${response.timeline.name}!`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to accept invitation', 'error');
    },
  });
}

/**
 * Hook to accept invitation as an existing user
 */
export function useAcceptInvitationExistingUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => invitationsApi.acceptExistingUser(token),
    onSuccess: (response: AcceptInvitationResponse) => {
      // Invalidate timelines to refresh the list
      queryClient.invalidateQueries({ queryKey: ['timelines'] });
      showToast(`You've joined ${response.timeline.name}!`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to accept invitation', 'error');
    },
  });
}

/**
 * Hook to resend an invitation email
 */
export function useResendInvitation(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => invitationsApi.resend(timelineId, invitationId),
    onSuccess: (updatedInvitation: TimelineInvitationPublic) => {
      // Update cache with new expiration
      queryClient.setQueryData<TimelineInvitationPublic[]>(
        invitationKeys.byTimeline(timelineId),
        (old) =>
          old?.map((inv) =>
            inv.id === updatedInvitation.id ? updatedInvitation : inv
          ) || []
      );
      showToast(`Invitation resent to ${updatedInvitation.email}`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to resend invitation', 'error');
    },
  });
}

/**
 * Hook to cancel a pending invitation
 */
export function useCancelInvitation(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => invitationsApi.cancel(timelineId, invitationId),
    onMutate: async (invitationId: string) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: invitationKeys.byTimeline(timelineId) });

      const previousInvitations = queryClient.getQueryData<TimelineInvitationPublic[]>(
        invitationKeys.byTimeline(timelineId)
      );

      queryClient.setQueryData<TimelineInvitationPublic[]>(
        invitationKeys.byTimeline(timelineId),
        (old) => old?.filter((inv) => inv.id !== invitationId) || []
      );

      return { previousInvitations };
    },
    onSuccess: () => {
      showToast('Invitation cancelled', 'success');
    },
    onError: (error: Error, _invitationId, context) => {
      // Rollback on error
      if (context?.previousInvitations) {
        queryClient.setQueryData(
          invitationKeys.byTimeline(timelineId),
          context.previousInvitations
        );
      }
      showToast(error.message || 'Failed to cancel invitation', 'error');
    },
  });
}
