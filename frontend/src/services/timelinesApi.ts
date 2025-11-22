import apiClient from './api-client';
import {
  TimelineEntity,
  TimelineWithStats,
  CreateTimelineDto,
  UpdateTimelineDto,
  CopyTimelineDto,
  TimelineMemberWithUser,
  InviteMemberDto,
  UpdateMemberRoleDto,
  UserPreference,
  DashboardResponse,
  DashboardStats,
  DashboardFilters,
  ArchiveFilters,
  ArchiveResponse,
} from '../types/timeline';

/**
 * Timeline CRUD operations
 */
export const timelinesApi = {
  /**
   * Get all timelines accessible to the current user
   */
  getAll: async (includeArchived = false): Promise<TimelineWithStats[]> => {
    const params = new URLSearchParams();
    if (includeArchived) params.append('includeArchived', 'true');
    const response = await apiClient.get(`/api/timelines?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single timeline by ID with stats
   */
  getById: async (id: string): Promise<TimelineWithStats> => {
    const response = await apiClient.get(`/api/timelines/${id}`);
    return response.data;
  },

  /**
   * Create a new timeline
   */
  create: async (data: CreateTimelineDto): Promise<TimelineEntity> => {
    const response = await apiClient.post('/api/timelines', data);
    return response.data;
  },

  /**
   * Update a timeline
   */
  update: async (
    id: string,
    data: UpdateTimelineDto,
    expectedUpdatedAt?: string
  ): Promise<TimelineEntity> => {
    const payload = expectedUpdatedAt
      ? { ...data, expectedUpdatedAt }
      : data;
    const response = await apiClient.put(`/api/timelines/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a timeline
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/timelines/${id}`);
  },

  /**
   * Copy a timeline with date shifting
   */
  copy: async (id: string, data: CopyTimelineDto): Promise<TimelineEntity> => {
    const response = await apiClient.post(`/api/timelines/${id}/copy`, data);
    return response.data;
  },

  /**
   * Set template status
   */
  setTemplate: async (id: string, isTemplate: boolean): Promise<TimelineEntity> => {
    const response = await apiClient.post(`/api/timelines/${id}/set-template`, {
      isTemplate,
    });
    return response.data;
  },

  /**
   * Get all templates
   */
  getTemplates: async (): Promise<TimelineWithStats[]> => {
    const response = await apiClient.get('/api/templates');
    return response.data;
  },

  /**
   * Unarchive a timeline
   */
  unarchive: async (id: string): Promise<TimelineEntity> => {
    const response = await apiClient.post(`/api/timelines/${id}/unarchive`);
    return response.data;
  },
};

/**
 * Timeline member operations
 */
export const membersApi = {
  /**
   * Get all members of a timeline
   */
  getAll: async (timelineId: string): Promise<TimelineMemberWithUser[]> => {
    const response = await apiClient.get(`/api/timelines/${timelineId}/members`);
    return response.data;
  },

  /**
   * Invite a user to a timeline
   */
  invite: async (
    timelineId: string,
    data: InviteMemberDto
  ): Promise<TimelineMemberWithUser> => {
    const response = await apiClient.post(
      `/api/timelines/${timelineId}/members`,
      data
    );
    return response.data;
  },

  /**
   * Update a member's role
   */
  updateRole: async (
    timelineId: string,
    userId: string,
    data: UpdateMemberRoleDto
  ): Promise<TimelineMemberWithUser> => {
    const response = await apiClient.put(
      `/api/timelines/${timelineId}/members/${userId}`,
      data
    );
    return response.data;
  },

  /**
   * Remove a member from a timeline
   */
  remove: async (timelineId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/api/timelines/${timelineId}/members/${userId}`);
  },

  /**
   * Leave a timeline (current user)
   */
  leave: async (timelineId: string): Promise<void> => {
    await apiClient.post(`/api/timelines/${timelineId}/leave`);
  },
};

/**
 * User preferences operations
 */
export const preferencesApi = {
  /**
   * Get current user preferences
   */
  get: async (): Promise<UserPreference | null> => {
    try {
      const response = await apiClient.get('/api/preferences');
      return response.data;
    } catch (error) {
      // Return null if no preferences exist yet
      return null;
    }
  },

  /**
   * Update last timeline preference
   */
  setLastTimeline: async (timelineId: string | null): Promise<UserPreference> => {
    const response = await apiClient.put('/api/preferences', {
      lastTimelineId: timelineId,
    });
    return response.data;
  },
};

/**
 * User search for member invitation
 */
export const userSearchApi = {
  /**
   * Search users by email or name
   */
  search: async (
    query: string,
    excludeTimelineId?: string
  ): Promise<{ id: string; name: string; email: string }[]> => {
    const params = new URLSearchParams({ q: query });
    if (excludeTimelineId) {
      params.append('excludeTimelineId', excludeTimelineId);
    }
    const response = await apiClient.get(`/api/users/search?${params.toString()}`);
    return response.data;
  },
};

/**
 * Dashboard API operations
 */
export const dashboardApi = {
  /**
   * Get dashboard data with timelines and grouped by status
   */
  getDashboard: async (filters: DashboardFilters = {}): Promise<DashboardResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.role) params.append('role', filters.role);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/api/dashboard?${params.toString()}`);
    return response.data;
  },

  /**
   * Get aggregate statistics across all timelines
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },

  /**
   * Get archived timelines with pagination (US9: Archive Management)
   */
  getArchive: async (filters: ArchiveFilters = {}): Promise<ArchiveResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.get(`/api/dashboard/archive?${params.toString()}`);
    return response.data;
  },
};

export default timelinesApi;
