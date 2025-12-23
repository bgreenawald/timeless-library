/**
 * Utility function to handle environment variable access gracefully across different environments.
 *
 * This function handles the differences between:
 * - Test environments (Jest) where import.meta.env is not available
 * - Development/production environments where import.meta.env is available
 *
 * @param key - The environment variable key to retrieve
 * @param fallback - Optional fallback value if the environment variable is not set
 * @returns The environment variable value or the fallback
 */
export const getEnvVar = (key: string, fallback?: string): string | undefined => {
  // Check if we're in a test environment first
  if (process.env.NODE_ENV === 'test') {
    return process.env[key] || fallback;
  }

  // In non-test environments, use import.meta.env if available
  try {
    // Use dynamic access to avoid Jest parse errors
    const importMetaEnv =
      (globalThis as any).import?.meta?.env || (global as any).import?.meta?.env;
    if (importMetaEnv) {
      return importMetaEnv[key] || fallback;
    }
  } catch (e) {
    // Fallback to process.env if import.meta is not available
  }

  return process.env[key] || fallback;
};

/**
 * Checks if the application is running in development mode.
 * Handles the fact that import.meta.env.DEV is a boolean in Astro, not a string.
 *
 * @returns true if in development mode, false otherwise
 */
export const isDev = (): boolean => {
  // Check if we're in a test environment first
  if (process.env.NODE_ENV === 'test') {
    return process.env.DEV === 'true';
  }

  // In non-test environments, use import.meta.env if available
  try {
    // Use dynamic access to avoid Jest parse errors
    const importMetaEnv =
      (globalThis as any).import?.meta?.env || (global as any).import?.meta?.env;
    if (importMetaEnv) {
      // DEV is a boolean in Astro, not a string
      if (typeof importMetaEnv.DEV === 'boolean') {
        return importMetaEnv.DEV;
      }
      // Fallback to string comparison for other environments
      return importMetaEnv.DEV === 'true';
    }
  } catch (e) {
    // Fallback to process.env if import.meta is not available
  }

  return process.env.DEV === 'true' || process.env.NODE_ENV === 'development';
};
