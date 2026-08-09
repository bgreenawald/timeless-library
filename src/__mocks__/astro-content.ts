// Mock for astro:content module used in tests

export interface BookEntry {
  id: string;
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
        id: 'test-book',
        data: {
          title: 'Test Book',
          author: 'Test Author',
          description: 'A test book for testing purposes',
        },
      },
      {
        id: 'another-book',
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
