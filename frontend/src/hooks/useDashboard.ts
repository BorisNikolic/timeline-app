/**
 * Dashboard hooks for React Query
 * Feature: 001-multi-timeline-system (User Story 3)
 *
 * Provides data fetching for dashboard and aggregate stats
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/timelinesApi';
import { DashboardFilters, ArchiveFilters } from '../types/timeline';

// Query key factory for consistent cache management
export const dashboardKeys = {
  all: ['dashboard'] as const,
  dashboard: (filters: DashboardFilters) => [...dashboardKeys.all, 'data', filters] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  archive: (filters: ArchiveFilters) => [...dashboardKeys.all, 'archive', filters] as const,
};

/**
 * Fetch dashboard data with timelines grouped by status
 */
export function useDashboard(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: dashboardKeys.dashboard(filters),
    queryFn: () => dashboardApi.getDashboard(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be fresh
  });
}

/**
 * Fetch aggregate statistics across all accessible timelines
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch archived timelines with pagination (US9: Archive Management)
 */
export function useArchive(filters: ArchiveFilters = {}) {
  return useQuery({
    queryKey: dashboardKeys.archive(filters),
    queryFn: () => dashboardApi.getArchive(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
