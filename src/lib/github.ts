import { z } from 'astro/zod';
import { logger } from './logger';
import { getEnvVar, isDev } from './env';

const GITHUB_TOKEN = getEnvVar('GITHUB_TOKEN');
const REPO_OWNER = getEnvVar('GITHUB_REPO_OWNER', 'bgreenawald');
const REPO_NAME = getEnvVar('GITHUB_REPO_NAME', 'llm-book-updater');

// Validate GitHub token configuration
if (!GITHUB_TOKEN || GITHUB_TOKEN.trim() === '') {
  logger.error('❌ GITHUB_TOKEN environment variable is missing or empty.');
  logger.error('   Please set GITHUB_TOKEN in your environment variables.');
  logger.error('   This is required for GitHub API access to avoid rate limiting.');
  logger.error('   You can create a token at: https://github.com/settings/tokens');

  // In development, we can continue but warn about potential issues
  if (isDev()) {
    logger.warn(
      '⚠️  Running in development mode without GitHub token - API calls may be rate limited.'
    );
  } else {
    // In production, we'll log a critical error but not throw to prevent complete site failure
    // The individual API functions will handle failures gracefully
    logger.error('🚨 CRITICAL: GITHUB_TOKEN environment variable is missing in production.');
    logger.error(
      '   Site will continue to function but GitHub integration features will be unavailable.'
    );
  }
}

const tagSchema = z.object({
  name: z.string(),
  commit: z.object({
    sha: z.string(),
    url: z.string(),
  }),
});

const releaseSchema = z.object({
  assets: z.array(z.object({ name: z.string(), browser_download_url: z.string() })),
  tag_name: z.string(),
});

export type GithubTag = z.infer<typeof tagSchema>;
export type GithubRelease = z.infer<typeof releaseSchema>;

async function fetchFromGithub<T>(url: string, schema: z.ZodSchema<T>): Promise<T | null> {
  const headers: Record<string, string> = {};

  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 403) {
        logger.error(`GitHub API rate limit exceeded. Consider adding GITHUB_TOKEN.`);
      } else {
        logger.error(`Failed to fetch from ${url}: ${response.statusText}`);
      }
      return null;
    }
    const data = await response.json();
    return schema.parse(data);
  } catch (error) {
    logger.error(`Error fetching or parsing from ${url}:`, error);
    return null;
  }
}

/**
 * Parses the GitHub API Link header to extract the next page URL
 *
 * @param linkHeader - The Link header value from the response
 * @returns The next page URL if found, null otherwise
 */
function parseNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) {
    return null;
  }

  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export async function fetchTags(): Promise<GithubTag[]> {
  try {
    const allTags: GithubTag[] = [];
    let url: string | null =
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/tags?per_page=100`;
    const headers: Record<string, string> = {};

    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    // Fetch all pages of tags
    while (url) {
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          if (response.status === 403) {
            logger.error(`GitHub API rate limit exceeded. Consider adding GITHUB_TOKEN.`);
          } else {
            logger.error(`Failed to fetch tags from ${url}: ${response.statusText}`);
          }
          break;
        }

        const data = await response.json();
        const tags = z.array(tagSchema).parse(data);
        allTags.push(...tags);

        // Check for next page
        const linkHeader = response.headers.get('Link');
        url = parseNextPageUrl(linkHeader);
      } catch (error) {
        logger.error(`Error fetching tags from ${url}:`, error);
        break;
      }
    }

    return allTags;
  } catch (error) {
    logger.error('Failed to fetch tags from GitHub API:', error);
    return []; // Return empty array as fallback
  }
}

export async function fetchRelease(tagName: string): Promise<GithubRelease | null> {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tagName}`;
    return await fetchFromGithub(url, releaseSchema);
  } catch (error) {
    logger.error(`Failed to fetch release for tag ${tagName}:`, error);
    return null; // Return null as fallback
  }
}

export async function fetchRawFile(commitSha: string, filePath: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${commitSha}`;

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3.raw',
    };

    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 403) {
        logger.error(`GitHub API rate limit exceeded. Consider adding GITHUB_TOKEN.`);
      } else {
        logger.error(`Failed to fetch raw file from ${url}: ${response.statusText}`);
      }
      return null;
    }
    return await response.text();
  } catch (error) {
    logger.error(`Error fetching raw file from ${url}:`, error);
    return null;
  }
}
