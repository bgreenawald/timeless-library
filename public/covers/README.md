# Book Cover Images

This directory contains book cover images for The Timeless Library.

## File Organization

Each book has its own subdirectory named after the book's slug:

```
covers/
├── on-liberty/
│   ├── cover.webp        # Full-size cover for book detail pages
│   └── mini-cover.webp   # Cropped/sized cover for catalogue cards
├── the-federalist-papers/
│   ├── cover.webp
│   └── mini-cover.webp
└── the-wealth-of-nations/
    ├── cover.webp
    └── mini-cover.webp
```

### Image Types

- **cover.webp**: The main book cover image displayed on book detail pages
  - Recommended dimensions: 400x600px (2:3 aspect ratio)
- **mini-cover.webp**: A cropped/optimized version for the book catalogue grid
  - Recommended dimensions: 280x280px (used as background, cropped to fit)

## Adding a New Cover Image

1. Create a new directory matching the book's slug (e.g., `my-new-book/`)
2. Add `cover.webp` and `mini-cover.webp` to the directory
3. Update the book's markdown file in `src/content/books/` to include:
   ```yaml
   cover_image: '/covers/my-new-book/cover.webp'
   ```

## Display Behavior

- **Book Detail Pages**: Uses `cover.webp` for full display
- **Book Catalogue Grid**: Uses `mini-cover.webp` as background with
  title/author overlay
- **Fallback**: If no cover image is specified, color-based covers are used

## Image Guidelines

- Use WebP format for better compression and quality
- Use high-quality, public domain or properly licensed images
- Ensure good contrast - title/author text overlays on mini-cover
- Consider the overall aesthetic of the Timeless Library theme
- Test how the image looks at different screen sizes
- Keep file sizes under 500KB for optimal loading performance

## Fallback Behavior

If no `cover_image` is specified in a book's frontmatter, the system will
automatically fall back to the existing color-based cover design using the
book's theme colors.
