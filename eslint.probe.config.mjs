import js from '@eslint/js';
export default [
  { files: ['**/*.jsx', '**/*.js'], ...js.configs.recommended },
  {
    files: ['**/*.jsx', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly', document: 'readonly', console: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly',
        clearInterval: 'readonly', fetch: 'readonly', URL: 'readonly',
        File: 'readonly', FileReader: 'readonly', FormData: 'readonly',
        Blob: 'readonly', alert: 'readonly', confirm: 'readonly',
        navigator: 'readonly', HTMLElement: 'readonly', Image: 'readonly',
        prompt: 'readonly', crypto: 'readonly', structuredClone: 'readonly',
        localStorage: 'readonly', URLSearchParams: 'readonly', Notification: 'readonly', Audio: 'readonly', history: 'readonly', location: 'readonly', getComputedStyle: 'readonly', requestAnimationFrame: 'readonly', IntersectionObserver: 'readonly', ResizeObserver: 'readonly',
      },
    },
    rules: { 'no-undef': 'error', 'no-unused-vars': 'off' },
  },
  { ignores: ['dist/', 'node_modules/'] },
];
