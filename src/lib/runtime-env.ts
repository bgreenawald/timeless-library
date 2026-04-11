/**
 * Dev mode for Astro builds and Node/Jest.
 * Uses process.env so Jest (CommonJS) and Astro static generation agree; Astro sets NODE_ENV during dev/build.
 */
export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.DEV === 'true';
}
