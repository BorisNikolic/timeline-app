/**
 * DayPicker - Date navigation for Festival Schedule
 * Shows: [◀] Friday, August 8, 2025 [▶]
 */

import { DayPickerProps } from './types';
import { formatDateForDisplay, addDays, isToday } from './utils';

// Inline SVG icons to avoid external dependencies
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function DayPicker({ selectedDate, onDateChange, availableDates = [] }: DayPickerProps) {
  const handlePrevDay = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
      onDateChange(new Date(dateStr + 'T00:00:00'));
    }
  };

  // Format date for select value
  const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for select display
  const formatDateOption = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-center gap-4 py-3 px-4 bg-gray-50 border-b border-gray-200">
      {/* Previous Day Button */}
      <button
        onClick={handlePrevDay}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Date Display */}
      <div className="flex flex-col items-center min-w-[280px]">
        <span className="text-lg font-semibold text-gray-900">
          {formatDateForDisplay(selectedDate)}
        </span>
        {isToday(selectedDate) && (
          <span className="text-xs text-emerald-600 font-medium">Today</span>
        )}
      </div>

      {/* Next Day Button */}
      <button
        onClick={handleNextDay}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Next day"
      >
        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Jump to Today Button */}
      {!isToday(selectedDate) && (
        <button
          onClick={handleToday}
          className="ml-4 px-3 py-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
        >
          Jump to Today
        </button>
      )}

      {/* Jump to Event Date Dropdown */}
      {availableDates.length > 0 && (
        <select
          onChange={handleDateSelect}
          value=""
          className="ml-2 px-3 py-1 text-sm font-medium text-primary-600 bg-white border border-primary-300 rounded hover:bg-primary-50 cursor-pointer"
        >
          <option value="">Jump to date...</option>
          {availableDates.map((date) => (
            <option key={formatDateValue(date)} value={formatDateValue(date)}>
              {formatDateOption(date)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
