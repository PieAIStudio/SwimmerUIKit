import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  // The clay tokens live in src/styles.css behind Tailwind v4's @theme bridge,
  // so Storybook's Vite builder needs the same @tailwindcss/vite plugin the
  // library and showcase builds use. Without it the CSS variables never emit.
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, { plugins: [tailwindcss()] });
  },
};

export default config;
