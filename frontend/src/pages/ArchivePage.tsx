/**
 * ArchivePage component
 * Feature: 001-multi-timeline-system (User Story 9)
 *
 * Archive view for past timelines with search and year filter
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useArchive } from '../hooks/useDashboard';
import { ArchiveList } from '../components/archive/ArchiveList';
import { timelinesApi } from '../services/timelinesApi';
import { toast } from '../utils/toast';
import { useQueryClient } from '@tanstack/react-query';

export function ArchivePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useArchive({ page, search, year, limit: 20 });

  // Generate year options (current year back to 2020)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= 2020; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setYear(value ? parseInt(value, 10) : undefined);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchInput('');
    setYear(undefined);
    setPage(1);
  };

  const handleUnarchive = async (timelineId: string) => {
    try {
      await timelinesApi.unarchive(timelineId);
      toast.success('Timeline unarchived successfully');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      toast.error('Failed to unarchive timeline');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">Failed to load archive</p>
            <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {data?.total ?? 0} archived timeline{data?.total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search archived timelines..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Year Filter */}
            <div className="sm:w-36">
              <select
                value={year ?? ''}
                onChange={handleYearChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>

            {/* Clear Filters */}
            {(search || year) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                Clear
              </button>
            )}
          </div>

          {/* Active Filters */}
          {(search || year) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>Filtering by:</span>
              {search && (
                <span className="px-2 py-0.5 bg-gray-100 rounded">
                  &quot;{search}&quot;
                </span>
              )}
              {year && (
                <span className="px-2 py-0.5 bg-gray-100 rounded">Year: {year}</span>
              )}
            </div>
          )}
        </div>

        {/* Archive List */}
        <ArchiveList
          timelines={data?.timelines ?? []}
          isLoading={isLoading}
          onUnarchive={handleUnarchive}
        />

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArchivePage;
