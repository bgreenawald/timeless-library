import { z } from 'astro/zod';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const REPO_OWNER = import.meta.env.GITHUB_REPO_OWNER || 'bgreenawald';
const REPO_NAME = import.meta.env.GITHUB_REPO_NAME || 'llm-book-updater';

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
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`Failed to fetch from ${url}: ${response.statusText}`);
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
  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${commitSha}/${filePath}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch raw file from ${url}: ${response.statusText}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching raw file from ${url}:`, error);
    return null;
  }
}