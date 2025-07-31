import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import DownloadsTable from '../DownloadsTable.astro';

describe('DownloadsTable Component', () => {
  const mockRelease = {
    tag_name: 'v1.0.0-original',
    assets: [
      {
        name: 'test-book-annotated.epub',
        browser_download_url: 'https://example.com/test-book-annotated.epub',
        size: 1024,
        content_type: 'application/epub+zip'
      },
      {
        name: 'test-book-modernized.pdf',
        browser_download_url: 'https://example.com/test-book-modernized.pdf',
        size: 2048,
        content_type: 'application/pdf'
      },
      {
        name: 'test-book-original.txt',
        browser_download_url: 'https://example.com/test-book-original.txt',
        size: 512,
        content_type: 'text/plain'
      },
      {
        name: 'test-book-metadata.json',
        browser_download_url: 'https://example.com/test-book-metadata.json',
        size: 256,
        content_type: 'application/json'
      }
    ]
  };

  test('renders downloads table with all asset types', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(DownloadsTable, {
      props: {
        release: mockRelease,
        version: 'v1.0.0-original',
        title: 'Test Downloads'
      }
    });

    expect(result).toContain('Test Downloads');
    expect(result).toContain('Version: v1.0.0-original');
    expect(result).toContain('Annotated');
    expect(result).toContain('Modernized');
    expect(result).toContain('Original');
    expect(result).toContain('Metadata');
    expect(result).toContain('EPUB');
    expect(result).toContain('PDF');
    expect(result).toContain('TXT');
    expect(result).toContain('JSON');
  });

  test('sorts assets in correct order', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(DownloadsTable, {
      props: {
        release: mockRelease,
        version: 'v1.0.0-original',
        title: 'Test Downloads'
      }
    });

    // Check that assets appear in the correct order
    const annotatedIndex = result.indexOf('Annotated');
    const modernizedIndex = result.indexOf('Modernized');
    const originalIndex = result.indexOf('Original');
    const metadataIndex = result.indexOf('Metadata');

    expect(annotatedIndex).toBeLessThan(modernizedIndex);
    expect(modernizedIndex).toBeLessThan(originalIndex);
    expect(originalIndex).toBeLessThan(metadataIndex);
  });

  test('handles unknown version gracefully', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(DownloadsTable, {
      props: {
        release: mockRelease,
        version: null,
        title: 'Test Downloads'
      }
    });

    expect(result).toContain('Version: Unknown');
  });

  test('renders download links', async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(DownloadsTable, {
      props: {
        release: mockRelease,
        version: 'v1.0.0-original',
        title: 'Test Downloads'
      }
    });

    expect(result).toContain('https://example.com/test-book-annotated.epub');
    expect(result).toContain('https://example.com/test-book-modernized.pdf');
    expect(result).toContain('https://example.com/test-book-original.txt');
    expect(result).toContain('https://example.com/test-book-metadata.json');
  });
});