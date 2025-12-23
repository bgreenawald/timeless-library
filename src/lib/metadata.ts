import { z } from 'astro/zod';
import type { GithubRelease } from './github';
import { logger } from './logger';

/**
 * Zod schema for a model used in a processing phase.
 */
const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * Zod schema for a processing phase in metadata v0.0.
 */
const ProcessingPhaseV0Schema = z.object({
  phase_name: z.string(),
  phase_index: z.number(),
  phase_type: z.string(),
  enabled: z.boolean(),
  post_processors: z.array(z.string()),
  post_processor_count: z.number(),
  completed: z.boolean(),
  book_name: z.string(),
  author_name: z.string(),
  model_type: z.string(),
  model: ModelSchema,
  max_workers: z.number(),
  input_file: z.string(),
  output_file: z.string(),
  system_prompt_path: z.string(),
  user_prompt_path: z.string(),
  fully_rendered_system_prompt: z.string(),
  output_exists: z.boolean(),
});

/**
 * Zod schema for a regular processing phase in metadata v1.0.
 */
const ProcessingPhaseV1RegularSchema = z.object({
  phase_name: z.string(),
  phase_index: z.number(),
  phase_type: z.string(),
  enabled: z.boolean(),
  post_processors: z.array(z.string()),
  post_processor_count: z.number(),
  completed: z.boolean(),
  book_id: z.string(),
  book_name: z.string(),
  author_name: z.string(),
  model_type: z.string(),
  model: ModelSchema,
  max_workers: z.number(),
  input_file: z.string(),
  output_file: z.string(),
  system_prompt_path: z.string().nullable(),
  user_prompt_path: z.string().nullable(),
  fully_rendered_system_prompt: z.string(),
  output_exists: z.boolean(),
});

/**
 * Zod schema for a two-stage final processing phase in metadata v1.0.
 */
const ProcessingPhaseV1TwoStageSchema = z.object({
  phase_name: z.string(),
  phase_index: z.number(),
  phase_type: z.literal('FINAL_TWO_STAGE'),
  enabled: z.boolean(),
  post_processors: z.array(z.string()),
  post_processor_count: z.number(),
  completed: z.boolean(),
  book_id: z.string(),
  book_name: z.string(),
  author_name: z.string(),
  identify_model_type: z.string(),
  identify_provider: z.string(),
  identify_provider_model_name: z.string(),
  identify_model: ModelSchema,
  implement_model_type: z.string(),
  implement_provider: z.string(),
  implement_provider_model_name: z.string(),
  implement_model: ModelSchema,
  max_workers: z.number(),
  input_file: z.string(),
  output_file: z.string(),
  system_prompt_path: z.string().nullable(),
  user_prompt_path: z.string().nullable(),
  fully_rendered_system_prompt: z.string(),
  output_exists: z.boolean(),
});

/**
 * Zod schema for a processing phase in metadata v1.0 (union of regular and two-stage).
 */
const ProcessingPhaseV1Schema = z.union([
  ProcessingPhaseV1TwoStageSchema,
  ProcessingPhaseV1RegularSchema,
]);

/**
 * Zod schema for metadata version 0.0 with custom validation.
 */
const BookMetadataV0Schema = z
  .object({
    metadata_version: z.literal('0.0'),
    run_timestamp: z.string(),
    book_name: z.string(),
    author_name: z.string(),
    input_file: z.string(),
    original_file: z.string(),
    output_directory: z.string(),
    phases: z.array(ProcessingPhaseV0Schema).min(1, "'phases' array cannot be empty"),
    book_version: z.string(),
  })
  .refine(data => data.phases.every((phase, index) => phase.phase_index === index), {
    message: "Phase 'phase_index' must match array index",
  });

/**
 * Zod schema for metadata version 1.0 with custom validation.
 */
const BookMetadataV1Schema = z
  .object({
    metadata_version: z.literal('1.0'),
    run_timestamp: z.string(),
    book_id: z.string(),
    book_name: z.string(),
    author_name: z.string(),
    input_file: z.string(),
    original_file: z.string(),
    output_directory: z.string(),
    phases: z.array(ProcessingPhaseV1Schema).min(1, "'phases' array cannot be empty"),
    book_version: z.string(),
  })
  .refine(data => data.phases.every((phase, index) => phase.phase_index === index), {
    message: "Phase 'phase_index' must match array index",
  });

/**
 * Type definitions derived from Zod schemas.
 */
export type Model = z.infer<typeof ModelSchema>;
export type ProcessingPhaseV0 = z.infer<typeof ProcessingPhaseV0Schema>;
export type ProcessingPhaseV1 = z.infer<typeof ProcessingPhaseV1Schema>;
export type ProcessingPhase = ProcessingPhaseV0 | ProcessingPhaseV1;
export type BookMetadataV0 = z.infer<typeof BookMetadataV0Schema>;
export type BookMetadataV1 = z.infer<typeof BookMetadataV1Schema>;
export type BookMetadata = BookMetadataV0 | BookMetadataV1;

/**
 * Supported metadata versions and their Zod schemas.
 */
const METADATA_SCHEMAS: Record<string, z.ZodSchema<any>> = {
  '0.0': BookMetadataV0Schema,
  '1.0': BookMetadataV1Schema,
};

/**
 * Parses a metadata file with version checking.
 *
 * @param metadataContent - The raw JSON content of the metadata file
 * @returns Parsed metadata object
 * @throws Error if the metadata version is not supported or the format is invalid
 */
export function parseMetadata(metadataContent: string): BookMetadata {
  let data: unknown;

  try {
    data = JSON.parse(metadataContent);
  } catch (error) {
    throw new Error(
      `Failed to parse metadata JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Extract version for schema lookup
  const versionResult = z.object({ metadata_version: z.string() }).safeParse(data);
  if (!versionResult.success) {
    throw new Error('Metadata file missing version information');
  }

  const version = versionResult.data.metadata_version;
  const schema = METADATA_SCHEMAS[version];

  if (!schema) {
    throw new Error(
      `Unsupported metadata version: ${version}. Supported versions: ${Object.keys(METADATA_SCHEMAS).join(', ')}`
    );
  }

  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new Error(`Failed to parse metadata version ${version}: ${issues}`);
    }
    throw error;
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
