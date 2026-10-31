import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { controlHue, type UiHue } from './hue';
import { GAME_UI_DEFAULT_STYLE, GAME_UI_STYLES } from './styles';

const HUES: UiHue[] = ['coral', 'sun', 'leaf', 'sky', 'grape', 'pink'];

describe('controlHue', () => {
  it('defaults to sky and maps each hue to its CSS variable', () => {
    expect(controlHue()).toEqual({ '--hue': 'var(--swimmer-hue-sky)' });
    for (const hue of HUES) {
      expect(controlHue(hue)).toEqual({ '--hue': `var(--swimmer-hue-${hue})` });
    }
  });

  it('uses the danger colour and ink whatever hue is asked for', () => {
    expect(controlHue('leaf', true)).toEqual({
      '--hue': 'var(--swimmer-game-danger)',
      '--swimmer-hue-ink': 'var(--swimmer-control-danger-ink)',
    });
  });

  it('only names hue variables that every style defines', () => {
    const css = readFileSync('src/tokens/control-styles.css', 'utf8');
    for (const style of GAME_UI_STYLES) {
      const start = css.indexOf(`[data-game-ui-style='${style}']`);
      expect(start, style).toBeGreaterThanOrEqual(0);
      const rules = css.slice(start, css.indexOf('}', start));
      for (const hue of HUES) {
        expect(rules, `${style} ${hue}`).toMatch(new RegExp(`--swimmer-hue-${hue}:`));
      }
    }
  });
});

describe('GAME_UI_STYLES', () => {
  it('lists seven unique styles and includes the default', () => {
    expect(GAME_UI_STYLES).toHaveLength(7);
    expect(new Set(GAME_UI_STYLES).size).toBe(7);
    expect(GAME_UI_STYLES).toContain(GAME_UI_DEFAULT_STYLE);
  });
});
