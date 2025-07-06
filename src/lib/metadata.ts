import type { z } from 'astro/zod';
import type { GithubRelease } from './github';

/**
 * Interface representing a model used in a processing phase.
 */
interface Model {
  id: string;
  name: string;
}

/**
 * Interface representing a single processing phase.
 */
interface ProcessingPhase {
  phase_name: string;
  phase_index: number;
  phase_type: string;
  enabled: boolean;
  temperature: number;
  post_processors: string[];
  post_processor_count: number;
  completed: boolean;
  book_name: string;
  author_name: string;
  model_type: string;
  model: Model;
  max_workers: number;
  input_file: string;
  output_file: string;
  system_prompt_path: string;
  user_prompt_path: string;
  fully_rendered_system_prompt: string;
  length_reduction_parameter: number[];
  output_exists: boolean;
}

/**
 * Interface representing the complete metadata structure.
 */
interface BookMetadata {
  metadata_version: string;
  run_timestamp: string;
  book_name: string;
  author_name: string;
  input_file: string;
  original_file: string;
  output_directory: string;
  length_reduction: number[];
  phases: ProcessingPhase[];
  book_version: string;
}

/**
 * Supported metadata versions and their parsing functions.
 */
const METADATA_PARSERS: Record<string, (data: any) => BookMetadata> = {
  '0.0.0-alpha': (data: any): BookMetadata => {
    // Validate required fields for version 0.0.0-alpha
    if (!data.metadata_version || !data.phases || !Array.isArray(data.phases)) {
      throw new Error('Invalid metadata format: missing required fields');
    }
    
    return data as BookMetadata;
  }
};

/**
 * Parses a metadata file with version checking.
 * 
 * @param metadataContent - The raw JSON content of the metadata file
 * @returns Parsed metadata object
 * @throws Error if the metadata version is not supported or the format is invalid
 */
export function parseMetadata(metadataContent: string): BookMetadata {
  let data: any;
  
  try {
    data = JSON.parse(metadataContent);
  } catch (error) {
    throw new Error(`Failed to parse metadata JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  const version = data.metadata_version;
  
  if (!version) {
    throw new Error('Metadata file missing version information');
  }
  
  const parser = METADATA_PARSERS[version];
  
  if (!parser) {
    throw new Error(`Unsupported metadata version: ${version}. Supported versions: ${Object.keys(METADATA_PARSERS).join(', ')}`);
  }
  
  try {
    return parser(data);
  } catch (error) {
    throw new Error(`Failed to parse metadata version ${version}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Loads metadata for a specific book and version from GitHub release assets.
 * 
 * This function looks for the metadata file in the GitHub release assets.
 * There should be exactly one file that ends with '-metadata.json' in each release.
 * 
 * @param bookSlug - The book slug (e.g., 'the-federalist-papers')
 * @param release - The GitHub release object containing assets
 * @returns Parsed metadata or null if not found
 */
export async function loadBookMetadataFromRelease(bookSlug: string, release: GithubRelease): Promise<BookMetadata | null> {
  try {
    // Look for metadata file in release assets - there should be exactly one
    const metadataAsset = release.assets.find(asset => 
      asset.name.endsWith('-metadata.json')
    );
    
    if (!metadataAsset) {
      return null; // No metadata file found in this release
    }
    
    // Fetch the metadata file from the release asset
    const response = await fetch(metadataAsset.browser_download_url);
    
    if (!response.ok) {
      console.error(`Failed to fetch metadata from ${metadataAsset.browser_download_url}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const metadataContent = await response.text();
    return parseMetadata(metadataContent);
    
  } catch (error) {
    console.error(`Error loading metadata for ${bookSlug} from release:`, error);
    return null;
  }
}

/**
 * Loads metadata for a specific book and version.
 * This function is kept for backward compatibility but now delegates to the release-based loading.
 * 
 * @param bookSlug - The book slug
 * @param version - The version string (optional, for version-specific pages)
 * @returns Parsed metadata or null if not found
 */
export async function loadBookMetadata(bookSlug: string, version?: string): Promise<BookMetadata | null> {
  // This function is deprecated - use loadBookMetadataFromRelease instead
  // Keeping it for backward compatibility but it will always return null
  console.warn('loadBookMetadata is deprecated. Use loadBookMetadataFromRelease with a GitHub release object instead.');
  return null;
}

export type { BookMetadata, ProcessingPhase, Model }; 