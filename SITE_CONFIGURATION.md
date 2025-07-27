# Site Configuration Guide

## Overview

The Timeless Library uses a centralized configuration system to manage site-wide constants and branding. This makes it easy to update the project name and other site-wide settings in the future.

## Configuration File

The main configuration is located in `src/lib/config.ts`:

```typescript
export const SITE_CONFIG = {
  name: "The Timeless Library",
  shortName: "Timeless Library", 
  description: "A project dedicated to bringing classic literature to contemporary readers",
  url: "https://timelesslibrary.com", // Update this when you have a domain
  author: "The Timeless Library Team",
} as const;
```

## How to Change the Project Name

To update the project name in the future, you only need to modify the `SITE_CONFIG` object in `src/lib/config.ts`. The changes will automatically propagate throughout the site.

### Steps:

1. **Update the configuration file** (`src/lib/config.ts`):
   - Change `name` to the new full name
   - Change `shortName` to the new short name
   - Update `description` if needed
   - Update `copyright` with the new name
   - Update `url` if you have a new domain

2. **Update package.json** (if needed):
   - Change the `name` field to match your new project name

3. **Update any hardcoded references** (if any exist):
   - Search for any remaining hardcoded references that might not use the config
   - Update documentation files like README.md
   - Note: The footer attribution is now hardcoded as "2025 [Site Name]" since no formal copyright is claimed

## Files That Use the Configuration

The following files automatically use the `SITE_CONFIG` values:

- `src/layouts/Layout.astro` - Site header and footer
- `src/pages/index.astro` - Home page title
- `src/pages/about.astro` - About page title and content
- `src/pages/faq.astro` - FAQ page title

## Benefits of This Approach

1. **Single Source of Truth**: All site branding is managed in one place
2. **Easy Updates**: Change the name once, updates everywhere
3. **Type Safety**: TypeScript ensures consistency
4. **Maintainability**: Reduces the chance of inconsistencies

## Example: Changing to "Classic Library"

```typescript
export const SITE_CONFIG = {
  name: "The Classic Library",
  shortName: "Classic Library",
  description: "A project dedicated to bringing classic literature to contemporary readers",
  url: "https://classiclibrary.com",
  author: "The Classic Library Team", 
} as const;
```

This single change would update the name throughout the entire website automatically. 