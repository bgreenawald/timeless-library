// Mock for astro:content module used in tests

export interface BookEntry {
  slug: string;
  data: {
    title: string;
    author: string;
    description: string;
    [key: string]: any;
  };
}

export const getCollection = async (collectionName: string): Promise<BookEntry[]> => {
  if (collectionName === 'books') {
    // Return mock books data
    return [
      {
        slug: 'test-book',
        data: {
          title: 'Test Book',
          author: 'Test Author',
          description: 'A test book for testing purposes',
        },
      },
      {
        slug: 'another-book',
        data: {
          title: 'Another Book',
          author: 'Another Author',
          description: 'Another test book',
        },
      },
    ];
  }
  return [];
};
