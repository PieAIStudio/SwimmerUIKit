import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { GameToggle } from './GameToggle';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

it('uses the style semantic track and thumb instead of a black outlined circle, without losing checked position', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    for (const style of ['candy', 'pastel', 'mist', 'grey', 'outline', 'ink'])
      for (const theme of ['light', 'dark']) {
        const render = (checked: boolean) =>
          act(async () =>
            root.render(
              <div data-game-ui-style={style} data-game-ui-theme={theme}>
                <GameToggle hue="leaf" label="提醒" checked={checked} />
              </div>,
            ),
          );
        await render(false);
        const button = host.querySelector('button')!;
        const track = button.querySelector<HTMLElement>('.game-ui-toggle-track')!;
        const thumb = button.querySelector<HTMLElement>('.game-ui-toggle-thumb')!;
        await Promise.all(thumb.getAnimations().map((animation) => animation.finished));
        const probe = document.createElement('span');
        probe.style.cssText =
          'background:var(--game-ui-control-disabled-fill);color:var(--game-ui-control-on-edge)';
        button.append(probe);
        expect(getComputedStyle(track).backgroundColor).toBe(
          getComputedStyle(probe).backgroundColor,
        );
        if (style === 'pastel' || style === 'grey')
          expect(getComputedStyle(track).borderTopColor).toBe('rgba(0, 0, 0, 0)');
        expect(getComputedStyle(thumb).backgroundColor).toBe(getComputedStyle(probe).color);
        expect(getComputedStyle(thumb).backgroundColor).not.toBe(
          getComputedStyle(track).backgroundColor,
        );
        const before = thumb.getBoundingClientRect().x;
        await render(true);
        await Promise.all(thumb.getAnimations().map((animation) => animation.finished));
        expect(host.querySelector('button')).toBe(button);
        expect(button.getAttribute('aria-checked')).toBe('true');
        expect(thumb.getBoundingClientRect().x - before).toBeCloseTo(16, 1);
        probe.remove();
      }
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
