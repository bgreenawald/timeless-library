import { createPatch } from 'diff';
import { fetchRawFile } from './github';
import type { GithubTag, GithubRelease } from './github';

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
export async function fetchVersionTexts(version: GithubTag, bookSlug: string, release: GithubRelease): Promise<{
  originalText: string | null;
  modernizedText: string | null;
}> {
  // Find the original and modernized files by their endings
  const originalAsset = release.assets.find(asset => asset.name.endsWith('-original.md'));
  const modernizedAsset = release.assets.find(asset => asset.name.endsWith('-modernized.md'));
  
  // Debug logging
  console.log('Diff Debug - Available assets:');
  release.assets.forEach(asset => {
    console.log(`  - ${asset.name}`);
  });
  console.log('Diff Debug - Found assets:');
  console.log(`  Original: ${originalAsset?.name || 'NOT FOUND'}`);
  console.log(`  Modernized: ${modernizedAsset?.name || 'NOT FOUND'}`);
  
  if (!originalAsset || !modernizedAsset) {
    console.log('Diff Debug - Missing assets, returning null');
    return { originalText: null, modernizedText: null };
  }
  
  console.log('Diff Debug - Downloading files:');
  console.log(`  Original URL: ${originalAsset.browser_download_url}`);
  console.log(`  Modernized URL: ${modernizedAsset.browser_download_url}`);
  
  // Download the files directly from the release assets
  const [originalText, modernizedText] = await Promise.all([
    fetch(originalAsset.browser_download_url).then(response => response.ok ? response.text() : null),
    fetch(modernizedAsset.browser_download_url).then(response => response.ok ? response.text() : null)
  ]);
  
  console.log('Diff Debug - Download results:');
  console.log(`  Original text length: ${originalText?.length || 0}`);
  console.log(`  Modernized text length: ${modernizedText?.length || 0}`);
  
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
  const diff = createPatch(
    'original.md',
    originalText,
    modernizedText,
    'original',
    'modernized',
    { context: 3 }
  );
  
  // Count changes (lines starting with + or -)
  const changeCount = diff.split('\n').filter(line => 
    line.startsWith('+') || line.startsWith('-')
  ).length;
  
  return {
    originalText,
    modernizedText,
    diff,
    hasChanges: changeCount > 0,
    changeCount
  };
}

/**
 * Formats diff output for HTML display with syntax highlighting and a table layout.
 * 
 * @param diffText - The raw diff text
 * @returns HTML-formatted diff with appropriate classes
 */
export function formatDiffForHtml(diffText: string): string {
  // Split diff into lines and process for table layout
  const lines = diffText.split('\n');
  let oldLine = 0;
  let newLine = 0;
  let html = '<table class="diff-table"><tbody>';

  for (const line of lines) {
    let type = 'context';
    let displayLine = line;
    let oldLineNum = '';
    let newLineNum = '';
    if (line.startsWith('@@')) {
      type = 'hunk';
      // Parse hunk header for line numbers
      const match = /@@ -(\d+),?\d* \+(\d+),?\d* @@/.exec(line);
      if (match) {
        oldLine = parseInt(match[1], 10) - 1;
        newLine = parseInt(match[2], 10) - 1;
      }
      html += `<tr class="diff-hunk"><td colspan="4">${escapeHtml(line)}</td></tr>`;
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
    } else if (line.startsWith('---') || line.startsWith('+++')) {
      type = 'header';
      html += `<tr class="diff-header"><td colspan="4">${escapeHtml(line)}</td></tr>`;
      continue;
    } else {
      type = 'context';
      oldLine++;
      newLine++;
      oldLineNum = oldLine.toString();
      newLineNum = newLine.toString();
      displayLine = line.startsWith(' ') ? line.slice(1) : line;
    }
    html += `<tr class="diff-line diff-${type}">
      <td class="diff-gutter old">${oldLineNum}</td>
      <td class="diff-gutter new">${newLineNum}</td>
      <td class="diff-bar ${type}"></td>
      <td class="diff-content">${escapeHtml(displayLine)}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  return html;
}

/**
 * Escapes HTML special characters to prevent XSS.
 * 
 * @param text - The text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
      const match = /@@ -(\d+),?\d* \+(\d+),?\d* @@/.exec(line);
      if (match) {
        oldLine = parseInt(match[1], 10) - 1;
        newLine = parseInt(match[2], 10) - 1;
      }
      result.push({
        type,
        oldLineNum: '',
        newLineNum: '',
        content: line,
        isHunk: true
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
    } else if (line.startsWith('---') || line.startsWith('+++')) {
      type = 'header';
      isHeader = true;
      result.push({
        type,
        oldLineNum: '',
        newLineNum: '',
        content: line,
        isHeader: true
      });
      continue;
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
      content: displayLine
    });
  }

  return result;
} 