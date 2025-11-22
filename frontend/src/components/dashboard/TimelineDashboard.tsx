/**
 * TimelineDashboard component
 * Feature: 001-multi-timeline-system (User Story 3)
 *
 * Main dashboard view with grouped timelines and stats
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboard, useDashboardStats } from '../../hooks/useDashboard';
import { DashboardFilters as FilterType, TimelineCard as TimelineCardType, TimelineWithStats } from '../../types/timeline';
import { TimelineCard } from './TimelineCard';
import { DashboardFilters } from './DashboardFilters';
import { DashboardStats } from './DashboardStats';
import { useTimelineStore } from '../../stores/timelineStore';
import { preferencesApi } from '../../services/timelinesApi';
import CopyTimelineModal from '../shared/CopyTimelineModal';

interface TimelineDashboardProps {
  onCreateTimeline?: () => void;
}

export function TimelineDashboard({ onCreateTimeline }: TimelineDashboardProps) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterType>({
    sortBy: 'startDate',
    sortOrder: 'desc',
  });
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [timelineToCopy, setTimelineToCopy] = useState<TimelineWithStats | null>(null);

  const { data: dashboard, isLoading, error } = useDashboard(filters);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { setCurrentTimeline } = useTimelineStore();

  const handleCopyTimeline = (timeline: TimelineCardType) => {
    // Convert TimelineCard to TimelineWithStats for the modal
    const timelineWithStats: TimelineWithStats = {
      ...timeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: '',
      isTemplate: false,
      completedEventCount: timeline.eventsByStatus?.completed || 0,
    };
    setTimelineToCopy(timelineWithStats);
    setCopyModalOpen(true);
  };

  const handleSelectTimeline = (timelineId: string) => {
    // Find the timeline to get its role
    const timeline = dashboard?.timelines.find((t) => t.id === timelineId);
    if (timeline) {
      setCurrentTimeline(timelineId, timeline.userRole);
      // Update backend preference
      preferencesApi.setLastTimeline(timelineId).catch(() => {
        // Silently fail - not critical
      });
      // Navigate to the timeline page
      navigate(`/timeline/${timelineId}`);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Failed to load dashboard data</p>
        <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  const renderTimelineSection = (
    title: string,
    timelines: TimelineCardType[],
    emptyMessage: string
  ) => {
    if (timelines.length === 0 && !filters.status) {
      return null; // Don't show empty sections unless filtering
    }

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({timelines.length})
            </span>
          </h2>
        </div>
        {timelines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timelines.map((timeline) => (
              <TimelineCard
                key={timeline.id}
                timeline={timeline}
                onSelect={handleSelectTimeline}
                onCopy={handleCopyTimeline}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4">{emptyMessage}</p>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Stats Section */}
      {stats && <DashboardStats stats={stats} isLoading={statsLoading} />}

      {/* Filters */}
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-2 bg-gray-200 rounded w-full mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && dashboard && (
        <>
          {/* If filtering by specific status, show flat list */}
          {filters.status ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.timelines.map((timeline) => (
                <TimelineCard
                  key={timeline.id}
                  timeline={timeline}
                  onSelect={handleSelectTimeline}
                  onCopy={handleCopyTimeline}
                />
              ))}
              {dashboard.timelines.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No timelines match your filters
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Grouped by status */}
              {renderTimelineSection(
                'Active',
                dashboard.grouped.active,
                'No active timelines'
              )}
              {renderTimelineSection(
                'Planning',
                dashboard.grouped.planning,
                'No timelines in planning'
              )}
              {renderTimelineSection(
                'Completed',
                dashboard.grouped.completed,
                'No completed timelines'
              )}

              {/* Empty state */}
              {dashboard.timelines.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No timelines yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Get started by creating your first timeline.
                  </p>
                  {onCreateTimeline && (
                    <button
                      type="button"
                      onClick={onCreateTimeline}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Timeline
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Archive Link */}
          {dashboard.archivedCount > 0 && (
            <div className="mt-8 text-center">
              <Link
                to="/archive"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
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
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                View {dashboard.archivedCount} archived timeline
                {dashboard.archivedCount !== 1 ? 's' : ''}
              </Link>
            </div>
          )}
        </>
      )}

      {/* Copy Timeline Modal */}
      {timelineToCopy && (
        <CopyTimelineModal
          isOpen={copyModalOpen}
          onClose={() => {
            setCopyModalOpen(false);
            setTimelineToCopy(null);
          }}
          sourceTimeline={timelineToCopy}
        />
      )}
    </div>
  );
}

export default TimelineDashboard;
