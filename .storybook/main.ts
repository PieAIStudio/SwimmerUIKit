import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  core: {
    builder: {
      name: '@storybook/builder-vite',
      // Storybook otherwise auto-loads the root library-build config, whose
      // declaration bundler is intentionally unrelated to the Storybook site.
      options: { viteConfigPath: './.storybook/vite.config.ts' },
    },
  },
  staticDirs: ['../public'],
  // The kit is 100% standard CSS since 1.0 (the Tailwind @theme bridge moved
  // to the optional tailwind-bridge.css export), so Storybook needs no CSS
  // plugin. staticDirs is the single owner of public assets; disabling Vite's
  // second public copy avoids intermittent EEXIST failures when Storybook
  // builds the icon catalog.
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, { publicDir: false });
  },
};

export default config;
