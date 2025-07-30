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
      }
    }
  },
});

import { fetchTags, fetchRelease, fetchRawFile } from '../github';

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('github', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('fetchTags', () => {
    it('should fetch and return tags successfully', async () => {
      const mockTags = [
        {
          name: 'v1.0.0',
          commit: {
            sha: 'abc123',
            url: 'https://api.github.com/repos/test/test/commits/abc123',
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTags,
      } as Response);

      const result = await fetchTags();

      expect(result).toEqual(mockTags);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/tags',
        { headers: { Authorization: 'token test-token' } }
      );
    });

    it('should return empty array on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await fetchTags();

      expect(result).toEqual([]);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchTags();

      expect(result).toEqual([]);
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      const result = await fetchTags();

      expect(result).toEqual([]);
    });
  });

  describe('fetchRelease', () => {
    it('should fetch and return release successfully', async () => {
      const mockRelease = {
        tag_name: 'v1.0.0',
        assets: [
          {
            name: 'book-original.md',
            browser_download_url:
              'https://github.com/test/test/releases/download/v1.0.0/book-original.md',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRelease,
      } as Response);

      const result = await fetchRelease('v1.0.0');

      expect(result).toEqual(mockRelease);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/releases/tags/v1.0.0',
        { headers: { Authorization: 'token test-token' } }
      );
    });

    it('should return null on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await fetchRelease('v1.0.0');

      expect(result).toBeNull();
    });
  });

  describe('fetchRawFile', () => {
    it('should fetch and return file content successfully', async () => {
      const mockContent = 'File content here';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      } as Response);

      const result = await fetchRawFile('abc123', 'path/to/file.md');

      expect(result).toBe(mockContent);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/contents/path/to/file.md?ref=abc123',
        {
          headers: {
            Accept: 'application/vnd.github.v3.raw',
            Authorization: 'token test-token',
          },
        }
      );
    });

    it('should return null on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await fetchRawFile('abc123', 'path/to/file.md');

      expect(result).toBeNull();
    });
  });
});
