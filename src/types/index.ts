import type { BookMetadata, ProcessingPhase } from '../lib/metadata';
import { z } from 'astro:content';
import { bookSchema } from '../content/config';

/**
 * Interface representing the data structure of a book from the content collection.
 * Derived from the Zod schema to ensure type safety and synchronization.
 */
export type BookData = z.infer<typeof bookSchema>;

/**
 * Interface representing a book collection entry from Astro.
 */
export interface Book {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: BookData;
}

export type { BookMetadata, ProcessingPhase };
