/**
 * TimelineSettingsPage component
 * Feature: 001-multi-timeline-system
 *
 * Settings page for editing timeline details (Admin only)
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TimelineForm } from '../components/shared/TimelineForm';
import { DeleteTimelineConfirmDialog } from '../components/shared/DeleteTimelineConfirmDialog';
import CopyTimelineModal from '../components/shared/CopyTimelineModal';
import MemberList from '../components/members/MemberList';
import InviteMemberModal from '../components/members/InviteMemberModal';
import InviteByEmailModal from '../components/invitations/InviteByEmailModal';
import PendingInvitesList from '../components/invitations/PendingInvitesList';
import {
  useTimeline,
  useUpdateTimeline,
  useDeleteTimeline,
  useUnarchiveTimeline,
  useSetTemplate,
} from '../hooks/useTimelines';
import { useTimelineEvents } from '../hooks/useEvents';
import { useMembers, useLeaveTimeline } from '../hooks/useMembers';
import { useTimelineRole } from '../hooks/useTimelineRole';
import { useAuth } from '../contexts/AuthContext';
import { CreateTimelineDto, STATUS_CONFIG, TimelineStatus, UpdateTimelineDto, TimelineWithStats } from '../types/timeline';
import StatusTransitionDropdown from '../components/timeline/StatusTransitionDropdown';

export function TimelineSettingsPage() {
  const { timelineId } = useParams<{ timelineId: string }>();
  const navigate = useNavigate();
  // Use role for THIS timeline, not the currently selected timeline in switcher
  const { role } = useTimelineRole(timelineId);
  const { user } = useAuth();

  const { data: timeline, isLoading, error } = useTimeline(timelineId);
  const { mutate: updateTimeline, isPending: isUpdating } = useUpdateTimeline();
  const { mutate: deleteTimeline, isPending: isDeleting } = useDeleteTimeline();
  const { mutate: unarchiveTimeline, isPending: isUnarchiving } = useUnarchiveTimeline();
  const { mutate: setTemplate, isPending: isSettingTemplate } = useSetTemplate();
  const { data: members = [], isLoading: isMembersLoading } = useMembers(timelineId);
  const { mutate: leaveTimeline, isPending: isLeaving } = useLeaveTimeline();
  // Fetch events for out-of-range warning (EC-3)
  const { data: events = [] } = useTimelineEvents(timelineId);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEmailInviteModal, setShowEmailInviteModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Only admins can access settings
  if (role && role !== 'Admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800">Access Denied</h2>
          <p className="mt-2 text-yellow-700">
            Only timeline administrators can access settings.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-md hover:bg-yellow-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800">Error</h2>
          <p className="mt-2 text-red-700">
            Failed to load timeline settings. Please try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 text-sm font-medium text-red-800 bg-red-100 rounded-md hover:bg-red-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: CreateTimelineDto) => {
    if (!timelineId) return;

    updateTimeline({
      id: timelineId,
      data,
      expectedUpdatedAt: timeline.updatedAt,
    });
  };

  const handleDelete = () => {
    if (!timelineId) return;

    deleteTimeline(timelineId, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  const handleStatusChange = (newStatus: TimelineStatus) => {
    if (!timelineId) return;

    // Special case: unarchive uses dedicated endpoint
    if (timeline.status === 'Archived' && newStatus === 'Completed') {
      unarchiveTimeline(timelineId);
    } else {
      updateTimeline({
        id: timelineId,
        data: { status: newStatus } as UpdateTimelineDto,
        expectedUpdatedAt: timeline.updatedAt,
      });
    }
  };

  const statusConfig = STATUS_CONFIG[timeline.status as TimelineStatus];
  const isStatusChanging = isUpdating || isUnarchiving;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timeline Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage settings for this timeline
            </p>
          </div>
          <StatusTransitionDropdown
            currentStatus={timeline.status as TimelineStatus}
            onStatusChange={handleStatusChange}
            disabled={role !== 'Admin'}
            isLoading={isStatusChanging}
          />
        </div>
      </div>

      {/* Lifecycle Management Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Timeline Status
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-2">
                Current status: <span className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
              </p>
              <p className="text-xs text-gray-500">
                {timeline.status === 'Planning' && 'Timeline is being prepared. Move to Active when the festival begins.'}
                {timeline.status === 'Active' && 'Festival is in progress. Move to Completed when finished.'}
                {timeline.status === 'Completed' && 'Festival has ended. You can add retrospective notes to events or archive the timeline.'}
                {timeline.status === 'Archived' && 'Timeline is archived and read-only. Only Admins can make changes.'}
              </p>
            </div>
          </div>

          {/* Status progression visualization */}
          <div className="flex items-center gap-2 py-3">
            {(['Planning', 'Active', 'Completed', 'Archived'] as TimelineStatus[]).map((status, index) => {
              const config = STATUS_CONFIG[status];
              const isCurrentOrPast =
                ['Planning', 'Active', 'Completed', 'Archived'].indexOf(timeline.status as TimelineStatus) >=
                ['Planning', 'Active', 'Completed', 'Archived'].indexOf(status);
              const isCurrent = status === timeline.status;

              return (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? `${config.bgColor} ${config.color} ring-2 ring-offset-2 ring-current`
                        : isCurrentOrPast
                        ? `${config.bgColor} ${config.color} opacity-60`
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {config.label}
                  </div>
                  {index < 3 && (
                    <svg className={`w-4 h-4 ${isCurrentOrPast && status !== timeline.status ? 'text-gray-400' : 'text-gray-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          General Settings
        </h2>
        <TimelineForm
          initialData={timeline}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          isLoading={isUpdating}
          submitLabel="Save Changes"
          events={events}
        />
      </div>

      {/* Statistics */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Members</p>
            <p className="text-2xl font-semibold text-gray-900">
              {timeline.memberCount}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Events</p>
            <p className="text-2xl font-semibold text-gray-900">
              {timeline.eventCount}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-semibold text-gray-900">
              {timeline.completedEventCount}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-2xl font-semibold text-gray-900">
              {timeline.completionPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Template Settings */}
      {role === 'Admin' && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Settings</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Make this timeline a template</p>
              <p className="text-xs text-gray-500 mt-1">
                Templates are visible to all users and can be used as starting points for new timelines.
              </p>
            </div>
            <button
              onClick={() => setTemplate({ id: timelineId!, isTemplate: !timeline.isTemplate })}
              disabled={isSettingTemplate}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                timeline.isTemplate ? 'bg-primary-600' : 'bg-gray-200'
              } ${isSettingTemplate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  timeline.isTemplate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {timeline.isTemplate && (
            <div className="mt-3 flex items-center gap-2 text-sm text-primary-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              This timeline is available as a template
            </div>
          )}
        </div>
      )}

      {/* Clone Timeline */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clone Timeline</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">Create a copy of this timeline</p>
            <p className="text-xs text-gray-500 mt-1">
              Clone this timeline with its categories and events to use as a starting point for a new project.
            </p>
          </div>
          <button
            onClick={() => setShowCopyModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Clone Timeline
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500">
              Manage who has access to this timeline
            </p>
          </div>
          {role === 'Admin' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmailInviteModal(true)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Invite via Email
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="Add existing user"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Add User
              </button>
            </div>
          )}
        </div>

        <MemberList
          timelineId={timelineId!}
          members={members}
          ownerId={timeline.ownerId}
          currentUserRole={role || 'Viewer'}
          isLoading={isMembersLoading}
        />

        {/* Pending Invitations (Admin only) */}
        {role === 'Admin' && (
          <PendingInvitesList timelineId={timelineId!} />
        )}

        {/* Leave Timeline (for non-owners) */}
        {user && timeline.ownerId !== user.id && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to leave this timeline?')) {
                  leaveTimeline(timelineId!, {
                    onSuccess: () => navigate('/dashboard'),
                  });
                }
              }}
              disabled={isLeaving}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {isLeaving ? 'Leaving...' : 'Leave Timeline'}
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg p-6 border border-red-200">
        <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Deleting a timeline will permanently remove all events, categories, and
          member associations. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Timeline
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteTimelineConfirmDialog
        isOpen={showDeleteDialog}
        timelineName={timeline.name}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isDeleting={isDeleting}
      />

      {/* Invite Member Modal (for existing users) */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        timelineId={timelineId!}
      />

      {/* Invite via Email Modal */}
      <InviteByEmailModal
        isOpen={showEmailInviteModal}
        onClose={() => setShowEmailInviteModal(false)}
        timelineId={timelineId!}
      />

      {/* Copy Timeline Modal */}
      {timeline && (
        <CopyTimelineModal
          isOpen={showCopyModal}
          onClose={() => setShowCopyModal(false)}
          sourceTimeline={timeline as TimelineWithStats}
        />
      )}
    </div>
  );
}

export default TimelineSettingsPage;
