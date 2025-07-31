# Astro Component Tests

This directory contains component tests for all Astro components using Vitest
and Astro's experimental Container API.

## Test Setup

- **Framework**: Vitest with Astro Container API
- **Environment**: happy-dom
- **Configuration**: `vitest.config.ts`
- **Setup**: `src/test-setup-vitest.ts`

## Running Tests

```bash
# Run all component tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

## Test Files

### BookDetail.test.ts

Tests the `BookDetail.astro` component:

- Renders book title, author, and publication year
- Handles books with and without cover images
- Displays genres and tags correctly
- Uses fallback placeholder when no cover image

### BookMetadata.test.ts

Tests the `BookMetadata.astro` component:

- Renders metadata summary (version, timestamp, phases)
- Displays processing phases table
- Formats timestamps correctly
- Includes interactive elements (modals, buttons)
- Handles different phase types

### DownloadsTable.test.ts

Tests the `DownloadsTable.astro` component:

- Renders download table with all asset types
- Sorts assets in correct priority order
- Handles unknown versions gracefully
- Generates correct download links
- Labels assets correctly (Annotated, Modernized, Original, Metadata)

### ErrorBoundary.test.ts

Tests the `ErrorBoundary.astro` component:

- Renders default and custom error messages
- Shows/hides error details based on props
- Handles missing error objects gracefully
- Includes reload functionality
- Applies correct CSS classes

### VersionsGrid.test.ts

Tests the `VersionsGrid.astro` component:

- Renders all available versions
- Generates correct links for each version
- Displays version descriptions
- Handles empty versions array
- Applies theme colors to version cards

## Testing Patterns

### Basic Component Test

```typescript
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import MyComponent from '../MyComponent.astro';

describe('MyComponent', () => {
  test('renders correctly', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(MyComponent, {
      props: {
        /* your props */
      },
    });

    expect(result).toContain('expected content');
  });
});
```

### Mock Data

Components use realistic mock data that matches the expected TypeScript
interfaces:

```typescript
const mockBook = {
  id: 'test-book',
  slug: 'test-book',
  body: '',
  collection: 'books',
  data: {
    title: 'Test Book Title',
    author: 'Test Author',
    // ... other properties
  },
};
```

## Environment Setup

The test environment includes:

- Mocked environment variables for GitHub integration
- Mocked global `fetch` function
- happy-dom for DOM simulation
- Astro Container API for component rendering

## Notes

- Jest tests are excluded from Vitest runs to avoid conflicts
- Early returns in components (like null metadata) may need special handling
- All tests use the Container API for server-side rendering simulation
- Tests verify both content and structure of rendered components
