/**
 * Converts a cover image URL to its mini-cover equivalent.
 *
 * @param coverImage - The cover image path (e.g., '/covers/book-name/cover.webp')
 * @returns The mini-cover path if coverImage exists, otherwise an empty string
 */
export function getMiniCoverUrl(coverImage: string | undefined): string {
  if (!coverImage) {
    return '';
  }
  return coverImage.replace(/cover\.webp$/i, 'mini-cover.webp');
}
