import type { BookMetadata, ProcessingPhase } from '../lib/metadata';
import { bookSchema } from '../content.config';

/**
 * Interface representing the data structure of a book from the content collection.
 * Derived from the Zod schema to ensure type safety and synchronization.
 */
export type BookData = ReturnType<typeof bookSchema.parse>;

/**
 * Interface representing a book collection entry from Astro.
 */
export interface Book {
  id: string;
  body: string;
  collection: string;
  data: BookData;
}

export type { BookMetadata, ProcessingPhase };
