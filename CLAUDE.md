# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- **Start dev server**: `npm run dev` (serves at http://localhost:4321)
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

### Testing
- **Run Vitest tests**: `npm run test` (for Astro components and frontend code)
- **Run Jest tests**: `npm run test:jest` (for Node.js utilities and backend logic)
- **Run Jest with watch**: `npm run test:jest:watch`
- **Test coverage (Vitest)**: `npm run test:coverage`
- **Test coverage (Jest)**: `npm run test:jest:coverage`
- **Test UI**: `npm run test:ui`

### Code Quality
- **Lint TypeScript**: `npm run lint`
- **Fix lint issues**: `npm run lint:fix`
- **Format code**: `npm run format`
- **Check formatting**: `npm run format:check`

### Single Test Execution
- **Vitest single test**: `npm run test -- path/to/test.test.ts`
- **Jest single test**: `npm run test:jest -- path/to/test.test.ts`

## Architecture Overview

### Project Type
An Astro-based static site for modernized classic literature with GitHub integration for versioned book content.

### Testing Strategy
- **Vitest**: Tests Astro components and frontend functionality (`src/components/__tests__/`)
- **Jest**: Tests Node.js utilities and backend logic (`src/lib/__tests__/`, `src/scripts/__tests__/`)
- **Happy DOM**: Test environment for component testing

### Key Architectural Components

#### Content Management
- **Astro Content Collections**: Books are defined in `src/content/books/` as markdown files
- **Book Schema**: Defined in `src/content/config.ts` with title, author, genres, publication year, etc.
- **GitHub Integration**: Book versions are fetched from GitHub releases in the `llm-book-updater` repository

#### Core Libraries (`src/lib/`)
- **`metadata.ts`**: Handles book processing metadata from GitHub releases
- **`github.ts`**: GitHub API integration for fetching releases and book versions
- **`paths.ts`**: Dynamic path generation for Astro static site generation
- **`logger.ts`**: Winston-based logging (see `docs/LOGGING.md` for configuration)
- **`download-helpers.ts`**: Utilities for download functionality
- **`diff.ts`**: Text diffing between book versions

#### Page Structure
- **Dynamic routing**: `[book].astro` and `[book]/[version].astro` for book and version pages
- **Book listing**: `books/index.astro` shows all books
- **Version comparison**: `[book]/[version]/diff.astro` for comparing book versions
- **Home page**: Features collection of books marked as `is_featured: true`

#### Component Architecture
- **BookDetail.astro**: Main book information display
- **VersionsGrid.astro**: Grid of available book versions
- **DownloadsTable.astro**: Download links for different formats
- **BookMetadata.astro**: Processing metadata display
- **ErrorBoundary.astro**: Error handling wrapper

### Environment Variables
- **GITHUB_TOKEN**: Required for GitHub API access (avoid rate limiting)
- **GITHUB_REPO_OWNER**: Defaults to 'bgreenawald'
- **GITHUB_REPO_NAME**: Defaults to 'llm-book-updater'

### File Organization
- **Content**: Book markdown files in `src/content/books/`
- **Components**: Reusable Astro components in `src/components/`
- **Pages**: Route definitions in `src/pages/`
- **Utilities**: Helper functions in `src/lib/`
- **Styles**: CSS files in `src/styles/`
- **Scripts**: Client-side TypeScript in `src/scripts/`

### Book Processing Workflow
1. Books are processed externally and published as GitHub releases
2. Site fetches release data including processing metadata
3. Different versions represent different processing stages/improvements
4. Users can compare versions and download various formats (EPUB, MOBI, PDF)

### Development Notes
- The site is designed to work without GitHub integration (graceful degradation)
- Book content is separate from the website codebase
- Static site generation creates pages for all books and versions at build time
- Tailwind CSS is used for styling