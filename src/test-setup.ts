// Global test setup
import { jest } from '@jest/globals';
import './test-polyfills'; // Import polyfills first

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.GITHUB_TOKEN = 'test-token';
process.env.GITHUB_REPO_OWNER = 'test-owner';
process.env.GITHUB_REPO_NAME = 'test-repo';

// Mock global fetch for tests
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Increase test timeout for async operations
jest.setTimeout(10000);
