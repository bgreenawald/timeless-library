// Polyfill for import.meta in Jest
const importMeta = {
  env: {
    DEV: false,
    PROD: true,
    MODE: 'test',
    GITHUB_TOKEN: 'test-token',
    GITHUB_REPO_OWNER: 'test-owner',
    GITHUB_REPO_NAME: 'test-repo',
  },
  url: 'file://test',
};

// Define import.meta globally for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: importMeta,
  },
  writable: false,
  configurable: true,
});

// Also define it on global for older Node versions
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'import', {
    value: {
      meta: importMeta,
    },
    writable: false,
    configurable: true,
  });
}

export { importMeta };