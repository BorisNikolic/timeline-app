import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMembers } from './useMembers';
import { MemberRole, hasMinimumRole } from '../types/timeline';

interface TimelineRoleResult {
  role: MemberRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  canEdit: boolean; // Admin or Editor
  canManage: boolean; // Admin only
}

/**
 * Hook to check the current user's role in a specific timeline
 */
export function useTimelineRole(timelineId: string | undefined): TimelineRoleResult {
  const { user } = useAuth();
  const { data: members, isLoading } = useMembers(timelineId);

  const result = useMemo(() => {
    if (!user || !members) {
      return {
        role: null,
        isLoading: isLoading,
        isAdmin: false,
        isEditor: false,
        isViewer: false,
        canEdit: false,
        canManage: false,
      };
    }

    const membership = members.find((m) => m.userId === user.id);
    const role = membership?.role || null;

    return {
      role,
      isLoading: false,
      isAdmin: role === 'Admin',
      isEditor: role === 'Editor',
      isViewer: role === 'Viewer',
      canEdit: role ? hasMinimumRole(role, 'Editor') : false,
      canManage: role === 'Admin',
    };
  }, [user, members, isLoading]);

  return result;
}

/**
 * Hook to check if user has at least the required role
 */
export function useHasMinimumRole(
  timelineId: string | undefined,
  requiredRole: MemberRole
): boolean {
  const { role } = useTimelineRole(timelineId);
  return role ? hasMinimumRole(role, requiredRole) : false;
}

export default useTimelineRole;
