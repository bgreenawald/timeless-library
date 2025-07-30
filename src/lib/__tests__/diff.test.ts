import { generateDiff, parseDiffToLines } from '../diff';

describe('diff', () => {
  describe('generateDiff', () => {
    it('should generate diff for different texts', () => {
      const originalText = 'Hello world\nThis is a test';
      const modernizedText = 'Hello world\nThis is a modern test';

      const result = generateDiff(originalText, modernizedText);

      expect(result.originalText).toBe(originalText);
      expect(result.modernizedText).toBe(modernizedText);
      expect(result.hasChanges).toBe(true);
      expect(result.changeCount).toBeGreaterThan(0);
      expect(result.diff).toContain('This is a test');
      expect(result.diff).toContain('This is a modern test');
    });

    it('should detect no changes for identical texts', () => {
      const text = 'Same text\nNo changes here';

      const result = generateDiff(text, text);

      expect(result.hasChanges).toBe(false);
      expect(result.changeCount).toBe(0);
    });

    it('should handle empty texts', () => {
      const result = generateDiff('', '');

      expect(result.hasChanges).toBe(false);
      expect(result.changeCount).toBe(0);
    });

    it('should handle addition of text', () => {
      const originalText = 'Original line';
      const modernizedText = 'Original line\nNew line added';

      const result = generateDiff(originalText, modernizedText);

      expect(result.hasChanges).toBe(true);
      expect(result.changeCount).toBeGreaterThan(0);
    });
  });

  describe('parseDiffToLines', () => {
    it('should parse diff text into structured lines', () => {
      const diffText = `--- original.md
+++ modernized.md
@@ -1,3 +1,3 @@
 Line 1
-Old line 2
+New line 2
 Line 3`;

      const result = parseDiffToLines(diffText);

      expect(result).toHaveLength(7);
      expect(result[0].type).toBe('header');  // "--- original.md" 
      expect(result[1].type).toBe('header');  // "+++ modernized.md"
      expect(result[2].type).toBe('hunk');    // "@@ -1,3 +1,3 @@"
      expect(result[3].type).toBe('context'); // " Line 1"
      expect(result[4].type).toBe('removed'); // "-Old line 2"
      expect(result[5].type).toBe('added');   // "+New line 2"
      expect(result[6].type).toBe('context'); // " Line 3"
    });

    it('should handle empty diff', () => {
      const result = parseDiffToLines('');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('context');
    });

    it('should parse line numbers correctly', () => {
      const diffText = `@@ -1,3 +1,3 @@
 Context line
-Removed line
+Added line`;

      const result = parseDiffToLines(diffText);

      const contextLine = result.find(line => line.type === 'context');
      const removedLine = result.find(line => line.type === 'removed');
      const addedLine = result.find(line => line.type === 'added');

      expect(contextLine?.oldLineNum).toBe('1');
      expect(contextLine?.newLineNum).toBe('1');
      expect(removedLine?.oldLineNum).toBe('2');
      expect(removedLine?.newLineNum).toBe('');
      expect(addedLine?.oldLineNum).toBe('');
      expect(addedLine?.newLineNum).toBe('2');
    });
  });
});
