// @vitest-environment node
import { expect, test, describe } from 'vitest';
import BookDetail from '../BookDetail.astro';
import { createTestContainer } from '../../test-utils';

describe('BookDetail Component', () => {
  test('renders book title and author', async () => {
    const container = await createTestContainer();

    const mockBook = {
      id: 'test-book',
      slug: 'test-book',
      body: '',
      collection: 'books',
      data: {
        title: 'Test Book Title',
        author: 'Test Author',
        original_publication_year: 2023,
        short_description: 'A test book',
        description: 'This is a test book description',
        genres: ['Philosophy' as const, 'History' as const],
        tags: ['test', 'example'],
        is_featured: true,
        cover_image: '/test-cover.jpg',
      },
    };

    const result = await container.renderToString(BookDetail, {
      props: { book: mockBook },
    });

    expect(result).toContain('Test Book Title');
    expect(result).toContain('by Test Author');
    expect(result).toContain('Published in 2023');
    expect(result).toContain('This is a test book description');
    expect(result).toContain('Genres: Philosophy, History');
    expect(result).toContain('Tags: test, example');
  });

  test('renders without cover image', async () => {
    const container = await createTestContainer();

    const mockBook = {
      id: 'test-book',
      slug: 'test-book',
      body: '',
      collection: 'books',
      data: {
        title: 'Test Book Title',
        author: 'Test Author',
        original_publication_year: 2023,
        short_description: 'A test book',
        description: 'This is a test book description',
        genres: ['Economics' as const],
        tags: undefined,
        is_featured: false,
      },
    };

    const result = await container.renderToString(BookDetail, {
      props: { book: mockBook },
    });

    expect(result).toContain('Test Book Title');
    expect(result).toContain('by Test Author');
    expect(result).toContain('book-detail-cover-placeholder');
    expect(result).not.toContain('Tags:');
  });

  test('renders with cover image', async () => {
    const container = await createTestContainer();

    const mockBook = {
      id: 'test-book',
      slug: 'test-book',
      body: '',
      collection: 'books',
      data: {
        title: 'Test Book Title',
        author: 'Test Author',
        original_publication_year: 2023,
        short_description: 'A test book',
        description: 'This is a test book description',
        genres: ['Political Science' as const],
        cover_image: '/covers/test-book.jpg',
      },
    };

    const result = await container.renderToString(BookDetail, {
      props: { book: mockBook },
    });

    expect(result).toContain('Test Book Title');
    expect(result).toContain('/covers/test-book.jpg');
    expect(result).toContain('Cover for Test Book Title');
  });
});
