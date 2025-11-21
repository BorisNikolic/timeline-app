import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables - use vi.stubEnv for Vitest
vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

globalThis.localStorage = localStorageMock as unknown as Storage;
