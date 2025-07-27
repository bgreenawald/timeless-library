# Timeless Library

A project dedicated to bringing classic literature to contemporary readers.

## About

The Timeless Library is a web application built with Astro that provides easy access to classic literature. It features a modern, responsive design with book collections, detailed book pages, and an intuitive reading experience.

## Tech Stack

- **Framework**: Astro
- **Styling**: Tailwind CSS
- **Content**: Markdown with YAML frontmatter
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
/
├── src/
│   ├── content/books/     # Book content (markdown files)
│   ├── layouts/           # Page layouts
│   ├── lib/              # Utilities and configuration
│   └── pages/            # Astro pages
├── public/covers/        # Book cover images
└── docs/                # Documentation
```

## Configuration

Site-wide settings are managed in `src/lib/config.ts`. Update the `SITE_CONFIG` object to change the project name, description, and other branding elements.

## Contributing

1. Add book content as markdown files in `src/content/books/`
2. Include cover images in `public/covers/`
3. Update site configuration as needed in `src/lib/config.ts`

For detailed configuration information, see [SITE_CONFIGURATION.md](./SITE_CONFIGURATION.md).
