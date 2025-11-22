/**
 * Timeline Switcher Component
 * Feature: 001-multi-timeline-system (User Story 4)
 *
 * Header dropdown for quickly switching between accessible timelines
 * - Groups timelines by status (Active, Planning, Completed)
 * - Excludes archived timelines
 * - Shows timeline color indicator and completion progress
 * - Supports search filtering
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimelines } from '../../hooks/useTimelines';
import { useTimelineSelection } from '../../hooks/usePreferences';
import {
  TimelineWithStats,
  TimelineStatus,
  STATUS_CONFIG,
  TIMELINE_COLOR_VALUES,
  TimelineColor,
} from '../../types/timeline';

interface TimelineSwitcherProps {
  className?: string;
}

export default function TimelineSwitcher({ className = '' }: TimelineSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: timelines, isLoading } = useTimelines(false); // Exclude archived
  const { currentTimelineId, selectTimeline } = useTimelineSelection();

  // Find current timeline details
  const currentTimeline = useMemo(
    () => timelines?.find((t) => t.id === currentTimelineId),
    [timelines, currentTimelineId]
  );

  // Filter timelines by search query and exclude archived
  const filteredTimelines = useMemo(() => {
    if (!timelines) return [];

    const nonArchived = timelines.filter((t) => t.status !== 'Archived');

    if (!searchQuery.trim()) return nonArchived;

    const query = searchQuery.toLowerCase();
    return nonArchived.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
    );
  }, [timelines, searchQuery]);

  // Group timelines by status
  const groupedTimelines = useMemo(() => {
    const groups: Record<Exclude<TimelineStatus, 'Archived'>, TimelineWithStats[]> = {
      Active: [],
      Planning: [],
      Completed: [],
    };

    filteredTimelines.forEach((timeline) => {
      if (timeline.status !== 'Archived') {
        groups[timeline.status].push(timeline);
      }
    });

    return groups;
  }, [filteredTimelines]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleTimelineSelect = (timeline: TimelineWithStats) => {
    selectTimeline(timeline.id, timeline.userRole);
    setIsOpen(false);
    setSearchQuery('');
    navigate(`/timeline/${timeline.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-9 w-48 rounded-lg bg-gray-200" />
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentTimeline ? (
          <>
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor:
                  TIMELINE_COLOR_VALUES[currentTimeline.themeColor as TimelineColor],
              }}
            />
            <span className="max-w-[150px] truncate">{currentTimeline.name}</span>
          </>
        ) : (
          <span className="text-gray-400">Select Timeline</span>
        )}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg"
          role="listbox"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="border-b border-gray-100 p-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search timelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>

          {/* Timeline List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredTimelines.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                {searchQuery ? 'No timelines found' : 'No timelines available'}
              </div>
            ) : (
              <>
                {/* Active Timelines */}
                {groupedTimelines.Active.length > 0 && (
                  <TimelineGroup
                    title="Active"
                    timelines={groupedTimelines.Active}
                    currentTimelineId={currentTimelineId}
                    onSelect={handleTimelineSelect}
                  />
                )}

                {/* Planning Timelines */}
                {groupedTimelines.Planning.length > 0 && (
                  <TimelineGroup
                    title="Planning"
                    timelines={groupedTimelines.Planning}
                    currentTimelineId={currentTimelineId}
                    onSelect={handleTimelineSelect}
                  />
                )}

                {/* Completed Timelines */}
                {groupedTimelines.Completed.length > 0 && (
                  <TimelineGroup
                    title="Completed"
                    timelines={groupedTimelines.Completed}
                    currentTimelineId={currentTimelineId}
                    onSelect={handleTimelineSelect}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/dashboard');
              }}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
            >
              View All Timelines
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface TimelineGroupProps {
  title: string;
  timelines: TimelineWithStats[];
  currentTimelineId: string | null;
  onSelect: (timeline: TimelineWithStats) => void;
}

function TimelineGroup({
  title,
  timelines,
  currentTimelineId,
  onSelect,
}: TimelineGroupProps) {
  const statusConfig = STATUS_CONFIG[title as TimelineStatus];

  return (
    <div className="py-1">
      <div className="px-3 py-1.5">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${statusConfig?.color || 'text-gray-500'}`}
        >
          {title}
        </span>
      </div>
      {timelines.map((timeline) => (
        <button
          key={timeline.id}
          onClick={() => onSelect(timeline)}
          className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-50 ${
            timeline.id === currentTimelineId ? 'bg-primary-50' : ''
          }`}
          role="option"
          aria-selected={timeline.id === currentTimelineId}
        >
          {/* Color indicator */}
          <span
            className="h-3 w-3 flex-shrink-0 rounded-full"
            style={{
              backgroundColor:
                TIMELINE_COLOR_VALUES[timeline.themeColor as TimelineColor],
            }}
          />

          {/* Timeline info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-gray-900">
                {timeline.name}
              </span>
              {timeline.id === currentTimelineId && (
                <svg
                  className="h-4 w-4 flex-shrink-0 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{timeline.eventCount} events</span>
              <span>•</span>
              <span>{timeline.completionPercentage}% complete</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex-shrink-0 w-12 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${timeline.completionPercentage}%` }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
