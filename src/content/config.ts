import { defineCollection, z } from 'astro:content';

const booksCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    original_publication_year: z.number(),
    short_description: z.string(),
    description: z.string(),
    genres: z.array(
      z.enum(['Economics', 'Philosophy', 'History', 'Political Science', 'Theology'])
    ),
    tags: z.array(z.string()).optional(),
    is_featured: z.boolean().optional(),
    cover_image: z.string().optional(), // Path to cover image in public/covers/
  }),
});

export const collections = {
  books: booksCollection,
};
