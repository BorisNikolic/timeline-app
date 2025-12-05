import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  EventStatus,
  EventPriority,
  Event,
  EventWithDetails,
  CreateEventDto,
  UpdateEventDto
} from '../types/Event';

// Re-export types for backward compatibility
export { EventStatus, EventPriority };
export type { Event, EventWithDetails, CreateEventDto, UpdateEventDto };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 90000, // 90s to handle Render free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User-friendly error messages for common HTTP status codes
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This operation conflicts with existing data. Please refresh and try again.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Service is temporarily unavailable. Please try again later.',
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      // Use BASE_URL to support GitHub Pages subdirectory deployment
      const basePath = import.meta.env.BASE_URL || '/';
      window.location.href = `${basePath}auth`;
    }

    // Transform error into user-friendly message
    const errorData = error.response?.data as Record<string, string> | undefined;
    const statusCode = error.response?.status;

    // Priority: specific message from server > generic message for status code > axios message
    let userMessage = errorData?.message || errorData?.error;

    if (!userMessage && statusCode && ERROR_MESSAGES[statusCode]) {
      userMessage = ERROR_MESSAGES[statusCode];
    }

    if (!userMessage) {
      userMessage = error.message || 'An unexpected error occurred';
    }

    // Create a new error with user-friendly message
    const friendlyError = new Error(userMessage);
    (friendlyError as Error & { originalError: AxiosError }).originalError = error;

    return Promise.reject(friendlyError);
  }
);

// Helper function to handle errors
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Prefer detailed message over generic error
    // For example, whitelist rejection sends both 'error' and 'message' fields
    const errorData = error.response?.data;
    return errorData?.message || errorData?.error || error.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
}

// Auth API
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', credentials);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

// Category API types
export interface Category {
  id: string;
  name: string;
  color: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}

// Events API (legacy - non-scoped)
export const eventsApi = {
  getAll: async (startDate?: string, endDate?: string): Promise<EventWithDetails[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`/api/events?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<EventWithDetails> => {
    const response = await apiClient.get(`/api/events/${id}`);
    return response.data;
  },

  create: async (data: CreateEventDto): Promise<EventWithDetails> => {
    const response = await apiClient.post('/api/events', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEventDto): Promise<EventWithDetails> => {
    const response = await apiClient.put(`/api/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/events/${id}`);
  },

  // Timeline-scoped operations (T104)
  getByTimeline: async (
    timelineId: string,
    options?: { startDate?: string; endDate?: string; sortBy?: string; status?: string; priority?: string; categoryId?: string }
  ): Promise<EventWithDetails[]> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.status) params.append('status', options.status);
    if (options?.priority) params.append('priority', options.priority);
    if (options?.categoryId) params.append('categoryId', options.categoryId);
    const response = await apiClient.get(`/api/timelines/${timelineId}/events?${params.toString()}`);
    return response.data;
  },

  createInTimeline: async (timelineId: string, data: CreateEventDto): Promise<EventWithDetails> => {
    const response = await apiClient.post(`/api/timelines/${timelineId}/events`, data);
    return response.data;
  },

  updateInTimeline: async (timelineId: string, eventId: string, data: UpdateEventDto): Promise<EventWithDetails> => {
    const response = await apiClient.put(`/api/timelines/${timelineId}/events/${eventId}`, data);
    return response.data;
  },

  deleteFromTimeline: async (timelineId: string, eventId: string): Promise<void> => {
    await apiClient.delete(`/api/timelines/${timelineId}/events/${eventId}`);
  },
};

// Categories API (legacy - non-scoped)
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/categories');
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/api/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post('/api/categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.put(`/api/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`);
  },

  // Timeline-scoped operations (T105)
  getByTimeline: async (timelineId: string): Promise<Category[]> => {
    const response = await apiClient.get(`/api/timelines/${timelineId}/categories`);
    return response.data;
  },

  createInTimeline: async (timelineId: string, data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post(`/api/timelines/${timelineId}/categories`, data);
    return response.data;
  },

  updateInTimeline: async (timelineId: string, categoryId: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.put(`/api/timelines/${timelineId}/categories/${categoryId}`, data);
    return response.data;
  },

  deleteFromTimeline: async (timelineId: string, categoryId: string): Promise<void> => {
    await apiClient.delete(`/api/timelines/${timelineId}/categories/${categoryId}`);
  },
};

export default apiClient;
