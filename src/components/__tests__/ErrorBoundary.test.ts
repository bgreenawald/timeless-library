import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import ErrorBoundary from '../ErrorBoundary.astro';

describe('ErrorBoundary Component', () => {
  test('renders default error message', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(ErrorBoundary, {
      props: {},
    });

    expect(result).toContain('Error Loading Content');
    expect(result).toContain('Something went wrong while loading this content.');
    expect(result).toContain('Try Again');
  });

  test('renders custom fallback message', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(ErrorBoundary, {
      props: {
        fallback: 'Custom error message for testing',
      },
    });

    expect(result).toContain('Error Loading Content');
    expect(result).toContain('Custom error message for testing');
    expect(result).not.toContain('Something went wrong while loading this content.');
  });

  test('shows error details when showDetails is true', async () => {
    const container = await AstroContainer.create();

    const mockError = new Error('Test error message');
    mockError.stack = 'Error: Test error message\n    at test:1:1';

    const result = await container.renderToString(ErrorBoundary, {
      props: {
        showDetails: true,
        error: mockError,
      },
    });

    expect(result).toContain('Technical Details');
    expect(result).toContain('Test error message');
  });

  test('hides error details when showDetails is false', async () => {
    const container = await AstroContainer.create();

    const mockError = new Error('Test error message');

    const result = await container.renderToString(ErrorBoundary, {
      props: {
        showDetails: false,
        error: mockError,
      },
    });

    expect(result).not.toContain('Technical Details');
    expect(result).not.toContain('Test error message');
  });

  test('handles missing error gracefully', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(ErrorBoundary, {
      props: {
        showDetails: true,
        // No error provided
      },
    });

    expect(result).toContain('Error Loading Content');
    expect(result).not.toContain('Technical Details');
  });

  test('includes reload button', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(ErrorBoundary, {
      props: {},
    });

    expect(result).toContain('window.location.reload()');
    expect(result).toContain('Try Again');
  });

  test('applies correct CSS classes', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(ErrorBoundary, {
      props: {},
    });

    expect(result).toContain('error-boundary');
    expect(result).toContain('bg-red-50');
    expect(result).toContain('border-red-200');
    expect(result).toContain('text-red-800');
  });
});
