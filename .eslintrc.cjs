module.exports = {
  extends: ['eslint:recommended'],
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  globals: {
    NodeJS: 'readonly',
    NodeListOf: 'readonly',
    HTMLElement: 'readonly',
    HTMLInputElement: 'readonly',
    HTMLSelectElement: 'readonly',
    HTMLButtonElement: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Basic JavaScript rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      rules: {
        'no-console': 'warn',
        'no-debugger': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'no-unused-vars': 'off',
      }
    },
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
        'no-debugger': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'no-unused-vars': 'off',
      }
    }
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '.astro/',
    'coverage/',
    '*.js',
    '*.mjs',
    '*.astro'
  ],
};