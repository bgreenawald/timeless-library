import { createPatch } from 'diff';
import type { GithubTag, GithubRelease } from './github';
import { logger } from './logger';

/**
 * Interface representing a diff result with metadata.
 */
export interface DiffResult {
  originalText: string;
  modernizedText: string;
  diff: string;
  hasChanges: boolean;
  changeCount: number;
}

/**
 * Fetches the original and modernized text files for a given version.
 *
 * @param version - The version tag containing the commit SHA
 * @param bookSlug - The book slug to construct file paths
 * @param release - The GitHub release containing asset information
 * @returns Promise resolving to the original and modernized text content
 */
export async function fetchVersionTexts(
  version: GithubTag,
  bookSlug: string,
  release: GithubRelease
): Promise<{
  originalText: string | null;
  modernizedText: string | null;
}> {
  // Find the original and modernized files by their endings
  const originalAsset = release.assets.find(asset => asset.name.endsWith('-original.md'));
  const modernizedAsset = release.assets.find(asset => asset.name.endsWith('-modernized.md'));

  // Debug logging
  logger.debug('Diff Debug - Available assets:');
  release.assets.forEach(asset => {
    logger.debug(`  - ${asset.name}`);
  });
  logger.debug('Diff Debug - Found assets:');
  logger.debug(`  Original: ${originalAsset?.name || 'NOT FOUND'}`);
  logger.debug(`  Modernized: ${modernizedAsset?.name || 'NOT FOUND'}`);

  if (!originalAsset || !modernizedAsset) {
    logger.debug('Diff Debug - Missing assets, returning null');
    return { originalText: null, modernizedText: null };
  }

  logger.debug('Diff Debug - Downloading files:');
  logger.debug(`  Original URL: ${originalAsset.browser_download_url}`);
  logger.debug(`  Modernized URL: ${modernizedAsset.browser_download_url}`);

  // Download the files directly from the release assets with proper error handling
  const [originalText, modernizedText] = await Promise.all([
    fetch(originalAsset.browser_download_url)
      .then(async response => {
        if (!response.ok) {
          logger.error(`Diff Debug - Original file fetch failed:`, {
            url: originalAsset.browser_download_url,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          });
          return null;
        }
        try {
          const text = await response.text();
          logger.debug(
            `Diff Debug - Original file downloaded successfully, length: ${text.length}`
          );
          return text;
        } catch (error) {
          logger.error(`Diff Debug - Original file text parsing failed:`, {
            url: originalAsset.browser_download_url,
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        }
      })
      .catch(error => {
        logger.error(`Diff Debug - Original file network error:`, {
          url: originalAsset.browser_download_url,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }),
    fetch(modernizedAsset.browser_download_url)
      .then(async response => {
        if (!response.ok) {
          logger.error(`Diff Debug - Modernized file fetch failed:`, {
            url: modernizedAsset.browser_download_url,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          });
          return null;
        }
        try {
          const text = await response.text();
          logger.debug(
            `Diff Debug - Modernized file downloaded successfully, length: ${text.length}`
          );
          return text;
        } catch (error) {
          logger.error(`Diff Debug - Modernized file text parsing failed:`, {
            url: modernizedAsset.browser_download_url,
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        }
      })
      .catch(error => {
        logger.error(`Diff Debug - Modernized file network error:`, {
          url: modernizedAsset.browser_download_url,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }),
  ]);

  logger.debug('Diff Debug - Download results:');
  logger.debug(`  Original text length: ${originalText?.length || 0}`);
  logger.debug(`  Modernized text length: ${modernizedText?.length || 0}`);

  return { originalText, modernizedText };
}

/**
 * Generates a diff between original and modernized text.
 *
 * @param originalText - The original text content
 * @param modernizedText - The modernized text content
 * @returns DiffResult object containing the diff and metadata
 */
export function generateDiff(originalText: string, modernizedText: string): DiffResult {
  // Generate unified diff format
  const diff = createPatch('original.md', originalText, modernizedText, 'original', 'modernized', {
    context: 3,
  });

  // Count changes (lines starting with + or -), excluding diff headers
  const changeCount = diff
    .split('\n')
    .filter(
      line =>
        (line.startsWith('+') && !line.startsWith('+++')) ||
        (line.startsWith('-') && !line.startsWith('---'))
    ).length;

  return {
    originalText,
    modernizedText,
    diff,
    hasChanges: changeCount > 0,
    changeCount,
  };
}

/**
 * Parses a hunk header line to extract old and new line numbers.
 *
 * @param line - The hunk header line starting with @@
 * @returns Object with oldLine and newLine numbers, or null if no match
 */
function parseHunkHeader(line: string): { oldLine: number; newLine: number } | null {
  const match = /@@ -(\d+),?\d* \+(\d+),?\d* @@/.exec(line);
  if (match) {
    return {
      oldLine: parseInt(match[1], 10) - 1,
      newLine: parseInt(match[2], 10) - 1,
    };
  }
  return null;
}

/**
 * Parses diff text into structured data for template rendering.
 *
 * @param diffText - The raw diff text
 * @returns Array of diff line objects
 */
export function parseDiffToLines(diffText: string): Array<{
  type: 'added' | 'removed' | 'context' | 'hunk' | 'header';
  oldLineNum: string;
  newLineNum: string;
  content: string;
  isHunk?: boolean;
  isHeader?: boolean;
}> {
  const lines = diffText.split('\n');
  let oldLine = 0;
  let newLine = 0;
  const result = [];

  for (const line of lines) {
    let type: 'added' | 'removed' | 'context' | 'hunk' | 'header' = 'context';
    let displayLine = line;
    let oldLineNum = '';
    let newLineNum = '';
    let isHunk = false;
    let isHeader = false;

    if (line.startsWith('@@')) {
      type = 'hunk';
      isHunk = true;
      // Parse hunk header for line numbers
      const hunkInfo = parseHunkHeader(line);
      if (hunkInfo) {
        oldLine = hunkInfo.oldLine;
        newLine = hunkInfo.newLine;
      }
      result.push({
        type,
        oldLineNum: '',
        newLineNum: '',
        content: line,
        isHunk: true,
      });
      continue;
    } else if (line.startsWith('---') || line.startsWith('+++')) {
      type = 'header';
      result.push({
        type,
        oldLineNum: '',
        newLineNum: '',
        content: line,
        isHeader: true,
      });
      continue;
    } else if (line.startsWith('+')) {
      type = 'added';
      newLine++;
      newLineNum = newLine.toString();
      oldLineNum = '';
      displayLine = line.slice(1);
    } else if (line.startsWith('-')) {
      type = 'removed';
      oldLine++;
      oldLineNum = oldLine.toString();
      newLineNum = '';
      displayLine = line.slice(1);
    } else {
      type = 'context';
      oldLine++;
      newLine++;
      oldLineNum = oldLine.toString();
      newLineNum = newLine.toString();
      displayLine = line.startsWith(' ') ? line.slice(1) : line;
    }

    result.push({
      type,
      oldLineNum,
      newLineNum,
      content: displayLine,
    });
  }

  return result;
}
