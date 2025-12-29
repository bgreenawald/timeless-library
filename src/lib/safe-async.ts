import { logger } from './logger';

/**
 * Safely executes an async operation with error handling and fallback
 *
 * @param operation - The async operation to execute
 * @param fallback - The fallback value to return on error
 * @param errorMessage - Custom error message for logging
 * @returns Promise resolving to either the operation result or fallback
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = errorMessage || 'Async operation failed';
    logger.error(message, error);
    return fallback;
  }
}

/**
 * Safely executes multiple async operations in parallel with individual fallbacks
 *
 * @param operations - Array of operations with their fallback values
 * @returns Promise resolving to array of results or fallbacks
 */
export async function safeAsyncAll<T>(
  operations: Array<{
    operation: () => Promise<T>;
    fallback: T;
    errorMessage?: string;
  }>
): Promise<T[]> {
  const results = await Promise.allSettled(operations.map(({ operation }) => operation()));

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      const { fallback, errorMessage } = operations[index];
      const message = errorMessage || `Operation ${index} failed`;
      logger.error(message, result.reason);
      return fallback;
    }
  });
}

/**
 * Creates a retry wrapper for async operations
 *
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param delay - Delay between retries in milliseconds
 * @returns Promise resolving to the operation result
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        logger.error(`Operation failed after ${maxRetries + 1} attempts:`, lastError);
        throw lastError;
      }

      logger.warn(
        `Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
        lastError.message
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Timeout wrapper for async operations
 *
 * @param operation - The async operation to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message for timeout
 * @returns Promise resolving to the operation result or rejecting on timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const message = errorMessage || `Operation timed out after ${timeoutMs}ms`;
      reject(new Error(message));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}
