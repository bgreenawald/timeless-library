import { getMiniCoverUrl } from '../coverUtils';

describe('coverUtils', () => {
  describe('getMiniCoverUrl', () => {
    it('should return empty string for undefined input', () => {
      const result = getMiniCoverUrl(undefined);
      expect(result).toBe('');
    });

    it('should return empty string for empty string input', () => {
      const result = getMiniCoverUrl('');
      expect(result).toBe('');
    });

    it('should convert valid path ending in cover.webp to mini-cover.webp', () => {
      const result = getMiniCoverUrl('/covers/book-name/cover.webp');
      expect(result).toBe('/covers/book-name/mini-cover.webp');
    });

    it('should handle case-insensitive conversion (COVER.WEBP)', () => {
      const result = getMiniCoverUrl('/covers/book-name/COVER.WEBP');
      expect(result).toBe('/covers/book-name/mini-cover.webp');
    });

    it('should handle case-insensitive conversion (Cover.Webp)', () => {
      const result = getMiniCoverUrl('/covers/book-name/Cover.Webp');
      expect(result).toBe('/covers/book-name/mini-cover.webp');
    });

    it('should handle case-insensitive conversion (cOvEr.WeBp)', () => {
      const result = getMiniCoverUrl('/covers/book-name/cOvEr.WeBp');
      expect(result).toBe('/covers/book-name/mini-cover.webp');
    });

    it('should return original path if it does not end with cover.webp', () => {
      const result = getMiniCoverUrl('/covers/book-name/image.jpg');
      expect(result).toBe('/covers/book-name/image.jpg');
    });

    it('should return original path if cover.webp appears but not at the end', () => {
      const result = getMiniCoverUrl('/covers/cover.webp/other-image.png');
      expect(result).toBe('/covers/cover.webp/other-image.png');
    });

    it('should return original path for paths without cover.webp', () => {
      const result = getMiniCoverUrl('/covers/book-name/thumbnail.png');
      expect(result).toBe('/covers/book-name/thumbnail.png');
    });

    it('should handle paths with cover.webp in the middle', () => {
      const result = getMiniCoverUrl('/covers/book-name/cover.webp.backup');
      expect(result).toBe('/covers/book-name/cover.webp.backup');
    });
  });
});
