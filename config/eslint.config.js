import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import prettierConfig from './prettier.config.js';

const baseConfig = js.configs.recommended;
const tsRecommendedRules = tsPlugin.configs.recommended.rules;

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        WebMidi: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...baseConfig.rules,
      ...tsRecommendedRules,
      'prettier/prettier': ['warn', prettierConfig],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: ['typeLike'],
          format: ['PascalCase'],
        },
        {
          selector: ['variable', 'function'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: ['property', 'parameter'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
      ],
    },
  },
];
