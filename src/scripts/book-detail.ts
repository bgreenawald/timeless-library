export function handleImageError(img: HTMLImageElement): void {
  const title = img.getAttribute('data-title');
  const author = img.getAttribute('data-author');
  const backgroundColor = img.getAttribute('data-theme-color');

  if (!title || !author || !backgroundColor) {
    return;
  }

  // Hide the image
  img.style.display = 'none';

  // Create a safe placeholder element
  const placeholder = document.createElement('div');
  placeholder.className = 'book-detail-cover-placeholder';
  placeholder.style.backgroundColor = backgroundColor;
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', `Cover placeholder for ${title}`);

  // Create title element
  const titleDiv = document.createElement('div');
  titleDiv.className = 'book-title';
  titleDiv.textContent = title;

  // Create author element
  const authorDiv = document.createElement('div');
  authorDiv.className = 'book-author';
  authorDiv.textContent = `by ${author}`;

  // Append elements safely
  placeholder.appendChild(titleDiv);
  placeholder.appendChild(authorDiv);

  // Replace the image with the placeholder
  img.parentElement?.appendChild(placeholder);
}
