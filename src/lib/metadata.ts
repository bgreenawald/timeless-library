import type { z } from 'astro/zod';
import type { GithubRelease } from './github';
import { logger } from './logger';

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
  phases: ProcessingPhase[];
  book_version: string;
}

/**
 * Validates a processing phase object against the expected structure.
 *
 * @param phase - The phase object to validate
 * @param phaseIndex - The index of the phase for error reporting
 * @throws Error if the phase structure is invalid
 */
function validateProcessingPhase(phase: any, phaseIndex: number): void {
  if (!phase || typeof phase !== 'object') {
    throw new Error(`Phase ${phaseIndex}: must be an object`);
  }

  const requiredStringFields = [
    'phase_name',
    'phase_type',
    'book_name',
    'author_name',
    'model_type',
    'input_file',
    'output_file',
    'system_prompt_path',
    'user_prompt_path',
    'fully_rendered_system_prompt',
  ];

  const requiredNumberFields = ['phase_index', 'post_processor_count', 'max_workers'];

  const requiredBooleanFields = ['enabled', 'completed', 'output_exists'];

  const requiredArrayFields = ['post_processors'];

  // Validate string fields
  for (const field of requiredStringFields) {
    if (!phase[field] || typeof phase[field] !== 'string') {
      throw new Error(`Phase ${phaseIndex}: missing or invalid string field '${field}'`);
    }
  }

  // Validate number fields
  for (const field of requiredNumberFields) {
    if (typeof phase[field] !== 'number' || isNaN(phase[field])) {
      throw new Error(`Phase ${phaseIndex}: missing or invalid number field '${field}'`);
    }
  }

  // Validate boolean fields
  for (const field of requiredBooleanFields) {
    if (typeof phase[field] !== 'boolean') {
      throw new Error(`Phase ${phaseIndex}: missing or invalid boolean field '${field}'`);
    }
  }

  // Validate array fields
  for (const field of requiredArrayFields) {
    if (!Array.isArray(phase[field])) {
      throw new Error(`Phase ${phaseIndex}: missing or invalid array field '${field}'`);
    }
  }

  // Validate post_processors array contains only strings
  if (!phase.post_processors.every((item: any) => typeof item === 'string')) {
    throw new Error(`Phase ${phaseIndex}: 'post_processors' array must contain only strings`);
  }

  // Validate model object
  if (!phase.model || typeof phase.model !== 'object') {
    throw new Error(`Phase ${phaseIndex}: missing or invalid 'model' object`);
  }

  if (!phase.model.id || typeof phase.model.id !== 'string') {
    throw new Error(`Phase ${phaseIndex}: model missing or invalid 'id' field`);
  }

  if (!phase.model.name || typeof phase.model.name !== 'string') {
    throw new Error(`Phase ${phaseIndex}: model missing or invalid 'name' field`);
  }

  // Validate phase_index matches the array index
  if (phase.phase_index !== phaseIndex) {
    throw new Error(
      `Phase ${phaseIndex}: 'phase_index' (${phase.phase_index}) does not match array index (${phaseIndex})`
    );
  }
}

/**
 * Validates the complete metadata structure for version 0.0.0-alpha.
 *
 * @param data - The metadata object to validate
 * @throws Error if the metadata structure is invalid
 */
function validateMetadataV0_0(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Metadata must be an object');
  }

  // Validate required top-level string fields
  const requiredStringFields = [
    'metadata_version',
    'run_timestamp',
    'book_name',
    'author_name',
    'input_file',
    'original_file',
    'output_directory',
    'book_version',
  ];

  for (const field of requiredStringFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      throw new Error(`Missing or invalid string field '${field}'`);
    }
  }

  if (!data.phases || !Array.isArray(data.phases)) {
    throw new Error("Missing or invalid array field 'phases'");
  }

  // Validate phases array is not empty
  if (data.phases.length === 0) {
    throw new Error("'phases' array cannot be empty");
  }

  // Validate each phase object
  data.phases.forEach((phase: any, index: number) => {
    validateProcessingPhase(phase, index);
  });
}

/**
 * Supported metadata versions and their parsing functions.
 */
const METADATA_PARSERS: Record<string, (data: any) => BookMetadata> = {
  '0.0': (data: any): BookMetadata => {
    // Validate the complete metadata structure
    validateMetadataV0_0(data);

    return data as BookMetadata;
  },
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
    throw new Error(
      `Failed to parse metadata JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  const version = data.metadata_version;

  if (!version) {
    throw new Error('Metadata file missing version information');
  }

  const parser = METADATA_PARSERS[version];

  if (!parser) {
    throw new Error(
      `Unsupported metadata version: ${version}. Supported versions: ${Object.keys(METADATA_PARSERS).join(', ')}`
    );
  }

  try {
    return parser(data);
  } catch (error) {
    throw new Error(
      `Failed to parse metadata version ${version}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
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
export async function loadBookMetadataFromRelease(
  bookSlug: string,
  release: GithubRelease
): Promise<BookMetadata | null> {
  try {
    // Find all metadata files in release assets - there should be exactly one
    const metadataAssets = release.assets.filter(asset => asset.name.endsWith('-metadata.json'));

    if (metadataAssets.length === 0) {
      logger.warn(`No metadata file found for ${bookSlug} in release ${release.tag_name}`);
      return null; // No metadata file found in this release
    }

    if (metadataAssets.length > 1) {
      const assetNames = metadataAssets.map(asset => asset.name).join(', ');
      logger.error(
        `Multiple metadata files found for ${bookSlug} in release ${release.tag_name}: ${assetNames}`
      );
      throw new Error(
        `Multiple metadata files found in release ${release.tag_name}: ${assetNames}. Expected exactly one file ending with '-metadata.json'`
      );
    }

    // We now have exactly one metadata asset
    const metadataAsset = metadataAssets[0];

    // Fetch the metadata file from the release asset
    const response = await fetch(metadataAsset.browser_download_url);

    if (!response.ok) {
      logger.error(
        `Failed to fetch metadata from ${metadataAsset.browser_download_url}: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const metadataContent = await response.text();
    return parseMetadata(metadataContent);
  } catch (error) {
    logger.error(`Error loading metadata for ${bookSlug} from release:`, error);
    return null;
  }
}

export type { BookMetadata, ProcessingPhase, Model };
