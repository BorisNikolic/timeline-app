/**
 * Status Transition Dropdown Component
 * Feature: 001-multi-timeline-system (User Story 5)
 *
 * Allows Admin users to transition timeline status with valid options
 * Planning -> Active -> Completed -> Archived
 */

import { useState, useRef, useEffect } from 'react';
import {
  TimelineStatus,
  VALID_STATUS_TRANSITIONS,
  STATUS_CONFIG,
} from '../../types/timeline';

interface StatusTransitionDropdownProps {
  currentStatus: TimelineStatus;
  onStatusChange: (newStatus: TimelineStatus) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function StatusTransitionDropdown({
  currentStatus,
  onStatusChange,
  disabled = false,
  isLoading = false,
}: StatusTransitionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  const statusConfig = STATUS_CONFIG[currentStatus];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTransition = (newStatus: TimelineStatus) => {
    setIsOpen(false);
    onStatusChange(newStatus);
  };

  // Status icons
  const statusIcons: Record<TimelineStatus, JSX.Element> = {
    Planning: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    Active: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    Completed: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Archived: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Current Status Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${statusConfig.bgColor} ${statusConfig.color} ${
          disabled || isLoading
            ? 'cursor-not-allowed opacity-60'
            : 'hover:opacity-80 cursor-pointer'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {isLoading ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          statusIcons[currentStatus]
        )}
        <span>{statusConfig.label}</span>
        {validTransitions.length > 0 && !disabled && (
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && validTransitions.length > 0 && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Change Status
          </div>
          {validTransitions.map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <button
                key={status}
                onClick={() => handleTransition(status)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
                role="option"
              >
                <span className={`${config.color}`}>{statusIcons[status]}</span>
                <span className="font-medium text-gray-900">{config.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* No transitions available indicator */}
      {isOpen && validTransitions.length === 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="text-sm text-gray-500">No status changes available</p>
        </div>
      )}
    </div>
  );
}
