import React from 'react';
import { TimelineStatus, MemberRole, STATUS_CONFIG } from '../../types/timeline';

interface ReadOnlyBannerProps {
  timelineStatus?: TimelineStatus;
  userRole?: MemberRole;
  showWhen?: 'archived' | 'viewer' | 'both';
}

/**
 * Banner component showing read-only status for archived timelines or viewers
 *
 * Shows when:
 * - Timeline is Archived (for non-Admin users)
 * - User has Viewer role
 */
const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({
  timelineStatus,
  userRole,
  showWhen = 'both',
}) => {
  const isArchived = timelineStatus === 'Archived';
  const isViewer = userRole === 'Viewer';
  const isAdmin = userRole === 'Admin';

  // Don't show banner if admin viewing archived (they can still edit)
  const showArchivedBanner = isArchived && !isAdmin && (showWhen === 'archived' || showWhen === 'both');
  const showViewerBanner = isViewer && !isArchived && (showWhen === 'viewer' || showWhen === 'both');

  if (!showArchivedBanner && !showViewerBanner) {
    return null;
  }

  // Determine message and styling based on reason
  if (showArchivedBanner) {
    const statusConfig = STATUS_CONFIG['Archived'];
    return (
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <span className="text-gray-600">
            This timeline is{' '}
            <span className={`font-medium ${statusConfig.color}`}>archived</span> and
            read-only.
          </span>
        </div>
      </div>
    );
  }

  if (showViewerBanner) {
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
          <svg
            className="w-4 h-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-blue-700">
            You have <span className="font-medium">view-only</span> access to this timeline.
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default ReadOnlyBanner;
