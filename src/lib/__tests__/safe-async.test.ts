import { safeAsync, safeAsyncAll, withRetry, withTimeout } from '../safe-async';
import { jest } from '@jest/globals';

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('safe-async', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('safeAsync', () => {
    it('should return operation result on success', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const fallback = 'fallback';

      const result = await safeAsync(operation, fallback);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should return fallback on error', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Test error'));
      const fallback = 'fallback';

      const result = await safeAsync(operation, fallback, 'Custom error message');

      expect(result).toBe('fallback');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('safeAsyncAll', () => {
    it('should return all successful results', async () => {
      const operations = [
        {
          operation: jest.fn().mockResolvedValue('result1'),
          fallback: 'fallback1',
        },
        {
          operation: jest.fn().mockResolvedValue('result2'),
          fallback: 'fallback2',
        },
      ];

      const results = await safeAsyncAll(operations);

      expect(results).toEqual(['result1', 'result2']);
    });

    it('should return fallback for failed operations', async () => {
      const operations = [
        {
          operation: jest.fn().mockResolvedValue('result1'),
          fallback: 'fallback1',
        },
        {
          operation: jest.fn().mockRejectedValue(new Error('Test error')),
          fallback: 'fallback2',
        },
      ];

      const results = await safeAsyncAll(operations);

      expect(results).toEqual(['result1', 'fallback2']);
    });
  });

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await withRetry(operation, 3, 100);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');

      const result = await withRetry(operation, 3, 10);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(withRetry(operation, 2, 10)).rejects.toThrow('Persistent error');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('withTimeout', () => {
    it('should return result before timeout', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await withTimeout(operation, 1000);

      expect(result).toBe('success');
    });

    it('should timeout for slow operations', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve('success'), 200))
        );

      await expect(withTimeout(operation, 100)).rejects.toThrow('Operation timed out after 100ms');
    });

    it('should use custom timeout message', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve('success'), 200))
        );

      await expect(withTimeout(operation, 100, 'Custom timeout message')).rejects.toThrow(
        'Custom timeout message'
      );
    });
  });
});
