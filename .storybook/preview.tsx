import type { Preview } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { GAME_UI_STYLES } from '../src/tokens/styles';
import '../src/styles.css';
import '../src/tokens/fonts.css';

// Icons are inline SVG; no copied public assets or initialization.

// Every story renders on the warm flat backdrop the kit is designed for, so the
// components look the way they do inside the game instead of on bare white.
const preview: Preview = {
  afterEach: ({ canvasElement }) => {
    const ctas = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-game-ui-cta="true"]'),
    ].filter(
      (button) =>
        !button.matches(':disabled,[aria-disabled="true"]') && button.getClientRects().length > 0,
    );
    if (ctas.length > 1)
      throw new Error(
        `One screen may contain at most one liquid CTA; this story rendered ${ctas.length}: ${ctas.map((button) => button.textContent?.trim()).join(', ')}`,
      );
  },
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
    uiStyle: {
      description: 'Independent visual style',
      defaultValue: 'pastel',
      toolbar: {
        title: 'Style',
        icon: 'paintbrush',
        items: GAME_UI_STYLES.map((value) => ({ value, title: value })),
        dynamicTitle: true,
      },
    },
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
        className="game-ui-preview-canvas"
        data-game-ui-theme={context.globals.theme === 'dark' ? 'dark' : undefined}
        data-game-ui-style={context.globals.uiStyle ?? 'pastel'}
        style={{
          minHeight: '100dvh',
          padding: '40px',
          boxSizing: 'border-box',
          background: 'var(--game-ui-bg)',
          color: 'var(--game-ui-text)',
          fontFamily: 'var(--game-ui-font-body)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
