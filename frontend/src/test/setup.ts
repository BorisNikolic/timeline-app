import '@testing-library/jest-dom';

// Mock environment variables
import.meta.env.VITE_API_URL = 'http://localhost:3000';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;
