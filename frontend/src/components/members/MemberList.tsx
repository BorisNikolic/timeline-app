import React, { useState } from 'react';
import { TimelineMemberWithUser, MemberRole } from '../../types/timeline';
import { useAuth } from '../../contexts/AuthContext';
import { useUpdateMemberRole, useRemoveMember } from '../../hooks/useMembers';
import RoleDropdown from './RoleDropdown';
import DeleteConfirmDialog from '../shared/DeleteConfirmDialog';

interface MemberListProps {
  timelineId: string;
  members: TimelineMemberWithUser[];
  ownerId: string;
  currentUserRole: MemberRole;
  isLoading?: boolean;
}

const MemberList: React.FC<MemberListProps> = ({
  timelineId,
  members,
  ownerId,
  currentUserRole,
  isLoading = false,
}) => {
  const { user: currentUser } = useAuth();
  const updateRoleMutation = useUpdateMemberRole(timelineId);
  const removeMemberMutation = useRemoveMember(timelineId);

  // State for remove member confirmation dialog
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null);

  const canManageMembers = currentUserRole === 'Admin';

  const handleRoleChange = (userId: string, newRole: MemberRole) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleRemoveClick = (userId: string, memberName: string) => {
    setMemberToRemove({ userId, name: memberName });
  };

  const handleRemoveConfirm = () => {
    if (memberToRemove) {
      removeMemberMutation.mutate(memberToRemove.userId, {
        onSettled: () => setMemberToRemove(null),
      });
    }
  };

  const handleRemoveCancel = () => {
    setMemberToRemove(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded mt-1" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No members found
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const isOwner = member.userId === ownerId;
          const isCurrentUser = member.userId === currentUser?.id;
          const canEditRole = canManageMembers && !isOwner && !isCurrentUser;
          const canRemove = canManageMembers && !isOwner && !isCurrentUser;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>

                {/* Name and email */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {member.user.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-gray-500">(you)</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{member.user.email}</span>
                </div>
              </div>

              {/* Role and actions */}
              <div className="flex items-center gap-3">
                <RoleDropdown
                  currentRole={member.role}
                  onRoleChange={(role) => handleRoleChange(member.userId, role)}
                  disabled={!canEditRole || updateRoleMutation.isPending}
                  isOwner={isOwner}
                />

                {canRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemoveClick(member.userId, member.user.name)}
                    disabled={removeMemberMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Remove member"
                    aria-label={`Remove ${member.user.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Remove member confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={!!memberToRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this timeline? They will lose access to all timeline content.`}
        confirmLabel="Remove"
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
        isLoading={removeMemberMutation.isPending}
      />
    </>
  );
};

export default MemberList;
