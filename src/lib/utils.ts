/**
 * Extracts the version part from a full version tag.
 *
 * Version tags have the format 'BOOK-SLUG--version.number' (e.g., 'the-federalist-papers--v0.0-alpha').
 * This function removes the book slug and returns just the version part.
 *
 * @param fullVersionTag - The complete version tag including book slug
 * @returns The version part without the book slug, or the original string if no delimiter is found
 */
export function extractVersionFromTag(fullVersionTag: string): string {
  const delimiter = '--';
  const delimiterIndex = fullVersionTag.indexOf(delimiter);

  if (delimiterIndex === -1) {
    // No delimiter found, return the original string
    return fullVersionTag;
  }

  // Return everything after the delimiter
  return fullVersionTag.substring(delimiterIndex + delimiter.length);
}
