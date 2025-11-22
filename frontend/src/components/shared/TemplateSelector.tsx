/**
 * Template Selector Component
 * Feature: 001-multi-timeline-system (User Story 7)
 *
 * Allows users to select from available templates when creating a new timeline
 */

import { useState } from 'react';
import { useTemplates } from '../../hooks/useTimelines';
import {
  TimelineWithStats,
  TIMELINE_COLOR_VALUES,
  TimelineColor,
} from '../../types/timeline';

interface TemplateSelectorProps {
  onSelect: (template: TimelineWithStats | null) => void;
  selectedTemplateId?: string | null;
}

export default function TemplateSelector({
  onSelect,
  selectedTemplateId,
}: TemplateSelectorProps) {
  const { data: templates, isLoading, error } = useTemplates();
  const [showTemplates, setShowTemplates] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (error || !templates || templates.length === 0) {
    return null; // Don't show if no templates available
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="space-y-3">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setShowTemplates(!showTemplates)}
        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
      >
        <svg
          className={`h-4 w-4 transition-transform ${showTemplates ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showTemplates ? 'Hide Templates' : 'Start from Template'}
      </button>

      {/* Templates List */}
      {showTemplates && (
        <div className="space-y-2">
          {/* Clear Selection Option */}
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              !selectedTemplateId
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Blank Timeline</p>
                <p className="text-xs text-gray-500">Start from scratch</p>
              </div>
            </div>
          </button>

          {/* Template Options */}
          {templates.map((template) => {
            const colorValue =
              TIMELINE_COLOR_VALUES[template.themeColor as TimelineColor] ||
              TIMELINE_COLOR_VALUES.blue;
            const isSelected = selectedTemplateId === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${colorValue}20` }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: colorValue }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {template.eventCount} events • {template.memberCount} categories
                    </p>
                  </div>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-primary-500 flex-shrink-0"
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
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Template Info */}
      {selectedTemplate && !showTemplates && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    TIMELINE_COLOR_VALUES[selectedTemplate.themeColor as TimelineColor],
                }}
              />
              <span className="text-sm text-gray-700">
                Using template: <span className="font-medium">{selectedTemplate.name}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
