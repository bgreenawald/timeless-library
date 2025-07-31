import { jest } from '@jest/globals';

// Mock import.meta.env before importing modules that use it
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        GITHUB_TOKEN: 'test-token',
        GITHUB_REPO_OWNER: 'test-owner',
        GITHUB_REPO_NAME: 'test-repo',
        DEV: false,
      },
    },
  },
});

import { findLatestVersion, getBookVersions } from '../paths';
import { fetchTags } from '../github';

// Mock the github module
jest.mock('../github');
const mockFetchTags = fetchTags as jest.MockedFunction<typeof fetchTags>;

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findLatestVersion', () => {
    it('should find latest version from sorted tags', () => {
      const versions = [
        { name: 'book--v1.0.0', commit: { sha: 'abc', url: 'url' } },
        { name: 'book--v1.1.0', commit: { sha: 'def', url: 'url' } },
        { name: 'book--v1.0.1', commit: { sha: 'ghi', url: 'url' } },
      ];

      const result = findLatestVersion(versions);

      expect(result).toBe('book--v1.1.0');
    });

    it('should handle single version', () => {
      const versions = [{ name: 'book--v1.0.0', commit: { sha: 'abc', url: 'url' } }];

      const result = findLatestVersion(versions);

      expect(result).toBe('book--v1.0.0');
    });

    it('should return null for empty array', () => {
      const result = findLatestVersion([]);

      expect(result).toBeNull();
    });

    it('should handle alpha/beta versions correctly', () => {
      const versions = [
        { name: 'book--v1.0.0-alpha', commit: { sha: 'abc', url: 'url' } },
        { name: 'book--v1.0.0-beta', commit: { sha: 'def', url: 'url' } },
        { name: 'book--v1.0.0', commit: { sha: 'ghi', url: 'url' } },
      ];

      const result = findLatestVersion(versions);

      // findLatestVersion doesn't filter - it just finds the latest by name sorting
      // The filtering happens in filterVersions which is called by getBookVersions
      expect(result).toBe('book--v1.0.0-beta');
    });
  });

  describe('getBookVersions', () => {
    it('should filter tags by book slug', async () => {
      const mockTags = [
        { name: 'the-federalist-papers--v1.0.0', commit: { sha: 'abc', url: 'url' } },
        { name: 'other-book--v1.0.0', commit: { sha: 'def', url: 'url' } },
        { name: 'the-federalist-papers--v1.1.0', commit: { sha: 'ghi', url: 'url' } },
      ];

      mockFetchTags.mockResolvedValue(mockTags);

      const result = await getBookVersions('the-federalist-papers');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('the-federalist-papers--v1.0.0');
      expect(result[1].name).toBe('the-federalist-papers--v1.1.0');
    });

    it('should filter out alpha/beta versions in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      const originalDev = process.env.DEV;
      process.env.NODE_ENV = 'production';
      process.env.DEV = 'false';

      const mockTags = [
        { name: 'book--v1.0.0', commit: { sha: 'abc', url: 'url' } },
        { name: 'book--v1.0.0-alpha', commit: { sha: 'def', url: 'url' } },
        { name: 'book--v1.0.0-beta', commit: { sha: 'ghi', url: 'url' } },
      ];

      mockFetchTags.mockResolvedValue(mockTags);

      const result = await getBookVersions('book');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('book--v1.0.0');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
      process.env.DEV = originalDev;
    });

    it('should include alpha/beta versions in development', async () => {
      // Mock development environment - set DEV to true which should be sufficient
      const originalDev = process.env.DEV;
      process.env.DEV = 'true';

      const mockTags = [
        { name: 'book--v1.0.0', commit: { sha: 'abc', url: 'url' } },
        { name: 'book--v1.0.0-alpha', commit: { sha: 'def', url: 'url' } },
        { name: 'book--v1.0.0-beta', commit: { sha: 'ghi', url: 'url' } },
      ];

      mockFetchTags.mockResolvedValue(mockTags);

      const result = await getBookVersions('book');

      expect(result).toHaveLength(3);
      expect(result.map(v => v.name)).toEqual([
        'book--v1.0.0',
        'book--v1.0.0-alpha',
        'book--v1.0.0-beta',
      ]);

      // Restore original environment
      process.env.DEV = originalDev;
    });

    it('should return empty array on fetch failure', async () => {
      mockFetchTags.mockRejectedValue(new Error('Network error'));

      const result = await getBookVersions('book');

      expect(result).toEqual([]);
    });

    it('should handle exact slug matching', async () => {
      const mockTags = [
        { name: 'war--v1.0.0', commit: { sha: 'abc', url: 'url' } },
        { name: 'war-and-peace--v1.0.0', commit: { sha: 'def', url: 'url' } },
      ];

      mockFetchTags.mockResolvedValue(mockTags);

      // Should only match exact slug, not prefix
      const result = await getBookVersions('war');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('war--v1.0.0');
    });
  });
});
