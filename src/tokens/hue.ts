import type { CSSProperties } from 'react';

/** Palette meaning, independent of the host's visual style and light/dark mode. */
export type GameUiHue = 'coral' | 'sun' | 'leaf' | 'sky' | 'grape' | 'pink';

export function controlHue(hue: GameUiHue = 'sky', danger = false): CSSProperties {
  return danger
    ? ({
        '--hue': 'var(--game-ui-danger)',
        '--game-ui-hue-ink': 'var(--game-ui-control-danger-ink)',
      } as CSSProperties)
    : ({ '--hue': `var(--game-ui-hue-${hue})` } as CSSProperties);
}
