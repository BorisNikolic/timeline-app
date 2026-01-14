/**
 * TimeGrid - Hour column headers for Festival Schedule
 * Shows: | 10AM | 11AM | 12PM | 1PM | 2PM | ...
 */

import { TimeGridProps } from './types';
import { getHourLabels, getTimelineWidth } from './utils';

export default function TimeGrid({ config }: TimeGridProps) {
  const hourLabels = getHourLabels(config);
  const totalWidth = getTimelineWidth(config);

  return (
    <div
      className="relative h-10 border-b border-gray-300 flex"
      style={{ width: `${totalWidth}px` }}
    >
      {hourLabels.map(({ hour, label, isNextDay }) => (
        <div
          key={hour}
          className={`relative h-full flex items-end pb-1 border-l ${
            isNextDay ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-300'
          } ${hour === 24 ? 'border-l-2 border-blue-400' : ''}`}
          style={{ width: `${config.pixelsPerHour}px` }}
        >
          {/* Hour label */}
          <span className={`text-xs font-medium ml-1 ${
            isNextDay ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {label}
            {isNextDay && hour === 24 && (
              <span className="text-[10px] ml-0.5 text-blue-400">+1</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * TimeGridBackground - Vertical lines that extend through the swimlanes
 */
export function TimeGridBackground({ config }: TimeGridProps) {
  const hourLabels = getHourLabels(config);
  const totalWidth = getTimelineWidth(config);

  return (
    <div
      className="h-full pointer-events-none flex"
      style={{ width: `${totalWidth}px` }}
      aria-hidden="true"
    >
      {hourLabels.map(({ hour, isNextDay }) => (
        <div
          key={hour}
          className={`h-full border-l flex-shrink-0 ${
            hour === 24
              ? 'border-l-2 border-blue-400'
              : isNextDay
                ? 'border-blue-200'
                : 'border-gray-200'
          } ${isNextDay ? 'bg-blue-50/20' : ''}`}
          style={{ width: `${config.pixelsPerHour}px` }}
        />
      ))}
    </div>
  );
}
