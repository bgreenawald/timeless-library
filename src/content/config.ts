import { defineCollection, z } from 'astro:content';

// Export the schema so it can be used to derive TypeScript types
export const bookSchema = z.object({
  title: z.string(),
  author: z.string(),
  original_publication_year: z.number(),
  short_description: z.string(),
  description: z.string(),
  genres: z.array(
    z.enum(['Economics', 'Philosophy', 'History', 'Political Science', 'Theology', 'Sociology'])
  ),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  cover_image: z.string().optional(), // Path to cover image in public/covers/
});

const booksCollection = defineCollection({
  type: 'content',
  schema: bookSchema,
});

export const collections = {
  books: booksCollection,
};
