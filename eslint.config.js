import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

const baseLanguageOptions = {
  parser: tsParser,
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  globals: {
    ...globals.browser,
    ...globals.node,
    NodeJS: 'readonly',
    NodeListOf: 'readonly',
    HTMLElement: 'readonly',
    HTMLInputElement: 'readonly',
    HTMLSelectElement: 'readonly',
    HTMLButtonElement: 'readonly',
  },
};

const baseRules = {
  'no-console': 'warn',
  'no-debugger': 'error',
  'prefer-const': 'error',
  'no-var': 'error',
  'no-unused-vars': 'off',
};

export default [
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      'coverage/',
      '*.js',
      '*.mjs',
      '*.astro',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: baseLanguageOptions,
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: baseRules,
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...baseLanguageOptions.globals,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...baseRules,
      'no-console': 'off',
    },
  },
];

