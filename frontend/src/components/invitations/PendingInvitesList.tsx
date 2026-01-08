import React, { useState } from 'react';
import { usePendingInvitations, useResendInvitation, useCancelInvitation } from '../../hooks/useInvitations';
import { TimelineInvitationPublic } from '../../types/invitation';
import { ROLE_CONFIG } from '../../types/timeline';

interface PendingInvitesListProps {
  timelineId: string;
}

const PendingInvitesList: React.FC<PendingInvitesListProps> = ({ timelineId }) => {
  const { data: invitations = [], isLoading, error } = usePendingInvitations(timelineId);
  const resendMutation = useResendInvitation(timelineId);
  const cancelMutation = useCancelInvitation(timelineId);

  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const handleResend = (invitationId: string) => {
    resendMutation.mutate(invitationId);
  };

  const handleCancelClick = (invitationId: string) => {
    setCancelConfirmId(invitationId);
  };

  const handleCancelConfirm = (invitationId: string) => {
    cancelMutation.mutate(invitationId, {
      onSettled: () => {
        setCancelConfirmId(null);
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeUntilExpiration = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h left`;
    }
    return `${diffHours}h left`;
  };

  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">Failed to load pending invitations</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show section if no pending invitations
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Pending Invitations ({invitations.length})
      </h3>

      <ul className="space-y-2">
        {invitations.map((invitation: TimelineInvitationPublic) => {
          const roleConfig = ROLE_CONFIG[invitation.role];
          const isExpiringSoon = new Date(invitation.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

          return (
            <li
              key={invitation.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Email icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {invitation.email}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}>
                      {roleConfig.label}
                    </span>
                    <span>•</span>
                    <span>Sent {formatDate(invitation.createdAt)}</span>
                    <span>•</span>
                    <span className={isExpiringSoon ? 'text-amber-600 font-medium' : ''}>
                      {getTimeUntilExpiration(invitation.expiresAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                {cancelConfirmId === invitation.id ? (
                  <>
                    <button
                      onClick={() => handleCancelConfirm(invitation.id)}
                      disabled={cancelMutation.isPending}
                      className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setCancelConfirmId(null)}
                      disabled={cancelMutation.isPending}
                      className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleResend(invitation.id)}
                      disabled={resendMutation.isPending}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Resend invitation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleCancelClick(invitation.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Cancel invitation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PendingInvitesList;
