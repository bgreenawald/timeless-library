import { getCollection, type CollectionEntry } from 'astro:content';
import { fetchTags, fetchRelease, type GithubTag, type GithubRelease } from './github';
import { logger } from './logger';
import { isDev, getEnvVar } from './env';

/**
 * Filters versions to exclude alpha and beta tags in non-development environments
 */
function filterVersions(versions: GithubTag[]): GithubTag[] {
  if (!isDev()) {
    return versions.filter(
      tag => !tag.name.toLowerCase().includes('alpha') && !tag.name.toLowerCase().includes('beta')
    );
  }
  return versions;
}

/**
 * Gets all versions for a book, filtered appropriately for the environment
 */
export async function getBookVersions(bookSlug: string): Promise<GithubTag[]> {
  try {
    const tags = await fetchTags();
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
 * Finds the latest version from a list of version tags
 */
export function findLatestVersion(versions: GithubTag[]): string | null {
  if (versions.length === 0) return null;

  const sortedVersions = versions
    .map(tag => tag.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return sortedVersions[sortedVersions.length - 1];
}

/**
 * Gets the release for a specific version
 */
export async function getReleaseForVersion(versionName: string): Promise<GithubRelease | null> {
  try {
    return await fetchRelease(versionName);
  } catch (error) {
    logger.error(`Failed to fetch release for ${versionName}:`, error);
    return null;
  }
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
