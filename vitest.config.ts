import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './src/test-setup-vitest.ts',
      exclude: [
        '**/node_modules/**', 
        '**/dist/**', 
        '**/.astro/**',
        '**/src/lib/__tests__/**', // Exclude Jest tests
        '**/src/lib/logger.test.ts' // Exclude Jest test files
      ],
    },
    resolve: {
      alias: {
        '~': '/src'
      }
    }
  })
);