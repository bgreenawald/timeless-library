// Test utilities for Astro component testing
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';

/**
 * Creates an AstroContainer instance with renderers loaded.
 * This is necessary to avoid "NoMatchingRenderer" errors when testing Astro components.
 */
export async function createTestContainer() {
  const renderers = await loadRenderers([]);
  return await AstroContainer.create({ renderers });
}
