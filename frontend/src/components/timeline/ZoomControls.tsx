// ZoomControls Component
// Time range and visual scale controls

import React from 'react';
import type { ZoomControlsProps, ZoomLevel } from '../../types/timeline';

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentZoomLevel,
  currentVisualScale,
  onZoomLevelChange,
  onVisualScaleChange
}) => {
  const zoomLevels: ZoomLevel[] = ['day', 'week', 'month', 'quarter', 'year'];

  const handleVisualZoomIn = () => {
    const newScale = Math.min(10.0, currentVisualScale + 0.25);
    onVisualScaleChange(newScale);
  };

  const handleVisualZoomOut = () => {
    const newScale = Math.max(0.5, currentVisualScale - 0.25);
    onVisualScaleChange(newScale);
  };

  const handleResetVisualScale = () => {
    onVisualScaleChange(1.0);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white p-4 rounded-lg shadow-md">
      {/* Time range zoom - Dropdown on mobile, buttons on desktop */}
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <label className="text-xs font-semibold text-gray-600 uppercase">
          Time Range
        </label>

        {/* Mobile: Dropdown */}
        <select
          value={currentZoomLevel}
          onChange={(e) => onZoomLevelChange(e.target.value as ZoomLevel)}
          className="
            md:hidden px-3 py-2 text-sm font-medium rounded border border-gray-300
            bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            min-h-[44px]
          "
        >
          {zoomLevels.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>

        {/* Desktop: Buttons */}
        <div className="hidden md:flex gap-2">
          {zoomLevels.map((level) => (
            <button
              key={level}
              onClick={() => onZoomLevelChange(level)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded transition-colors
                ${currentZoomLevel === level
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-pressed={currentZoomLevel === level}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Visual scale controls */}
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <label className="text-xs font-semibold text-gray-600 uppercase">
          Visual Zoom
        </label>
        <div className="flex gap-2 items-center justify-between md:justify-start">
          <button
            onClick={handleVisualZoomOut}
            disabled={currentVisualScale <= 0.5}
            className="
              w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded bg-gray-100
              hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
              text-gray-700 font-bold transition-colors
              min-h-[44px] md:min-h-0
            "
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>

          <button
            onClick={handleResetVisualScale}
            className="
              px-3 py-2 md:py-1.5 text-sm font-medium rounded bg-gray-100
              hover:bg-gray-200 text-gray-700 transition-colors
              min-h-[44px] md:min-h-0
            "
            title={`Current: ${(currentVisualScale * 100).toFixed(0)}%`}
          >
            {(currentVisualScale * 100).toFixed(0)}%
          </button>

          <button
            onClick={handleVisualZoomIn}
            disabled={currentVisualScale >= 10.0}
            className="
              w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded bg-gray-100
              hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
              text-gray-700 font-bold transition-colors
              min-h-[44px] md:min-h-0
            "
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
