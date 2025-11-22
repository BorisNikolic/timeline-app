/**
 * TimelineCard component
 * Feature: 001-multi-timeline-system (User Story 3)
 *
 * Displays timeline summary with stats for dashboard view
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TimelineCard as TimelineCardType,
  TIMELINE_COLOR_VALUES,
  STATUS_CONFIG,
  ROLE_CONFIG,
  TimelineColor,
} from '../../types/timeline';

interface TimelineCardProps {
  timeline: TimelineCardType;
  onSelect?: (id: string) => void;
  onCopy?: (timeline: TimelineCardType) => void;
}

export function TimelineCard({ timeline, onSelect, onCopy }: TimelineCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const colorValue = TIMELINE_COLOR_VALUES[timeline.themeColor as TimelineColor] || TIMELINE_COLOR_VALUES.blue;
  const statusConfig = STATUS_CONFIG[timeline.status];
  const roleConfig = ROLE_CONFIG[timeline.userRole];

  const handleClick = () => {
    if (onSelect) {
      onSelect(timeline.id);
    } else {
      navigate(`/timeline/${timeline.id}`);
    }
  };

  // Format date range
  const formatDateRange = () => {
    const start = new Date(timeline.startDate);
    const end = new Date(timeline.endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Calculate days until start or days remaining
  const getDaysInfo = () => {
    const now = new Date();
    const start = new Date(timeline.startDate);
    const end = new Date(timeline.endDate);

    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (now < start) {
      const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { text: `Starts in ${days} day${days === 1 ? '' : 's'}`, color: 'text-blue-600' };
    } else if (now <= end) {
      const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { text: `${days} day${days === 1 ? '' : 's'} remaining`, color: 'text-green-600' };
    } else {
      return { text: 'Ended', color: 'text-gray-500' };
    }
  };

  const daysInfo = getDaysInfo();

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
      style={{ borderLeftWidth: '4px', borderLeftColor: colorValue }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {timeline.name}
          </h3>
          {timeline.description && (
            <p className="text-sm text-gray-500 truncate mt-1">
              {timeline.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleConfig.bgColor} ${roleConfig.color}`}>
            {roleConfig.label}
          </span>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDateRange()}</span>
        <span className={`ml-2 text-xs ${daysInfo.color}`}>
          ({daysInfo.text})
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{timeline.completionPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${timeline.completionPercentage}%`,
              backgroundColor: colorValue,
            }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{timeline.eventCount} events</span>
          </div>
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{timeline.memberCount} members</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Event Status Breakdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400" title="Not Started">
              {timeline.eventsByStatus.notStarted}
            </span>
            <span className="text-blue-500" title="In Progress">
              {timeline.eventsByStatus.inProgress}
            </span>
            <span className="text-green-500" title="Completed">
              {timeline.eventsByStatus.completed}
            </span>
          </div>

          {/* 3-dot Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Timeline options"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    navigate(`/timeline/${timeline.id}/settings`);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                {onCopy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onCopy(timeline);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Use as Template
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineCard;
