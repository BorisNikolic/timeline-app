/**
 * DashboardFilters component
 * Feature: 001-multi-timeline-system (User Story 3)
 *
 * Filter controls for dashboard timeline list
 */

import {
  DashboardFilters as FilterType,
  TimelineStatus,
  MemberRole,
} from '../../types/timeline';

interface DashboardFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

// Generate year options (current year +/- 2 years)
function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  return [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];
}

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const yearOptions = getYearOptions();

  const handleStatusChange = (status: TimelineStatus | '') => {
    onFiltersChange({
      ...filters,
      status: status || undefined,
    });
  };

  const handleYearChange = (year: string) => {
    onFiltersChange({
      ...filters,
      year: year ? parseInt(year, 10) : undefined,
    });
  };

  const handleRoleChange = (role: MemberRole | '') => {
    onFiltersChange({
      ...filters,
      role: role || undefined,
    });
  };

  const handleSortByChange = (sortBy: FilterType['sortBy']) => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const handleSortOrderChange = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      sortBy: 'startDate',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.status || filters.year || filters.role;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value as TimelineStatus | '')}
            className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="year-filter" className="text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            id="year-filter"
            value={filters.year || ''}
            onChange={(e) => handleYearChange(e.target.value)}
            className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="role-filter" className="text-sm font-medium text-gray-700">
            My Role
          </label>
          <select
            id="role-filter"
            value={filters.role || ''}
            onChange={(e) => handleRoleChange(e.target.value as MemberRole | '')}
            className="block w-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm font-medium text-gray-700">
            Sort
          </label>
          <select
            id="sort-by"
            value={filters.sortBy || 'startDate'}
            onChange={(e) => handleSortByChange(e.target.value as FilterType['sortBy'])}
            className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="startDate">Start Date</option>
            <option value="name">Name</option>
            <option value="updatedAt">Last Updated</option>
            <option value="completion">Completion</option>
          </select>
          <button
            type="button"
            onClick={handleSortOrderChange}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {filters.sortOrder === 'asc' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardFilters;
