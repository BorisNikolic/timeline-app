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
  const zoomLevels: ZoomLevel[] = ['day', 'week', 'month', 'quarter'];

  const handleVisualZoomIn = () => {
    const newScale = Math.min(2.0, currentVisualScale + 0.25);
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
      {/* Time range zoom buttons */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-600 uppercase">
          Time Range
        </label>
        <div className="flex gap-2">
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
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-600 uppercase">
          Visual Zoom
        </label>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleVisualZoomOut}
            disabled={currentVisualScale <= 0.5}
            className="
              w-8 h-8 flex items-center justify-center rounded bg-gray-100
              hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
              text-gray-700 font-bold transition-colors
            "
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>

          <button
            onClick={handleResetVisualScale}
            className="
              px-3 py-1.5 text-sm font-medium rounded bg-gray-100
              hover:bg-gray-200 text-gray-700 transition-colors
            "
            title={`Current: ${(currentVisualScale * 100).toFixed(0)}%`}
          >
            {(currentVisualScale * 100).toFixed(0)}%
          </button>

          <button
            onClick={handleVisualZoomIn}
            disabled={currentVisualScale >= 2.0}
            className="
              w-8 h-8 flex items-center justify-center rounded bg-gray-100
              hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
              text-gray-700 font-bold transition-colors
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
