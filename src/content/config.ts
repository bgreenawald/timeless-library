import { defineCollection, z } from "astro:content";

const booksCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    original_publication_year: z.number(),
    description: z.string(),
    genres: z.array(z.enum(["Adventure", "Fiction", "Classic", "Whaling"])),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  books: booksCollection,
};
