/**
 * ArchiveList component
 * Feature: 001-multi-timeline-system (User Story 9)
 *
 * Displays paginated list of archived timelines with search and year filter
 */

import { TimelineCard as TimelineCardType } from '../../types/timeline';
import { TimelineCard } from '../dashboard/TimelineCard';

interface ArchiveListProps {
  timelines: TimelineCardType[];
  isLoading: boolean;
  onUnarchive?: (timelineId: string) => void;
}

export function ArchiveList({ timelines, isLoading, onUnarchive }: ArchiveListProps) {
  if (isLoading) {
    return (
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
    );
  }

  if (timelines.length === 0) {
    return (
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
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No archived timelines</h3>
        <p className="mt-2 text-sm text-gray-500">
          Timelines you archive will appear here for future reference.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {timelines.map((timeline) => (
        <div key={timeline.id} className="relative">
          <TimelineCard timeline={timeline} />
          {onUnarchive && timeline.userRole === 'Admin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnarchive(timeline.id);
              }}
              className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
              title="Unarchive timeline"
            >
              Unarchive
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ArchiveList;
