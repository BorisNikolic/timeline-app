// JumpToTodayButton Component
// Floating button to scroll to TODAY line

import React from 'react';
import type { JumpToTodayButtonProps } from '../../types/timeline';

export const JumpToTodayButton: React.FC<JumpToTodayButtonProps> = ({
  isVisible,
  onJumpToToday
}) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onJumpToToday}
      className="
        fixed bottom-8 right-8 z-30
        bg-red-500 hover:bg-red-600 text-white
        px-4 py-3 rounded-full shadow-lg
        font-semibold text-sm
        transition-all duration-200
        hover:scale-105 hover:shadow-xl
        flex items-center gap-2
      "
      aria-label="Jump to today"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Jump to Today
    </button>
  );
};
