// Note: This file should only be run with Jest, not Vitest
import { jest } from '@jest/globals';

// Mock DOM elements
const mockElement = (tagName: string = 'div') => ({
  id: '',
  value: '',
  textContent: '',
  style: {} as CSSStyleDeclaration,
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  tagName,
});

// Mock document methods
const mockDocument = {
  getElementById: jest.fn(),
  querySelectorAll: jest.fn(),
  body: mockElement('body'),
};

// Mock global document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

describe('book-search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeBookSearch', () => {
    it('should throw error when required DOM elements are missing', async () => {
      // Mock missing elements
      mockDocument.getElementById.mockReturnValue(null);
      mockDocument.querySelectorAll.mockReturnValue([]);

      // Dynamic import to avoid module-level execution
      const { initializeBookSearch } = await import('../book-search');

      expect(() => initializeBookSearch()).toThrow(
        'Required DOM elements for book search are missing'
      );
    });

    it('should initialize successfully when all elements are present', async () => {
      // Mock all required elements
      const mockInput = { ...mockElement('input'), value: '' };
      const mockSelect = { ...mockElement('select'), value: '' };
      const mockButton = mockElement('button');
      const mockDiv = mockElement('div');

      mockDocument.getElementById.mockImplementation((id: string) => {
        switch (id) {
          case 'search-input': return mockInput;
          case 'genre-filter': return mockSelect;
          case 'tag-filter': return mockSelect;
          case 'clear-filters': return mockButton;
          case 'reset-search': return mockButton;
          case 'books-grid': return mockDiv;
          case 'empty-state': return mockDiv;
          case 'results-count': return mockDiv;
          default: return null;
        }
      });

      mockDocument.querySelectorAll.mockReturnValue([mockDiv]);

      const { initializeBookSearch } = await import('../book-search');

      // Should not throw
      expect(() => initializeBookSearch()).not.toThrow();

      // Verify event listeners are added
      expect(mockInput.addEventListener).toHaveBeenCalled();
      expect(mockSelect.addEventListener).toHaveBeenCalled();
      expect(mockButton.addEventListener).toHaveBeenCalled();
    });
  });
});