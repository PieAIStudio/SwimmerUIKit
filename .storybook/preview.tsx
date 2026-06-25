import type { Preview } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { setClayAssetMode } from '../src/clay/assets';
import '../src/styles.css';

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
    a11y: { test: 'todo' },
  },
  decorators: [
    (Story): ReactNode => (
      <div className="game-ui-clay-preview" style={{ minHeight: '220px', padding: '40px' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
