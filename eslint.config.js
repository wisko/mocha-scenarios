import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import scenarioGlobals from 'mocha-scenarios/globals'; // resolves to dist/; run `npm run build` if this import fails
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Disables the presets' formatting rules; our own rules below are unaffected.
  prettier,
  {
    rules: {
      curly: 'error',
      eqeqeq: 'error',
      'no-console': 'error',
      'no-eval': 'error',
      'no-nested-ternary': 'error',
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.node },
    // typescript-eslint replaces this rule with its type-aware variant on .ts files.
    rules: { 'no-implied-eval': 'error' },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: { globals: globals.mocha },
  },
  {
    // Spec files run by the behavioural tests are written with the UI itself.
    files: ['test/features/**/*.feature.js'],
    languageOptions: { globals: scenarioGlobals },
  },
  {
    // Console output is the point of the following files.
    files: ['scripts/**/*.js', 'test/helpers/reporter.js', 'test/features/**/*.feature.js'],
    rules: { 'no-console': 'off' },
  },
);
