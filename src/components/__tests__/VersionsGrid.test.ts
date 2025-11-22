// @vitest-environment node
import { expect, test, describe } from 'vitest';
import VersionsGrid from '../VersionsGrid.astro';
import { createTestContainer } from '../../test-utils';

describe('VersionsGrid Component', () => {
  const mockVersions = [
    { name: 'v1.0.0-original', commit: { sha: 'abc123' } },
    { name: 'v1.1.0-modernized', commit: { sha: 'def456' } },
    { name: 'v1.2.0-annotated', commit: { sha: 'ghi789' } },
  ];

  test('renders versions grid with all versions', async () => {
    const container = await createTestContainer();

    const result = await container.renderToString(VersionsGrid, {
      props: {
        versions: mockVersions,
        bookSlug: 'test-book',
      },
    });

    expect(result).toContain('All Available Versions');
    expect(result).toContain('1.0.0');
    expect(result).toContain('1.1.0');
    expect(result).toContain('1.2.0');
    expect(result).toContain('/books/test-book/v1.0.0-original');
    expect(result).toContain('/books/test-book/v1.1.0-modernized');
    expect(result).toContain('/books/test-book/v1.2.0-annotated');
  });

  test('generates correct links for each version', async () => {
    const container = await createTestContainer();

    const result = await container.renderToString(VersionsGrid, {
      props: {
        versions: mockVersions,
        bookSlug: 'my-book',
      },
    });

    expect(result).toContain('/books/my-book/v1.0.0-original');
    expect(result).toContain('/books/my-book/v1.1.0-modernized');
    expect(result).toContain('/books/my-book/v1.2.0-annotated');
  });

  test('displays version descriptions', async () => {
    const container = await createTestContainer();

    const result = await container.renderToString(VersionsGrid, {
      props: {
        versions: mockVersions,
        bookSlug: 'test-book',
      },
    });

    expect(result).toContain('View details for version v1.0.0-original');
    expect(result).toContain('View details for version v1.1.0-modernized');
    expect(result).toContain('View details for version v1.2.0-annotated');
  });

  test('renders with empty versions array', async () => {
    const container = await createTestContainer();

    const result = await container.renderToString(VersionsGrid, {
      props: {
        versions: [],
        bookSlug: 'test-book',
      },
    });

    expect(result).toContain('All Available Versions');
    // Should not contain any version-specific content
    expect(result).not.toContain('View details for version');
  });

  test('applies theme colors to version cards', async () => {
    const container = await createTestContainer();

    const result = await container.renderToString(VersionsGrid, {
      props: {
        versions: mockVersions,
        bookSlug: 'test-book',
      },
    });

    // The getThemeColor function should generate different colors for different indices
    expect(result).toContain('background-color:');
    expect(result).toContain('book-cover');
  });
});
