/**
 * Copy Timeline Form Component
 * Feature: 001-multi-timeline-system (User Story 6)
 *
 * Form for specifying copy options and new date range
 */

import { useState } from 'react';
import { CopyTimelineDto, TimelineWithStats } from '../../types/timeline';

interface CopyTimelineFormProps {
  sourceTimeline: TimelineWithStats;
  onSubmit: (data: CopyTimelineDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CopyTimelineForm({
  sourceTimeline,
  onSubmit,
  onCancel,
  isLoading = false,
}: CopyTimelineFormProps) {
  // Calculate default dates (same duration, shifted one year forward)
  const sourceStart = new Date(sourceTimeline.startDate);
  const sourceEnd = new Date(sourceTimeline.endDate);
  const defaultStart = new Date(sourceStart);
  defaultStart.setFullYear(defaultStart.getFullYear() + 1);
  const defaultEnd = new Date(sourceEnd);
  defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);

  const [formData, setFormData] = useState({
    name: `${sourceTimeline.name} (Copy)`,
    startDate: defaultStart.toISOString().split('T')[0],
    endDate: defaultEnd.toISOString().split('T')[0],
    includeCategories: true,
    includeEvents: true,
    includeAssignments: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Source Timeline Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Copying from:</h4>
        <p className="text-sm text-gray-900 font-medium">{sourceTimeline.name}</p>
        <p className="text-xs text-gray-500 mt-1">
          {sourceTimeline.eventCount} events • {sourceTimeline.memberCount} members
        </p>
      </div>

      {/* New Timeline Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          New Timeline Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          required
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          />
        </div>
      </div>

      {/* Copy Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Include in Copy</h4>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.includeCategories}
            onChange={(e) =>
              setFormData({
                ...formData,
                includeCategories: e.target.checked,
                // If categories unchecked, events can't be included
                includeEvents: e.target.checked ? formData.includeEvents : false,
              })
            }
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="text-sm text-gray-900">Categories</span>
            <p className="text-xs text-gray-500">Copy all category groups</p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.includeEvents}
            disabled={!formData.includeCategories}
            onChange={(e) =>
              setFormData({ ...formData, includeEvents: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
          />
          <div>
            <span className={`text-sm ${formData.includeCategories ? 'text-gray-900' : 'text-gray-400'}`}>
              Events
            </span>
            <p className={`text-xs ${formData.includeCategories ? 'text-gray-500' : 'text-gray-400'}`}>
              Copy all events with dates shifted to new range
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.includeAssignments}
            disabled={!formData.includeEvents}
            onChange={(e) =>
              setFormData({ ...formData, includeAssignments: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
          />
          <div>
            <span className={`text-sm ${formData.includeEvents ? 'text-gray-900' : 'text-gray-400'}`}>
              Assigned People
            </span>
            <p className={`text-xs ${formData.includeEvents ? 'text-gray-500' : 'text-gray-400'}`}>
              Keep person assignments from original events
            </p>
          </div>
        </label>
      </div>

      {/* Date Shift Info */}
      {formData.includeEvents && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Date Shifting
          </h4>
          <p className="mt-1 text-xs text-blue-700">
            All event dates will be automatically adjusted based on the difference between
            the original start date ({sourceTimeline.startDate}) and your new start date.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Copying...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Create Copy
            </>
          )}
        </button>
      </div>
    </form>
  );
}
