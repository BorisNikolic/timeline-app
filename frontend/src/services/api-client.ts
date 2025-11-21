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
  timeout: 10000,
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
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

// Events API
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
};

// Categories API
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
};

export default apiClient;
