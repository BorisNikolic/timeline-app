import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi, userSearchApi } from '../services/timelinesApi';
import {
  TimelineMemberWithUser,
  InviteMemberDto,
  MemberRole,
} from '../types/timeline';
import { showToast } from '../utils/toast';

/**
 * Query key factory for members
 */
export const memberKeys = {
  all: ['members'] as const,
  byTimeline: (timelineId: string) => [...memberKeys.all, timelineId] as const,
  userSearch: (query: string, excludeTimelineId?: string) =>
    ['userSearch', query, excludeTimelineId] as const,
};

/**
 * Hook to fetch members of a timeline
 */
export function useMembers(timelineId: string | undefined) {
  return useQuery({
    queryKey: memberKeys.byTimeline(timelineId!),
    queryFn: () => membersApi.getAll(timelineId!),
    enabled: !!timelineId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to search users for invitation
 */
export function useUserSearch(query: string, excludeTimelineId?: string) {
  return useQuery({
    queryKey: memberKeys.userSearch(query, excludeTimelineId),
    queryFn: () => userSearchApi.search(query, excludeTimelineId),
    enabled: query.length >= 2,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to invite a new member
 */
export function useInviteMember(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberDto) => membersApi.invite(timelineId, data),
    onSuccess: (newMember: TimelineMemberWithUser) => {
      // Update cache with new member
      queryClient.setQueryData<TimelineMemberWithUser[]>(
        memberKeys.byTimeline(timelineId),
        (old) => (old ? [...old, newMember] : [newMember])
      );
      showToast(`${newMember.user.name} has been invited as ${newMember.role}`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to invite member', 'error');
    },
  });
}

/**
 * Hook to update a member's role
 */
export function useUpdateMemberRole(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
      membersApi.updateRole(timelineId, userId, { role }),
    onSuccess: (updatedMember: TimelineMemberWithUser) => {
      // Update cache
      queryClient.setQueryData<TimelineMemberWithUser[]>(
        memberKeys.byTimeline(timelineId),
        (old) =>
          old?.map((member) =>
            member.userId === updatedMember.userId ? updatedMember : member
          ) || []
      );
      showToast(`${updatedMember.user.name}'s role updated to ${updatedMember.role}`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update role', 'error');
    },
  });
}

/**
 * Hook to remove a member
 */
export function useRemoveMember(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => membersApi.remove(timelineId, userId),
    onSuccess: (_, userId) => {
      // Remove from cache
      queryClient.setQueryData<TimelineMemberWithUser[]>(
        memberKeys.byTimeline(timelineId),
        (old) => old?.filter((member) => member.userId !== userId) || []
      );
      showToast('Member removed successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to remove member', 'error');
    },
  });
}

/**
 * Hook for current user to leave a timeline
 */
export function useLeaveTimeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timelineId: string) => membersApi.leave(timelineId),
    onSuccess: (_, timelineId) => {
      // Invalidate timeline queries since we no longer have access
      queryClient.invalidateQueries({ queryKey: ['timelines'] });
      queryClient.removeQueries({ queryKey: memberKeys.byTimeline(timelineId) });
      showToast('You have left the timeline', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to leave timeline', 'error');
    },
  });
}
