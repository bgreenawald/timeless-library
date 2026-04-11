import { getCollection, type CollectionEntry } from 'astro:content';
import { fetchTags, fetchRelease, type GithubTag, type GithubRelease } from './github';
import { logger } from './logger';
import { isDevMode } from './runtime-env';

/**
 * Module-level cache for GitHub tags to avoid redundant API calls
 * This cache persists across multiple calls to getBookVersions() during static path generation
 */
let cachedTags: GithubTag[] | null = null;
let tagsFetchPromise: Promise<GithubTag[]> | null = null;

/**
 * Gets cached tags, fetching them once if not already cached
 * This ensures fetchTags() is only called once per build, even when
 * generateBookPaths(), generateVersionPaths(), and generateDiffPaths()
 * all call getBookVersions() for each book
 */
async function getCachedTags(): Promise<GithubTag[]> {
  // If tags are already cached, return them immediately
  if (cachedTags !== null) {
    return cachedTags;
  }

  // If a fetch is already in progress, wait for it instead of starting a new one
  if (tagsFetchPromise !== null) {
    return tagsFetchPromise;
  }

  // Start fetching tags and cache the promise
  tagsFetchPromise = fetchTags()
    .then(tags => {
      cachedTags = tags;
      tagsFetchPromise = null; // Clear the promise after completion
      return tags;
    })
    .catch(error => {
      logger.error('Failed to fetch tags for caching:', error);
      tagsFetchPromise = null; // Clear the promise on error
      return []; // Return empty array as fallback
    });

  return tagsFetchPromise;
}

/**
 * Clears the cached tags (primarily for testing purposes)
 * @internal
 */
export function clearTagsCache(): void {
  cachedTags = null;
  tagsFetchPromise = null;
}

const releaseCache = new Map<string, Promise<GithubRelease | null>>();

/**
 * Clears cached release fetches (primarily for testing purposes)
 * @internal
 */
export function clearReleaseCache(): void {
  releaseCache.clear();
}

/**
 * Filters versions to exclude alpha and beta tags in non-development environments
 */
function filterVersions(versions: GithubTag[]): GithubTag[] {
  if (!isDevMode()) {
    return versions.filter(
      tag => !tag.name.toLowerCase().includes('alpha') && !tag.name.toLowerCase().includes('beta')
    );
  }
  return versions;
}

/**
 * Gets all versions for a book, filtered appropriately for the environment
 * Uses cached tags to avoid redundant API calls
 */
export async function getBookVersions(bookSlug: string): Promise<GithubTag[]> {
  try {
    const tags = await getCachedTags();
    // Use double delimiter (--) to ensure exact slug matching
    // This prevents prefix matching issues (e.g., "war" matching "war-and-peace")
    const versions = tags.filter(tag => tag.name.startsWith(`${bookSlug}--`));
    return filterVersions(versions);
  } catch (error) {
    logger.error(`Failed to fetch versions for book ${bookSlug}:`, error);
    return []; // Return empty array as fallback
  }
}

/**
 * Parses the semver-like segment after `bookSlug--` for ordering (pre-releases sort before release).
 */
function parseVersionSegment(tagName: string): { nums: number[]; pre: string } {
  const afterBook = tagName.includes('--') ? tagName.split('--').slice(1).join('--') : tagName;
  const stripped = afterBook.replace(/^v/i, '');
  const hyphenIdx = stripped.indexOf('-');
  const core = hyphenIdx === -1 ? stripped : stripped.slice(0, hyphenIdx);
  const pre = hyphenIdx === -1 ? '' : stripped.slice(hyphenIdx + 1);
  const nums = core.split('.').map(n => parseInt(n, 10) || 0);
  return { nums, pre };
}

function compareVersionTags(a: string, b: string): number {
  const pa = parseVersionSegment(a);
  const pb = parseVersionSegment(b);
  const len = Math.max(pa.nums.length, pb.nums.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa.nums[i] ?? 0) - (pb.nums[i] ?? 0);
    if (diff !== 0) return diff;
  }
  if (pa.pre === '' && pb.pre !== '') return 1;
  if (pa.pre !== '' && pb.pre === '') return -1;
  return pa.pre.localeCompare(pb.pre);
}

/**
 * Finds the latest version from a list of version tags
 */
export function findLatestVersion(versions: GithubTag[]): string | null {
  if (versions.length === 0) return null;

  const sortedVersions = [...versions.map(tag => tag.name)].sort(compareVersionTags);

  return sortedVersions[sortedVersions.length - 1];
}

/**
 * Gets the release for a specific version (cached per version name for the build)
 */
export async function getReleaseForVersion(versionName: string): Promise<GithubRelease | null> {
  const cached = releaseCache.get(versionName);
  if (cached) return cached;

  const promise = fetchRelease(versionName);
  releaseCache.set(versionName, promise);
  return promise;
}

/**
 * Generates static paths for book detail pages
 */
export async function generateBookPaths() {
  try {
    const books = await getCollection('books');

    const paths = await Promise.all(
      books.map(async (book: CollectionEntry<'books'>) => {
        try {
          const versions = await getBookVersions(book.slug);
          const latestVersion = findLatestVersion(versions);
          const latestRelease = latestVersion ? await getReleaseForVersion(latestVersion) : null;

          return {
            params: { book: book.slug },
            props: {
              book,
              versions,
              hasVersions: versions.length > 0,
              latestVersion,
              latestRelease,
            },
          };
        } catch (error) {
          logger.error(`Failed to generate path for book ${book.slug}:`, error);
          // Return basic path without version data as fallback
          return {
            params: { book: book.slug },
            props: {
              book,
              versions: [],
              hasVersions: false,
              latestVersion: null,
              latestRelease: null,
            },
          };
        }
      })
    );

    return paths;
  } catch (error) {
    logger.error('Failed to generate book paths:', error);
    return []; // Return empty array as fallback
  }
}

/**
 * Generates static paths for book version pages
 */
export async function generateVersionPaths() {
  try {
    const books = await getCollection('books');

    const paths = await Promise.all(
      books.map(async (book: CollectionEntry<'books'>) => {
        try {
          const versions = await getBookVersions(book.slug);

          // Generate paths for each version
          const versionPaths = await Promise.all(
            versions.map(async version => {
              try {
                const release = await getReleaseForVersion(version.name);

                if (!release) {
                  return null;
                }

                return {
                  params: { book: book.slug, version: version.name },
                  props: {
                    book,
                    release,
                    version: version.name,
                  },
                };
              } catch (error) {
                logger.error(
                  `Failed to generate version path for ${book.slug}/${version.name}:`,
                  error
                );
                return null;
              }
            })
          );

          return versionPaths.filter(path => path !== null);
        } catch (error) {
          logger.error(`Failed to generate version paths for book ${book.slug}:`, error);
          return [];
        }
      })
    );

    // Flatten the array of arrays
    return paths.flat();
  } catch (error) {
    logger.error('Failed to generate version paths:', error);
    return [];
  }
}

/**
 * Generates static paths for diff pages
 */
export async function generateDiffPaths() {
  try {
    const books = await getCollection('books');

    const paths = await Promise.all(
      books.map(async (book: CollectionEntry<'books'>) => {
        try {
          const versions = await getBookVersions(book.slug);

          // Generate paths for each version that has modernized content
          const diffPaths = await Promise.all(
            versions.map(async version => {
              try {
                const release = await getReleaseForVersion(version.name);

                if (!release) {
                  return null;
                }

                // Check if this version has modernized content
                const hasModernized = release.assets.some(asset =>
                  asset.name.endsWith('-modernized.md')
                );

                if (!hasModernized) {
                  return null;
                }

                return {
                  params: { book: book.slug, version: version.name },
                  props: {
                    book,
                    release,
                    version: version.name,
                    versionTag: version,
                  },
                };
              } catch (error) {
                logger.error(
                  `Failed to generate diff path for ${book.slug}/${version.name}:`,
                  error
                );
                return null;
              }
            })
          );

          return diffPaths.filter(path => path !== null);
        } catch (error) {
          logger.error(`Failed to generate diff paths for book ${book.slug}:`, error);
          return [];
        }
      })
    );

    // Flatten the array of arrays
    return paths.flat();
  } catch (error) {
    logger.error('Failed to generate diff paths:', error);
    return [];
  }
}
