import type { CSSProperties } from 'react';

/** Palette meaning, independent of the host's visual style and light/dark mode. */
export type UiHue = 'coral' | 'sun' | 'leaf' | 'sky' | 'grape' | 'pink';

export function controlHue(hue: UiHue = 'sky', danger = false): CSSProperties {
  return danger
    ? ({
        '--hue': 'var(--swimmer-game-danger)',
        '--swimmer-hue-ink': 'var(--swimmer-control-danger-ink)',
      } as CSSProperties)
    : ({ '--hue': `var(--swimmer-hue-${hue})` } as CSSProperties);
}
