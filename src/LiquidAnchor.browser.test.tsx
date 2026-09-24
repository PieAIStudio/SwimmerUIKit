import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it } from 'vitest';
import { LiquidAnchor } from './LiquidAnchor';
import './styles.css';
import './liquid-presence.css';
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement, source: HTMLButtonElement;
let occupied: { x: number; y: number; width: number; height: number } | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  source?.remove();
  expect(occupied).toBeNull();
});
it('fits opposite corners without moving the host body; reports the actual outlet and clears it', async () => {
  host = document.createElement('div');
  source = document.createElement('button');
  document.body.append(host, source);
  source.style.cssText = 'position:fixed;left:10px;top:10px;width:60px;height:60px';
  root = createRoot(host);
  await act(async () =>
    root.render(
      <LiquidAnchor
        source={{ current: source }}
        onBoundsChange={(r) => {
          occupied = r;
        }}
      >
        <div style={{ width: 300, height: 160 }}>Original content</div>
      </LiquidAnchor>,
    ),
  );
  await expect.poll(() => occupied?.width).toBe(300);
  expect(occupied!.x).toBeGreaterThanOrEqual(10);
  expect(occupied!.y).toBeGreaterThan(60);
  expect(source.getBoundingClientRect().x).toBe(10);
  source.style.left = `${innerWidth - 72}px`;
  source.style.top = `${innerHeight - 72}px`;
  window.dispatchEvent(new Event('resize'));
  await expect.poll(() => occupied!.y).toBeLessThan(innerHeight - 100);
  expect(occupied!.x + occupied!.width).toBeLessThanOrEqual(innerWidth);
  expect(occupied!.y + occupied!.height).toBeLessThanOrEqual(innerHeight);
});

it('keeps its own native reader visible, hides for an unrelated modal, and hides an offscreen source', async () => {
  host = document.createElement('div');
  source = document.createElement('button');
  source.style.cssText = 'position:fixed;left:50px;top:50px;width:60px;height:60px';
  document.body.append(host, source);
  root = createRoot(host);
  await act(async () =>
    root.render(
      <LiquidAnchor
        source={{ current: source }}
        onBoundsChange={(r) => {
          occupied = r;
        }}
      >
        <div style={{ width: 300, height: 160 }}>
          <button>Read</button>
          <dialog aria-label="Own reader">
            <input defaultValue="retain" />
          </dialog>
        </div>
      </LiquidAnchor>,
    ),
  );
  const layer = () => document.querySelector<HTMLElement>('.game-ui-liquid-anchor')!;
  await expect.poll(() => occupied?.width).toBe(300);
  const own = layer().querySelector('dialog')!;
  own.showModal();
  window.dispatchEvent(new Event('resize'));
  await expect.poll(() => layer().style.visibility).toBe('visible');
  expect(getComputedStyle(own).visibility).toBe('visible');
  own.close();
  const other = document.createElement('dialog');
  document.body.append(other);
  try {
    other.showModal();
    window.dispatchEvent(new Event('resize'));
    await expect.poll(() => layer().style.visibility).toBe('hidden');
    expect(occupied).toBeNull();
    other.close();
    await expect.poll(() => layer().style.visibility).toBe('visible');
    expect(own.querySelector('input')!.value).toBe('retain');
    source.style.top = '-200px';
    window.dispatchEvent(new Event('resize'));
    await expect.poll(() => layer().style.visibility).toBe('hidden');
    expect(occupied).toBeNull();
    source.style.top = '50px';
    source.style.opacity = '0';
    await expect.poll(() => layer().style.visibility).toBe('hidden');
    source.style.opacity = '1';
    await expect.poll(() => layer().style.visibility).toBe('visible');
  } finally {
    other.remove();
  }
});
