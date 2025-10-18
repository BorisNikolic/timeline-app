// ViewToggle Component
// Tabs for switching between Category View and Timeline View

import React from 'react';
import type { ViewToggleProps } from '../../types/timeline';

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <div className="flex gap-2 border-b border-gray-200 mb-6">
      <button
        onClick={() => onViewChange('category')}
        className={`
          px-4 py-2 font-medium transition-colors
          border-b-2 -mb-px
          ${currentView === 'category'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
          }
        `}
        aria-pressed={currentView === 'category'}
      >
        Category View
      </button>
      <button
        onClick={() => onViewChange('timeline')}
        className={`
          px-4 py-2 font-medium transition-colors
          border-b-2 -mb-px
          ${currentView === 'timeline'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
          }
        `}
        aria-pressed={currentView === 'timeline'}
      >
        Timeline View
      </button>
    </div>
  );
};
