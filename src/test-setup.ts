// Global test setup
import { jest } from '@jest/globals';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.GITHUB_TOKEN = 'test-token';
process.env.GITHUB_REPO_OWNER = 'test-owner';
process.env.GITHUB_REPO_NAME = 'test-repo';

// Mock import.meta.env for Astro/Vite
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        DEV: false,
        PROD: true,
        MODE: 'test',
        GITHUB_TOKEN: 'test-token',
        GITHUB_REPO_OWNER: 'test-owner',
        GITHUB_REPO_NAME: 'test-repo',
      }
    }
  },
  writable: true
});

// Mock global fetch for tests
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Increase test timeout for async operations
jest.setTimeout(10000);
