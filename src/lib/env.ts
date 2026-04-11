/**
 * Node-only helpers used by Jest tests where Vite env injection is not used.
 */
export const getEnvVar = (key: string, fallback?: string): string | undefined =>
  process.env[key] ?? fallback;

export const isDev = (): boolean =>
  process.env.NODE_ENV === 'development' || process.env.DEV === 'true';
