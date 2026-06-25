import type { Preview } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import '../src/styles.css';

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
      <div className="game-ui-clay-preview" style={{ minHeight: '100vh', padding: '40px' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
