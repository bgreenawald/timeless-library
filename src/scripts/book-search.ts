// src/scripts/book-search.ts
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

  // Check if all required elements exist
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
    // For client-side scripts, we'll throw an error to be caught by error boundaries
    throw new Error('Required DOM elements for book search are missing');
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

  // Event listeners
  searchInputElement.addEventListener('input', debouncedFilterBooks);
  genreFilterElement.addEventListener('change', filterBooks);
  tagFilterElement.addEventListener('change', filterBooks);

  clearFiltersBtnElement.addEventListener('click', function () {
    searchInputElement.value = '';
    genreFilterElement.value = '';
    tagFilterElement.value = '';
    filterBooks();
  });

  resetSearchBtnElement.addEventListener('click', function () {
    searchInputElement.value = '';
    genreFilterElement.value = '';
    tagFilterElement.value = '';
    filterBooks();
  });
}
