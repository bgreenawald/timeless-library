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
  cover_image: z.string().optional(), // Path to cover image in public/covers/
});

const featuredSchema = z.object({
  slugs: z.array(z.string()),
});

const booksCollection = defineCollection({
  type: 'content',
  schema: bookSchema,
});

const featuredCollection = defineCollection({
  type: 'data',
  schema: featuredSchema,
});

export const collections = {
  books: booksCollection,
  featured: featuredCollection,
};
