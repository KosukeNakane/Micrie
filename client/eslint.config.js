import js from '@eslint/js'
import globals from 'globals'
import path from "path";
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports'
import eslintPluginReact from 'eslint-plugin-react'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  { ignores: ['dist', 'src/__archive__/**'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react': eslintPluginReact,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': eslintPluginImport,
      'unused-imports': eslintPluginUnusedImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.eslint.json'
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {},
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // react-refresh rule already present
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // import plugin rules
      'import/no-unresolved': 'error',
      'import/no-absolute-path': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: [],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mui/*/*/*', '@mui/*/*/*/*', '@mui/*/*/*/*/*'],
              message: 'Do not import MUI submodules directly. Import from the top-level package.',
            },
          ],
        },
      ],
      // unused-imports plugin
      'unused-imports/no-unused-imports': 'error',
      // typescript-eslint rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // react plugin rules
      'react/react-in-jsx-scope': 'off',
    },
  },
)
