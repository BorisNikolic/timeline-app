import { useMemo } from 'react';
import { EventWithDetails, EventStatus } from '../../types/Event';

interface StatusDashboardWidgetProps {
  events: EventWithDetails[];
}

interface StatusMetrics {
  notStarted: number;
  inProgress: number;
  completed: number;
  total: number;
  completionPercentage: number;
}

/**
 * Status Dashboard Widget Component (User Story 6 - P2)
 * Displays event counts by status with completion percentage
 */
function StatusDashboardWidget({ events }: StatusDashboardWidgetProps) {
  const metrics: StatusMetrics = useMemo(() => {
    const counts = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<EventStatus, number>);

    const total = events.length;
    const completed = counts[EventStatus.Completed] || 0;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      notStarted: counts[EventStatus.NotStarted] || 0,
      inProgress: counts[EventStatus.InProgress] || 0,
      completed,
      total,
      completionPercentage,
    };
  }, [events]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Event Status</h2>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Progress:</span>
          <span className="font-semibold text-green-600">{metrics.completionPercentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Not Started */}
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1 w-fit">
            Not Started
          </span>
          <p className="text-xl font-bold text-gray-900">{metrics.notStarted}</p>
        </div>

        {/* In Progress */}
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1 w-fit">
            In Progress
          </span>
          <p className="text-xl font-bold text-blue-600">{metrics.inProgress}</p>
        </div>

        {/* Completed */}
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1 w-fit">
            Completed
          </span>
          <p className="text-xl font-bold text-green-600">{metrics.completed}</p>
        </div>

        {/* Total Events */}
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-1 w-fit">
            Total
          </span>
          <p className="text-xl font-bold text-gray-900">{metrics.total}</p>
        </div>
      </div>

      {/* Compact Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${metrics.completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default StatusDashboardWidget;
