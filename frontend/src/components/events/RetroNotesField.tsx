/**
 * RetroNotesField component
 * Feature: 001-multi-timeline-system (User Story 8)
 *
 * Text area field for adding retrospective notes to events
 * Only enabled on Completed/Archived timelines
 */

import { useState, useEffect } from 'react';

interface RetroNotesFieldProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export default function RetroNotesField({
  value = '',
  onChange,
  disabled = false,
  maxLength = 2000,
  placeholder = 'Add retrospective notes about this event...',
}: RetroNotesFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [charCount, setCharCount] = useState(value.length);

  useEffect(() => {
    setLocalValue(value);
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setLocalValue(newValue);
      setCharCount(newValue.length);
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor="retro-notes"
        className="block text-sm font-medium text-gray-700"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Retrospective Notes
        </span>
      </label>
      <textarea
        id="retro-notes"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        className={`
          w-full px-3 py-2 text-sm rounded-md border transition-colors
          ${disabled
            ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
          }
        `}
        aria-describedby="retro-notes-hint"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span id="retro-notes-hint">
          {disabled
            ? 'Notes can only be edited on Completed or Archived timelines'
            : 'Document what worked, what could be improved, and lessons learned'}
        </span>
        <span className={charCount > maxLength * 0.9 ? 'text-orange-500' : ''}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  );
}
