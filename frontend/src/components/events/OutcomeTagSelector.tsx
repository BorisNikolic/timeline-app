/**
 * OutcomeTagSelector component
 * Feature: 001-multi-timeline-system (User Story 8)
 *
 * Dropdown selector for event outcome tags (retrospective feature)
 * Only enabled on Completed/Archived timelines
 */

import { OutcomeTag, OUTCOME_TAG_CONFIG } from '../../types/Event';

interface OutcomeTagSelectorProps {
  value?: OutcomeTag | null;
  onChange: (value: OutcomeTag | null) => void;
  disabled?: boolean;
}

export default function OutcomeTagSelector({
  value,
  onChange,
  disabled = false,
}: OutcomeTagSelectorProps) {
  const outcomeOptions = Object.values(OutcomeTag);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Outcome
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        {/* Clear selection option */}
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all
            ${!value
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
          None
        </button>

        {/* Outcome options */}
        {outcomeOptions.map((tag) => {
          const config = OUTCOME_TAG_CONFIG[tag];
          const isSelected = value === tag;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(tag)}
              disabled={disabled}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all
                ${isSelected
                  ? `${config.bgColor} ${config.color} border-current font-medium`
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Icons for each outcome */}
              {tag === OutcomeTag.WentWell && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {tag === OutcomeTag.NeedsImprovement && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {tag === OutcomeTag.Failed && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {config.label}
            </button>
          );
        })}
      </div>

      {disabled && (
        <p className="text-xs text-gray-500">
          Outcome tags can only be set on Completed or Archived timelines
        </p>
      )}
    </div>
  );
}
