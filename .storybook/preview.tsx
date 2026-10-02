import type { Preview } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { setClayAssetMode } from '../src/icons/assets';
import '../src/styles.css';
import '../src/tokens/fonts.css';

// Stories render with the real clay game-icon PNGs (served from public/ via
// staticDirs), matching the showcase instead of the inline SVG placeholders.
setClayAssetMode('source');

// Every story renders on the warm clay backdrop the kit is designed for, so the
// components look the way they do inside the game instead of on bare white.
const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'error' },
  },
  // Toolbar switch for the kit's flagship theming feature (one data
  // attribute reskins everything) — previously the only way to see dark
  // mode was the one hand-built "DarkTheme" story in GamePanelSystem.
  globalTypes: {
    theme: {
      description: 'Game UI theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context): ReactNode => (
      <div
        className="game-ui-clay-preview"
        data-game-ui-theme={context.globals.theme === 'dark' ? 'dark' : undefined}
        style={{ minHeight: '220px', padding: '40px' }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
