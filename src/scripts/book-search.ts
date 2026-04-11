// src/scripts/book-search.ts

// Track initialization state and event handlers to prevent double-binding
let isInitialized = false;
let eventHandlers: {
  searchInput?: (e: Event) => void;
  genreFilter?: () => void;
  tagFilter?: () => void;
  clearFilters?: () => void;
  resetSearch?: () => void;
} = {};

export function initializeBookSearch() {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const genreFilter = document.getElementById('genre-filter') as HTMLSelectElement | null;
  const tagFilter = document.getElementById('tag-filter') as HTMLSelectElement | null;
  const clearFiltersBtn = document.getElementById('clear-filters') as HTMLButtonElement | null;
  const resetSearchBtn = document.getElementById('reset-search') as HTMLButtonElement | null;
  const booksGrid = document.getElementById('books-grid') as HTMLElement | null;
  const emptyState = document.getElementById('empty-state') as HTMLElement | null;
  const resultsCount = document.getElementById('results-count') as HTMLElement | null;
  const bookItems = document.querySelectorAll('.book-item') as NodeListOf<HTMLElement>;

  // Check if all required elements exist - return early if missing (non-catalog pages)
  if (
    !searchInput ||
    !genreFilter ||
    !tagFilter ||
    !clearFiltersBtn ||
    !resetSearchBtn ||
    !booksGrid ||
    !emptyState ||
    !resultsCount
  ) {
    // Return early instead of throwing - this allows the function to be called
    // on non-catalog pages without breaking other scripts
    return;
  }

  // Clean up previous listeners if already initialized
  if (isInitialized) {
    if (eventHandlers.searchInput && searchInput) {
      searchInput.removeEventListener('input', eventHandlers.searchInput);
    }
    if (eventHandlers.genreFilter && genreFilter) {
      genreFilter.removeEventListener('change', eventHandlers.genreFilter);
    }
    if (eventHandlers.tagFilter && tagFilter) {
      tagFilter.removeEventListener('change', eventHandlers.tagFilter);
    }
    if (eventHandlers.clearFilters && clearFiltersBtn) {
      clearFiltersBtn.removeEventListener('click', eventHandlers.clearFilters);
    }
    if (eventHandlers.resetSearch && resetSearchBtn) {
      resetSearchBtn.removeEventListener('click', eventHandlers.resetSearch);
    }
    // Reset handlers
    eventHandlers = {};
  }

  // Type assertions after null check - TypeScript now knows these are not null
  const searchInputElement = searchInput as HTMLInputElement;
  const genreFilterElement = genreFilter as HTMLSelectElement;
  const tagFilterElement = tagFilter as HTMLSelectElement;
  const clearFiltersBtnElement = clearFiltersBtn as HTMLButtonElement;
  const resetSearchBtnElement = resetSearchBtn as HTMLButtonElement;
  const booksGridElement = booksGrid as HTMLElement;
  const emptyStateElement = emptyState as HTMLElement;
  const resultsCountElement = resultsCount as HTMLElement;

  // Debounce function for search input
  function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function filterBooks() {
    const searchTerm = searchInputElement.value.toLowerCase();
    const selectedGenre = genreFilterElement.value;
    const selectedTag = tagFilterElement.value;

    let visibleCount = 0;

    bookItems.forEach(bookItem => {
      const title = bookItem.querySelector('.book-title')?.textContent?.toLowerCase() || '';
      const author = bookItem.querySelector('.book-author')?.textContent?.toLowerCase() || '';
      const description = bookItem.querySelector('.book-summary')?.textContent?.toLowerCase() || '';
      const genres = bookItem.dataset.genres?.split(',') || [];
      const tags = bookItem.dataset.tags ? bookItem.dataset.tags.split(',') : [];

      // Check search term
      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm) ||
        author.includes(searchTerm) ||
        description.includes(searchTerm);

      // Check genre filter
      const matchesGenre = !selectedGenre || genres.includes(selectedGenre);

      // Check tag filter
      const matchesTag = !selectedTag || tags.includes(selectedTag);

      if (matchesSearch && matchesGenre && matchesTag) {
        bookItem.style.display = 'block';
        visibleCount++;
      } else {
        bookItem.style.display = 'none';
      }
    });

    // Update results count
    resultsCountElement.textContent = `Showing ${visibleCount} book${visibleCount !== 1 ? 's' : ''}`;

    // Show/hide empty state
    if (visibleCount === 0) {
      booksGridElement.style.display = 'none';
      emptyStateElement.classList.remove('hidden');
    } else {
      booksGridElement.style.display = 'grid';
      emptyStateElement.classList.add('hidden');
    }
  }

  const debouncedFilterBooks = debounce(filterBooks, 300);

  // Create named handler functions so we can remove them later
  const handleClearFilters = function () {
    searchInputElement.value = '';
    genreFilterElement.value = '';
    tagFilterElement.value = '';
    filterBooks();
  };

  const handleResetSearch = function () {
    searchInputElement.value = '';
    genreFilterElement.value = '';
    tagFilterElement.value = '';
    filterBooks();
  };

  // Store handlers for cleanup
  eventHandlers.searchInput = debouncedFilterBooks;
  eventHandlers.genreFilter = filterBooks;
  eventHandlers.tagFilter = filterBooks;
  eventHandlers.clearFilters = handleClearFilters;
  eventHandlers.resetSearch = handleResetSearch;

  // Event listeners
  searchInputElement.addEventListener('input', eventHandlers.searchInput);
  genreFilterElement.addEventListener('change', eventHandlers.genreFilter);
  tagFilterElement.addEventListener('change', eventHandlers.tagFilter);
  clearFiltersBtnElement.addEventListener('click', eventHandlers.clearFilters);
  resetSearchBtnElement.addEventListener('click', eventHandlers.resetSearch);

  isInitialized = true;
}
