/**
 * DashboardStats component
 * Feature: 001-multi-timeline-system (User Story 3)
 *
 * Displays aggregate statistics across all timelines
 */

import { DashboardStats as StatsType } from '../../types/timeline';

interface DashboardStatsProps {
  stats: StatsType;
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Timelines',
      value: stats.totalTimelines,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Active',
      value: stats.activeTimelines,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Completion',
      value: `${stats.overallCompletion}%`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Role breakdown - secondary row */}
      <div className="col-span-2 md:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
              Admin
            </span>
            <span className="text-gray-600">
              {stats.timelinesAsAdmin} timeline{stats.timelinesAsAdmin !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              Editor
            </span>
            <span className="text-gray-600">
              {stats.timelinesAsEditor} timeline{stats.timelinesAsEditor !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
              Viewer
            </span>
            <span className="text-gray-600">
              {stats.timelinesAsViewer} timeline{stats.timelinesAsViewer !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
