import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { LiquidPresence } from './LiquidPresence';
import { LiquidAnchor } from './LiquidAnchor';
import { GameButton } from './GameButton';
import './styles.css';
import './liquid-presence.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
it('a destination label avoids an open sibling panel and recovers after its removal', async () => {
  const host = document.createElement('div'),
    source = document.createElement('button'),
    target = document.createElement('button');
  host.style.cssText = 'position:fixed;right:16px;bottom:16px';
  source.style.cssText = 'position:fixed;right:16px;bottom:16px;width:64px;height:64px';
  target.style.cssText = 'position:fixed;right:90px;width:130px;height:44px';
  target.textContent = 'Actual destination';
  document.body.append(host, source, target);
  const root = createRoot(host);
  const render = async (open: boolean) =>
    act(async () =>
      root.render(
        <>
          <LiquidPresence
            reducedMotion
            target={{
              key: 'same',
              label: 'Actual destination',
              contextElement: target,
              getRect: () => target.getBoundingClientRect(),
            }}
          />
          {open && (
            <LiquidAnchor source={{ current: source }}>
              <div style={{ width: 320, height: 240 }}>Product panel</div>
            </LiquidAnchor>
          )}
        </>,
      ),
    );
  try {
    target.style.top = '100px';
    await render(true);
    const panel = () => document.querySelector<HTMLElement>('.game-ui-liquid-anchor')!;
    await expect.poll(() => panel()?.style.visibility).toBe('visible');
    target.style.top = `${panel().getBoundingClientRect().y - 54}px`;
    window.dispatchEvent(new Event('resize'));
    const label = () => document.querySelector<HTMLElement>('.game-ui-liquid-presence-label')!;
    const overlap = () => {
      const a = label().getBoundingClientRect(),
        b = panel().getBoundingClientRect();
      return a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
    };
    await expect.poll(() => label()?.hidden).toBe(false);
    await expect.poll(() => getComputedStyle(label()).visibility).toBe('visible');
    await expect.poll(overlap).toBe(false);
    await render(false);
    expect(document.querySelector('.game-ui-liquid-anchor')).toBeNull();
    await expect.poll(() => getComputedStyle(label()).visibility).toBe('visible');
  } finally {
    await act(async () => root.unmount());
    host.remove();
    source.remove();
    target.remove();
  }
});

it('unlayered product button styles win inside the optional liquid family', async () => {
  const host = document.createElement('div'),
    style = document.createElement('style');
  style.textContent =
    '.host-owned { background: rgb(90, 30, 110); color: rgb(255, 255, 255); border-radius: 9px; }';
  document.body.append(host, style);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <div className="game-ui-liquid-reveal">
          <GameButton className="host-owned">Product action</GameButton>
        </div>,
      ),
    );
    const computed = getComputedStyle(host.querySelector('button')!);
    expect(computed.backgroundColor).toBe('rgb(90, 30, 110)');
    expect(computed.borderRadius).toBe('9px');
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
  }
});
