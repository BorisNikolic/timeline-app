/**
 * TimelineForm component
 * Feature: 001-multi-timeline-system
 *
 * Reusable form for creating and editing timelines
 */

import { useState, useEffect, useMemo } from 'react';
import {
  TimelineEntity,
  CreateTimelineDto,
  TimelineColor,
  TIMELINE_COLORS,
  TIMELINE_COLOR_VALUES,
} from '../../types/timeline';

// Minimal event interface for date range checking
interface EventForDateCheck {
  id: string;
  title: string;
  date: string;
}

interface TimelineFormProps {
  initialData?: Partial<TimelineEntity>;
  onSubmit: (data: CreateTimelineDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  /** Events to check for out-of-range warnings when editing dates */
  events?: EventForDateCheck[];
}

export function TimelineForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
  events = [],
}: TimelineFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [themeColor, setThemeColor] = useState<TimelineColor>(
    (initialData?.themeColor as TimelineColor) || 'blue'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate events that would fall outside the new date range (EC-3)
  const outOfRangeEvents = useMemo(() => {
    if (!events.length || !startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate < start || eventDate > end;
    });
  }, [events, startDate, endDate]);

  // Set default dates for new timelines
  useEffect(() => {
    if (!initialData && !startDate) {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(nextMonth.toISOString().split('T')[0]);
    }
  }, [initialData, startDate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date must be on or after start date';
    }

    if (description && description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateTimelineDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate,
      themeColor,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Timeline Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.name ? 'border-red-500' : ''
          }`}
          placeholder="Summer Festival 2025"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.description ? 'border-red-500' : ''
          }`}
          placeholder="Brief description of this festival/project..."
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.startDate ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.endDate ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme Color
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMELINE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setThemeColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                themeColor === color
                  ? 'border-gray-900 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: TIMELINE_COLOR_VALUES[color] }}
              title={color.charAt(0).toUpperCase() + color.slice(1)}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Out-of-range events warning (EC-3) */}
      {outOfRangeEvents.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">
                {outOfRangeEvents.length} event{outOfRangeEvents.length !== 1 ? 's' : ''} outside date range
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                The following events have dates outside the new timeline range and will not appear on the timeline view:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside max-h-32 overflow-y-auto">
                {outOfRangeEvents.slice(0, 10).map((event) => (
                  <li key={event.id} className="truncate">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-yellow-600 ml-1">
                      ({new Date(event.date).toLocaleDateString()})
                    </span>
                  </li>
                ))}
                {outOfRangeEvents.length > 10 && (
                  <li className="text-yellow-600 italic">
                    ...and {outOfRangeEvents.length - 10} more
                  </li>
                )}
              </ul>
              <p className="text-xs text-yellow-600 mt-2">
                The events will be preserved but hidden until their dates are updated or the timeline range is expanded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TimelineForm;
