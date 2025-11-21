// ScrollIndicatorBadge Component
// Floating badge indicator showing scrollable content below

import React from 'react';

interface ScrollIndicatorBadgeProps {
  /** Number of items (categories/swimlanes) hidden below the fold */
  count: number;
  /** Whether the indicator should be visible */
  isVisible: boolean;
  /** Type of items being counted */
  itemType?: 'categories' | 'items';
}

export const ScrollIndicatorBadge: React.FC<ScrollIndicatorBadgeProps> = ({
  count,
  isVisible,
  itemType = 'categories'
}) => {
  if (count <= 0 || !isVisible) {
    return null;
  }

  const itemLabel = count === 1
    ? itemType === 'categories' ? 'category' : 'item'
    : itemType === 'categories' ? 'categories' : 'items';

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-30
        flex items-center gap-2 px-4 py-2.5
        bg-gradient-to-r from-primary-500 to-primary-600
        text-white text-sm font-semibold rounded-full shadow-lg
        transition-all duration-300 ease-in-out
        hover:shadow-xl hover:scale-105 cursor-pointer
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      style={{ minHeight: '44px' }}
      role="status"
      aria-live="polite"
      aria-label={`${count} more ${itemLabel} below`}
    >
      {/* Icon */}
      <svg
        className="w-4 h-4 animate-bounce"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>

      {/* Text */}
      <span>
        {count} more {itemLabel} below
      </span>

      {/* Down chevron */}
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
};
