// Vitest setup for Astro component tests
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.GITHUB_TOKEN = 'test-token';
process.env.GITHUB_REPO_OWNER = 'test-owner';
process.env.GITHUB_REPO_NAME = 'test-repo';

// Mock global fetch for tests
global.fetch = vi.fn();
