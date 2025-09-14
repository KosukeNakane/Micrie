// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import path from 'path'
import { fileURLToPath } from 'url'

import js from '@eslint/js'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Flat config: 型付きパーサは src の TS/TSX に限定し、その他は型なしで lint する
export default tseslint.config(
  // 1) 無視対象（生成物・外部資産など）
  {
    ignores: [
      'node_modules',
      'dist',
      'storybook-static',
      'public/worklets/**',
      'src/__archive__/**',
    ],
  },
  // 2) ベース設定（型なし）: すべての JS/TS に適用
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
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { project: './tsconfig.eslint.json' },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // react-refresh rule already present
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // import plugin rules
      'import/no-unresolved': 'error',
      'import/no-absolute-path': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
      ],
      // 大量の差分を避けるため、import/order は当面 warning とする
      'import/order': ['warn', {
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
        pathGroups: [ { pattern: '@/**', group: 'internal', position: 'after' } ],
        pathGroupsExcludedImportTypes: [],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mui/*/*/*', '@mui/*/*/*/*', '@mui/*/*/*/*/*'],
              message: 'Do not import MUI submodules directly. Import from the top-level package.',
            },
            {
              // FSD: Deep import の禁止（Public API 経由に統一）
              group: [
                '@/app/*/*/(ui|model|lib|api)/**',
                '@/processes/*/*/(ui|model|lib|api)/**',
                '@/pages/*/*/(ui|model|lib|api)/**',
                '@/widgets/*/*/(ui|model|lib|api)/**',
                '@/features/*/*/(ui|model|lib|api)/**',
                '@/entities/*/*/(ui|model|lib|api)/**',
                '@/shared/**/(ui|model|lib|api)/**',
              ],
              message: 'Deep import 禁止。各 slice の Public API（index.ts）経由で import してください。',
            },
          ],
        },
      ],
      // unused-imports plugin
      'unused-imports/no-unused-imports': 'error',
      // typescript-eslint rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // no-empty は空catchだけ許容
      'no-empty': ['error', { allowEmptyCatch: true }],
      // 当面の運用: tsコメントは禁止レベルを緩和
      '@typescript-eslint/ban-ts-comment': 'warn',
      // 空オブジェクト型の禁止を一旦オフ（必要箇所で適切な型に移行予定）
      '@typescript-eslint/no-empty-object-type': 'off',
      // 過剰な失敗を避けるため、エスケープの過不足はwarning
      'no-useless-escape': 'warn',
      // react plugin rules
      'react/react-in-jsx-scope': 'off',
      // storybook plugin rules: フレームワーク移行中のため緩和
      'storybook/no-renderer-packages': 'warn',
    },
  },
  // 3) 型付きルールが必要な範囲だけ、プロジェクトを付与（srcのTS/TSX）
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  // 4) Storybook 推奨ルール（flat）
  storybook.configs['flat/recommended'],
  // 5) 最後に Storybook の特定ルールを緩和（上書きするため最後に記述）
  {
    files: ['**/*.stories.*', '.storybook/**/*.*'],
    rules: {
      'storybook/no-renderer-packages': 'warn',
    },
  }
);
