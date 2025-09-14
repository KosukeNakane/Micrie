import { fileURLToPath, URL } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  // public配下のアセットをそのまま参照可能に
  staticDirs: ['../public'],
  // アプリ側ViteのaliasをStorybook側にも反映
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      'util': 'util/',
      'process': 'rollup-plugin-node-polyfills/polyfills/process-es6',
      '@app': fileURLToPath(new URL('../src/app', import.meta.url)),
      '@pages': fileURLToPath(new URL('../src/pages', import.meta.url)),
      '@widgets': fileURLToPath(new URL('../src/widgets', import.meta.url)),
      '@features': fileURLToPath(new URL('../src/features', import.meta.url)),
      '@entities': fileURLToPath(new URL('../src/entities', import.meta.url)),
      '@shared': fileURLToPath(new URL('../src/shared', import.meta.url)),
    };
    return config;
  }
};
export default config;
