import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { Input } from '../src/controls/Input/Input';
import { Panel } from '../src/containers/Panel/Panel';
import { GAME_UI_STYLES } from '../src/tokens/styles';
import { contrastRatio } from '../scripts/lib/contrast.mjs';
import '../src/styles.css';

it.each(['light', 'dark'])('%s has four honest surface roles across all styles', async (theme) => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d')!;
  const rgba = (color: string) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data];
  };
  try {
    for (const style of GAME_UI_STYLES) {
      await act(async () =>
        root.render(
          <div
            data-game-ui-theme={theme}
            data-game-ui-style={style}
            style={{ color: 'var(--swimmer-game-text)' }}
          >
            <Panel>
              <Input aria-label="Input" />
            </Panel>
            {['bg', 'surface', 'surface-sunken', 'surface-raised'].map((role) => (
              <div
                key={role}
                data-surface={role}
                style={{
                  background: `var(${['bg', 'surface', 'surface-raised'].includes(role) ? '--swimmer-game-' : '--swimmer-'}${role})`,
                }}
              >
                Text<span style={{ color: 'var(--swimmer-game-text-muted)' }}>Muted</span>
              </div>
            ))}
          </div>,
        ),
      );
      const paints = [...host.querySelectorAll<HTMLElement>('[data-surface]')].map((el) => ({
        role: el.dataset.surface!,
        background: rgba(getComputedStyle(el).backgroundColor),
        foreground: rgba(getComputedStyle(el).color),
        muted: rgba(getComputedStyle(el.firstElementChild!).color),
      }));
      for (const p of paints) {
        expect(p.background[3]).toBe(255);
        expect(
          contrastRatio(p.foreground, p.background),
          `${style}/${p.role}`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(p.muted, p.background),
          `${style}/${p.role}/muted`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(paints[1]!.background).not.toEqual(paints[0]!.background);
      expect(paints[2]!.background).not.toEqual(paints[1]!.background);
      expect(paints[3]!.background).not.toEqual(paints[1]!.background);
      expect(rgba(getComputedStyle(host.querySelector('input')!).backgroundColor)).toEqual(
        paints[2]!.background,
      );
      expect(rgba(getComputedStyle(host.querySelector('.game-ui-panel')!).backgroundColor)).toEqual(
        paints[1]!.background,
      );
      expect(getComputedStyle(host.querySelector('.game-ui-panel')!).boxShadow).toBe('none');
    }
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
