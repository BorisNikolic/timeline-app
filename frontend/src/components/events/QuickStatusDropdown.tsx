/**
 * QuickStatusDropdown component
 * User Story 1: Quick Status Updates (P1)
 *
 * Allows updating event status in 1 click (vs 5 clicks before)
 * Features:
 * - Inline dropdown on event cards
 * - Optimistic updates for instant feedback
 * - Automatic rollback on error
 * - Loading states and error notifications
 */

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventStatus } from '../../types/Event';
import { eventsApi } from '../../services/api-client';
import { toast } from '../../utils/toast';

interface QuickStatusDropdownProps {
  eventId: string;
  currentStatus: EventStatus;
  onStatusChange?: (newStatus: EventStatus) => void;
}

function QuickStatusDropdown({ eventId, currentStatus, onStatusChange }: QuickStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const allStatuses: EventStatus[] = [
    EventStatus.NotStarted,
    EventStatus.InProgress,
    EventStatus.Completed
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mutation for updating event status with optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: EventStatus) => {
      return eventsApi.update(eventId, { status: newStatus });
    },

    onMutate: async (newStatus: EventStatus) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events'] });

      // Snapshot previous value
      const previousEvents = queryClient.getQueryData(['events']);

      // Optimistically update cache
      queryClient.setQueryData(['events'], (old: any) => {
        if (!old) return old;
        return old.map((e: any) =>
          e.id === eventId ? { ...e, status: newStatus } : e
        );
      });

      // Close dropdown immediately for better UX
      setIsOpen(false);

      return { previousEvents };
    },

    onError: (err, newStatus, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
      toast.error('Failed to update status. Please try again.');
    },

    onSuccess: (data, newStatus) => {
      // Notify parent component
      onStatusChange?.(newStatus);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const handleStatusSelect = (status: EventStatus) => {
    if (status !== currentStatus) {
      updateStatusMutation.mutate(status);
    } else {
      setIsOpen(false);
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.NotStarted:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case EventStatus.InProgress:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case EventStatus.Completed:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event card click
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Status Button */}
      <button
        onClick={toggleDropdown}
        disabled={updateStatusMutation.isPending}
        className={`
          rounded-full px-2 py-1 text-xs font-medium
          ${getStatusColor(currentStatus)}
          transition-colors cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-1
        `}
        aria-label="Change status"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {updateStatusMutation.isPending ? (
          <span className="flex items-center gap-1">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Updating...
          </span>
        ) : (
          <>
            {currentStatus}
            <svg
              className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !updateStatusMutation.isPending && (
        <div className="
          absolute z-10 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5
          top-full left-0
        ">
          <div className="py-1" role="menu">
            {allStatuses.map((status) => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusSelect(status);
                }}
                className={`
                  w-full text-left px-4 py-2 text-sm
                  ${status === currentStatus ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}
                  transition-colors
                `}
                role="menuitem"
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  status === EventStatus.NotStarted ? 'bg-gray-500' :
                  status === EventStatus.InProgress ? 'bg-blue-500' :
                  'bg-green-500'
                }`} />
                {status}
                {status === currentStatus && (
                  <svg
                    className="inline-block float-right h-4 w-4 text-gray-600"
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
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickStatusDropdown;
