import type { BookMetadata, ProcessingPhase } from '../lib/metadata';
import type { GithubRelease } from '../lib/github';

/**
 * Interface representing the data structure of a book from the content collection.
 */
export interface BookData {
  title: string;
  author: string;
  original_publication_year: number;
  short_description: string;
  description: string;
  genres: ('Adventure' | 'Fiction' | 'Classic' | 'Whaling' | 'History' | 'Political Science')[];
  tags?: string[];
  is_featured?: boolean;
  cover_image?: string;
}

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

/**
 * Interface representing a GitHub release asset from the API response.
 */
export interface GithubReleaseAsset {
  name: string;
  browser_download_url: string;
  size?: number;
  content_type?: string;
  download_count?: number;
}

/**
 * Interface representing a GitHub release from the API response.
 * Extends the existing GithubRelease type with additional properties.
 */
export interface GitHubRelease extends GithubRelease {
  assets: GithubReleaseAsset[];
}

export type { BookMetadata, ProcessingPhase };
