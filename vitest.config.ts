/// <reference types="vitest/config" />

import { getViteConfig } from 'astro/config';

const vitestConfig = {
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test-setup-vitest.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/src/lib/__tests__/**', // Exclude Jest tests
      '**/src/lib/logger.test.ts', // Exclude Jest test files
      '**/src/scripts/__tests__/**', // Exclude Jest script tests
    ],
  },
  resolve: {
    alias: {
      '~': '/src',
    },
  },
};

export default getViteConfig(vitestConfig);
