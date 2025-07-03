# Book Cover Images

This directory contains book cover images for The Modern Library.

## File Organization

- Store cover images as JPG or PNG files
- Use descriptive filenames that match the book slug (e.g., `the-federalist-papers.jpg`)
- Recommended dimensions: 400x600px (2:3 aspect ratio, typical book cover proportions)
- File size: Keep under 500KB for optimal loading performance

## Adding a New Cover Image

1. Place your image file in this directory
2. Update the book's markdown file in `src/content/books/` to include:
   ```yaml
   cover_image: "/covers/your-book-slug.jpg"
   ```

## Display Behavior

- **Book Detail Pages**: Actual cover images are displayed prominently alongside book information
- **Collection/Featured Lists**: Color-based covers are used for consistent visual design
- **Fallback**: If no cover image is specified, color-based covers are used everywhere

## Image Guidelines

- Use high-quality, public domain or properly licensed images
- Ensure good contrast for readability
- Consider the overall aesthetic of the Modern Library theme
- Test how the image looks at different screen sizes

## Fallback Behavior

If no `cover_image` is specified in a book's frontmatter, the system will automatically fall back to the existing color-based cover design using the book's theme colors.

## Optimization

For production, consider:
- Using WebP format for better compression
- Implementing lazy loading for better performance
- Adding responsive image sizes for different screen densities 