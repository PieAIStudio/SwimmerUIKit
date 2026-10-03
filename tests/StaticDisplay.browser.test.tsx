import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { GameBadge, GameCallout, GameToast, GameTooltip, GameIconButton } from '../src/index';
import { GAME_UI_STYLES } from '../src/tokens/styles';
import { attachDroplet } from '../src/controls/DropletSurface/controller';
import { createDropletGeometry, dropletPath } from '../src/controls/DropletSurface/geometry';
import '../src/styles.css';
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  host = document.createElement('div');
  host.style.width = '480px';
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
const settleFonts = async () => {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

it('keeps all display silhouettes static through pointer/key input in twelve styles, retaining status semantics', async () => {
  for (const style of GAME_UI_STYLES)
    for (const theme of ['light', 'dark']) {
      await act(async () =>
        root.render(
          <StrictMode>
            <section data-game-ui-style={style} data-game-ui-theme={theme}>
              <GameBadge tone="success">Saved</GameBadge>
              <GameToast tone="danger">Check input</GameToast>
              <GameCallout heading="Notice">Original explanation</GameCallout>
              <GameTooltip label="More explanation">
                <GameIconButton label="Help">?</GameIconButton>
              </GameTooltip>
            </section>
          </StrictMode>,
        ),
      );
      await settleFonts();
      const displays = [
        ...host.querySelectorAll<HTMLElement>(
          '.game-ui-badge,.game-ui-toast,.game-ui-callout,[role=tooltip]',
        ),
      ];
      expect(displays).toHaveLength(4);
      const before = displays.map((el) => el.querySelector('path')!.getAttribute('d'));
      for (const el of displays) {
        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
        expect(getComputedStyle(el).boxShadow).toBe('none');
        expect(getComputedStyle(el).backgroundImage).toBe('none');
        expect(getComputedStyle(el).animationName).toBe('none');
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(displays.map((el) => el.querySelector('path')!.getAttribute('d'))).toEqual(before);
      expect(host.querySelectorAll('filter')).toHaveLength(0);
      expect(host.querySelector('.game-ui-toast')?.getAttribute('role')).toBe('alert');
      expect(host.querySelector('.game-ui-badge')!.getBoundingClientRect().height).toBe(24);
      expect(host.querySelector('button')?.getAttribute('aria-describedby')).toBe(
        host.querySelector('[role=tooltip]')?.id,
      );
    }
});
it('enforces the badge one-pixel geometry cap even with an excessive host token', () => {
  const target = document.createElement('span');
  target.style.cssText =
    'display:block;width:100px;height:24px;--game-ui-droplet-wobble:90;--game-ui-droplet-radius:12px';
  target.innerHTML = '<svg><g><path /></g></svg>';
  host.append(target);
  const svg = target.querySelector('svg')!;
  const disconnect = attachDroplet(svg, target, 0, false, target, 1);
  const padding = Math.ceil(100 * 0.025 + 3 + 6);
  expect(svg.querySelector('path')?.getAttribute('d')).toBe(
    dropletPath(createDropletGeometry(100, 24, 12), 1, 0, 0, padding),
  );
  disconnect();
});
