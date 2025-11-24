/**
 * Global configuration for The Timeless Library
 * This file contains site-wide constants and configuration values.
 */

export const SITE_CONFIG = {
  name: 'Timeless Library',
  shortName: 'Timeless Library',
  description: 'A project dedicated to bringing classic literature to contemporary readers',
  url: 'https://timelesslibrary.org', // Update this when you have a domain
  author: 'The Timeless Library Team',
} as const;

export type SiteConfig = typeof SITE_CONFIG;
