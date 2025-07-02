import { z } from 'astro/zod';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const REPO_OWNER = import.meta.env.GITHUB_REPO_OWNER || 'bgreenawald';
const REPO_NAME = import.meta.env.GITHUB_REPO_NAME || 'llm-book-updater';

// Validate GitHub token configuration
if (!GITHUB_TOKEN || GITHUB_TOKEN.trim() === '') {
  console.error('❌ GITHUB_TOKEN environment variable is missing or empty.');
  console.error('   Please set GITHUB_TOKEN in your environment variables.');
  console.error('   This is required for GitHub API access to avoid rate limiting.');
  console.error('   You can create a token at: https://github.com/settings/tokens');
  
  // In development, we can continue but warn about potential issues
  if (import.meta.env.DEV) {
    console.warn('⚠️  Running in development mode without GitHub token - API calls may be rate limited.');
  } else {
    // In production, throw an error to prevent deployment with missing token
    throw new Error('GITHUB_TOKEN environment variable is required for production deployment');
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
        console.error(`GitHub API rate limit exceeded. Consider adding GITHUB_TOKEN.`);
      } else {
        console.error(`Failed to fetch from ${url}: ${response.statusText}`);
      }
      return null;
    }
    const data = await response.json();
    return schema.parse(data);
  } catch (error) {
    console.error(`Error fetching or parsing from ${url}:`, error);
    return null;
  }
}

export async function fetchTags(): Promise<GithubTag[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/tags`;
  const tags = await fetchFromGithub(url, z.array(tagSchema));
  return tags || [];
}

export async function fetchRelease(tagName: string): Promise<GithubRelease | null> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tagName}`;
  return fetchFromGithub(url, releaseSchema);
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
        console.error(`GitHub API rate limit exceeded. Consider adding GITHUB_TOKEN.`);
      } else {
        console.error(`Failed to fetch raw file from ${url}: ${response.statusText}`);
      }
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching raw file from ${url}:`, error);
    return null;
  }
}