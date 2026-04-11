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
  additions: number;
  removals: number;
}

async function fetchAssetText(asset: { name: string; browser_download_url: string }) {
  try {
    const response = await fetch(asset.browser_download_url);
    if (!response.ok) {
      logger.error(`Asset fetch failed`, {
        asset: asset.name,
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }
    return await response.text();
  } catch (error) {
    logger.error(`Asset fetch errored`, {
      asset: asset.name,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
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
  _version: GithubTag,
  _bookSlug: string,
  release: GithubRelease
): Promise<{
  originalText: string | null;
  modernizedText: string | null;
}> {
  const originalAsset = release.assets.find(asset => asset.name.endsWith('-original.md'));
  const modernizedAsset = release.assets.find(asset => asset.name.endsWith('-modernized.md'));

  if (!originalAsset || !modernizedAsset) {
    return { originalText: null, modernizedText: null };
  }

  const [originalText, modernizedText] = await Promise.all([
    fetchAssetText(originalAsset),
    fetchAssetText(modernizedAsset),
  ]);

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
  const diff = createPatch('original.md', originalText, modernizedText, 'original', 'modernized', {
    context: 3,
  });

  // Unified diff file headers are `+++ path` / `--- path` (marker + whitespace).
  // Content can begin with `++` or `--` after the +/- prefix, e.g. `+++hello` or
  // `---stuff`, which must not be treated as headers.
  const unifiedDiffPlusFileHeader = /^\+\+\+\s/;
  const unifiedDiffMinusFileHeader = /^---\s/;

  let additions = 0;
  let removals = 0;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+') && !unifiedDiffPlusFileHeader.test(line)) {
      additions++;
    } else if (line.startsWith('-') && !unifiedDiffMinusFileHeader.test(line)) {
      removals++;
    }
  }

  const changeCount = additions + removals;

  return {
    originalText,
    modernizedText,
    diff,
    hasChanges: changeCount > 0,
    changeCount,
    additions,
    removals,
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
