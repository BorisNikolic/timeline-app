/**
 * API service for fetching festival data
 *
 * Uses PUBLIC API endpoints (read-only, no authentication required)
 */

import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get all public timelines (Active or Completed only)
 */
export async function getTimelines() {
  const response = await api.get('/api/public/timelines');
  return response.data;
}

/**
 * Get a specific public timeline by ID
 */
export async function getTimeline(timelineId) {
  const response = await api.get(`/api/public/timelines/${timelineId}`);
  return response.data;
}

/**
 * Get all events for a public timeline
 */
export async function getTimelineEvents(timelineId) {
  const response = await api.get(`/api/public/timelines/${timelineId}/events`);
  return response.data;
}

/**
 * Get all categories (stages) for a public timeline
 */
export async function getTimelineCategories(timelineId) {
  const response = await api.get(`/api/public/timelines/${timelineId}/categories`);
  return response.data;
}

export default api;
