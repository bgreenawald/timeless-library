import { jest } from '@jest/globals';

import {
  findLatestVersion,
  getBookVersions,
  getReleaseForVersion,
  clearTagsCache,
  clearReleaseCache,
} from '../paths';
import { fetchTags, fetchRelease } from '../github';

// Mock the github module
jest.mock('../github');
const mockFetchTags = fetchTags as jest.MockedFunction<typeof fetchTags>;
const mockFetchRelease = fetchRelease as jest.MockedFunction<typeof fetchRelease>;

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
    clearTagsCache(); // Clear cache between tests to ensure isolation
    clearReleaseCache();
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

    it('should rank release above pre-releases', () => {
      const versions = [
        { name: 'book--v1.0.0-alpha', commit: { sha: 'abc', url: 'url' } },
        { name: 'book--v1.0.0-beta', commit: { sha: 'def', url: 'url' } },
        { name: 'book--v1.0.0', commit: { sha: 'ghi', url: 'url' } },
      ];

      const result = findLatestVersion(versions);

      expect(result).toBe('book--v1.0.0');
    });

    it('should order numeric segments correctly', () => {
      const versions = [
        { name: 'book--v0.2.0', commit: { sha: 'a', url: 'url' } },
        { name: 'book--v0.10.0', commit: { sha: 'b', url: 'url' } },
      ];

      expect(findLatestVersion(versions)).toBe('book--v0.10.0');
    });

    it('should compare pre-release labels lexically when core matches', () => {
      const versions = [
        { name: 'book--v1.0.0-rc.1', commit: { sha: 'a', url: 'url' } },
        { name: 'book--v1.0.0-rc.2', commit: { sha: 'b', url: 'url' } },
      ];

      expect(findLatestVersion(versions)).toBe('book--v1.0.0-rc.2');
    });

    it('should order numeric pre-release segments numerically (rc.10 after rc.2)', () => {
      const versions = [
        { name: 'book--v1.0.0-rc.2', commit: { sha: 'a', url: 'url' } },
        { name: 'book--v1.0.0-rc.10', commit: { sha: 'b', url: 'url' } },
      ];

      expect(findLatestVersion(versions)).toBe('book--v1.0.0-rc.10');
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

    it('should not drop stable tags whose slug contains alpha/beta as a substring', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDev = process.env.DEV;
      process.env.NODE_ENV = 'production';
      process.env.DEV = 'false';

      const mockTags = [
        { name: 'alphabet-book--v1.0.0', commit: { sha: 'abc', url: 'url' } },
        { name: 'new-beta--v1.0.0', commit: { sha: 'def', url: 'url' } },
      ];

      mockFetchTags.mockResolvedValue(mockTags);

      const alphabetResult = await getBookVersions('alphabet-book');
      const betaSlugResult = await getBookVersions('new-beta');

      expect(alphabetResult.map(v => v.name)).toEqual(['alphabet-book--v1.0.0']);
      expect(betaSlugResult.map(v => v.name)).toEqual(['new-beta--v1.0.0']);

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

    it('should cache tags and only call fetchTags once for multiple getBookVersions calls', async () => {
      const mockTags = [
        { name: 'book1--v1.0.0', commit: { sha: 'abc', url: 'url' } },
        { name: 'book2--v1.0.0', commit: { sha: 'def', url: 'url' } },
        { name: 'book1--v1.1.0', commit: { sha: 'ghi', url: 'url' } },
      ];

      mockFetchTags.mockResolvedValue(mockTags);

      // Call getBookVersions multiple times
      const result1 = await getBookVersions('book1');
      const result2 = await getBookVersions('book2');
      const result3 = await getBookVersions('book1');

      // fetchTags should only be called once due to caching
      expect(mockFetchTags).toHaveBeenCalledTimes(1);

      // Results should still be correct
      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(1);
      expect(result3).toHaveLength(2);
    });
  });

  describe('getReleaseForVersion', () => {
    const mockRelease = {
      id: 1,
      tag_name: 'book--v1.0.0',
      name: 'v1.0.0',
      body: '',
      published_at: '2024-01-01',
      assets: [],
    };

    it('should cache successful release fetches', async () => {
      mockFetchRelease.mockResolvedValue(mockRelease);

      await getReleaseForVersion('book--v1.0.0');
      await getReleaseForVersion('book--v1.0.0');

      expect(mockFetchRelease).toHaveBeenCalledTimes(1);
      expect(mockFetchRelease).toHaveBeenCalledWith('book--v1.0.0');
    });

    it('should not cache null results so later calls can retry', async () => {
      mockFetchRelease.mockResolvedValueOnce(null).mockResolvedValueOnce(mockRelease);

      const first = await getReleaseForVersion('book--v1.0.0');
      const second = await getReleaseForVersion('book--v1.0.0');

      expect(first).toBeNull();
      expect(second).toEqual(mockRelease);
      expect(mockFetchRelease).toHaveBeenCalledTimes(2);
    });

    it('should dedupe concurrent in-flight fetches for the same version', async () => {
      let resolveRelease!: (value: typeof mockRelease) => void;
      const deferred = new Promise<typeof mockRelease>(resolve => {
        resolveRelease = resolve;
      });
      mockFetchRelease.mockReturnValueOnce(deferred);

      const p1 = getReleaseForVersion('book--v1.0.0');
      const p2 = getReleaseForVersion('book--v1.0.0');
      resolveRelease(mockRelease);
      const [a, b] = await Promise.all([p1, p2]);

      expect(a).toEqual(mockRelease);
      expect(b).toEqual(mockRelease);
      expect(mockFetchRelease).toHaveBeenCalledTimes(1);
    });

    it('should evict cache on rejection so later calls can retry', async () => {
      mockFetchRelease
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce(mockRelease);

      await expect(getReleaseForVersion('book--v1.0.0')).rejects.toThrow('network');
      const second = await getReleaseForVersion('book--v1.0.0');

      expect(second).toEqual(mockRelease);
      expect(mockFetchRelease).toHaveBeenCalledTimes(2);
    });
  });
});
