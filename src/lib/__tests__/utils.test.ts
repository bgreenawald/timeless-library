import { extractVersionFromTag } from '../utils';

describe('utils', () => {
  describe('extractVersionFromTag', () => {
    it('should extract version from full version tag', () => {
      const result = extractVersionFromTag('the-federalist-papers--v1.0.0');
      expect(result).toBe('v1.0.0');
    });

    it('should extract complex version from tag', () => {
      const result = extractVersionFromTag('book-slug--v0.0-alpha');
      expect(result).toBe('v0.0-alpha');
    });

    it('should return original string if no delimiter found', () => {
      const result = extractVersionFromTag('no-delimiter-here');
      expect(result).toBe('no-delimiter-here');
    });

    it('should handle empty string', () => {
      const result = extractVersionFromTag('');
      expect(result).toBe('');
    });

    it('should handle tag with multiple delimiters', () => {
      const result = extractVersionFromTag('book--with--multiple--delimiters--v1.0');
      expect(result).toBe('with--multiple--delimiters--v1.0');
    });
  });
});
