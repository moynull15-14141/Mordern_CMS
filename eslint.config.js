/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ recommendedConfig: true });

/**
 * Frontend Milestone 1 (docs/61_FRONTEND_FOUNDATION.md) — eslint-config-next
 * 16.x ships native flat-config arrays directly (no legacy eslintrc shape),
 * so this is a plain `require()`, not a FlatCompat conversion (FlatCompat's
 * legacy-config bridge crashed with a circular-JSON error against this
 * package's plugin objects — a real incompatibility, not a config mistake).
 * Scoped to apps/admin only via `files` below. Additive only — the root
 * `compat` instance above and every existing rule block are unchanged.
 */
const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');
const nextConfigs = nextCoreWebVitals.map((cfg) => ({
  ...cfg,
  files: ['apps/admin/**/*.{js,jsx,ts,tsx}'],
}));

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.pnpm/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.log',
    ],
  },
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'),
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'warn',
    },
  },
  {
    files: ['apps/backend/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    files: ['apps/web/**/*.{js,ts,tsx}', 'apps/admin/**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
  },
  ...nextConfigs,
  {
    files: ['apps/admin/**/*.test.{ts,tsx}', 'apps/admin/**/vitest.setup.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
];
