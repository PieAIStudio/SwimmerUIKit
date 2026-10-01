import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

import { GameCollectibleCard } from './GameCollectibleCard';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLElement | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
});
async function mount(content: React.ReactNode) {
  host = document.createElement('div');
  host.style.width = '200px';
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(content));
  return host.querySelector('button')!;
}
const pointer = (type: string, x: number, y: number) =>
  new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1 });

it('turns over on a tap and back on the next', async () => {
  const onFlip = vi.fn();
  const card = await mount(
    <GameCollectibleCard
      rarity="rare"
      title="Hallucination"
      label="Hallucination"
      onFlip={onFlip}
    />,
  );
  await act(async () => card.click());
  expect(card.getAttribute('aria-pressed')).toBe('true');
  expect(card.classList.contains('game-ui-collect-card--down')).toBe(true);
  await act(async () => card.click());
  expect(card.getAttribute('aria-pressed')).toBe('false');
  expect(onFlip.mock.calls).toEqual([[true], [false]]);
});

it('tilts toward the pointer, and a drag that tilted it is not a tap', async () => {
  const onFlip = vi.fn();
  const card = await mount(
    <GameCollectibleCard
      rarity="legendary"
      title="Multimodal"
      label="Multimodal"
      onFlip={onFlip}
    />,
  );
  const box = card.getBoundingClientRect();
  await act(async () => {
    card.dispatchEvent(pointer('pointerdown', box.left + 20, box.top + 20));
    card.dispatchEvent(pointer('pointermove', box.right - 10, box.top + 20));
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) expect(card.style.getPropertyValue('--card-ry')).not.toBe('0deg');
  await act(async () => card.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })));
  expect(onFlip).not.toHaveBeenCalled();
  // A keyboard/assistive click is not a stale pointer drag.
  await act(async () => card.click());
  expect(onFlip).toHaveBeenCalledOnce();
});

it('accepts bounded host tilt without subscribing each card to a sensor', async () => {
  const add = vi.spyOn(window, 'addEventListener');
  const card = await mount(
    <GameCollectibleCard rarity="rare" title="Tilt" label="Tilt" tilt={{ x: 5, y: -5 }} />,
  );
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    expect(card.style.getPropertyValue('--card-ry')).toBe('10deg');
    expect(card.style.getPropertyValue('--card-rx')).toBe('10deg');
  }
  expect(add.mock.calls.filter(([type]) => type === 'deviceorientation')).toHaveLength(0);
  await act(async () =>
    root!.render(
      <GameCollectibleCard rarity="rare" title="Tilt" label="Tilt" tilt={{ x: NaN, y: 1 }} />,
    ),
  );
  expect(card.style.getPropertyValue('--card-ry')).toBe('0deg');
  add.mockRestore();
});

it('zeroes existing tilt when reduced motion changes, while keeping drag distinct from a tap', async () => {
  const media = Object.assign(new EventTarget(), { matches: false });
  const query = vi
    .spyOn(window, 'matchMedia')
    .mockImplementation(() => media as unknown as MediaQueryList);
  const flip = vi.fn();
  try {
    const card = await mount(
      <GameCollectibleCard
        rarity="legendary"
        title="Motion"
        label="Motion"
        tilt={{ x: 0.5, y: 0.5 }}
        onFlip={flip}
      />,
    );
    expect(card.style.getPropertyValue('--card-ry')).toBe('5deg');
    media.matches = true;
    await act(async () =>
      media.dispatchEvent(Object.assign(new Event('change'), { matches: true })),
    );
    expect(card.style.getPropertyValue('--card-rx')).toBe('0deg');
    expect(card.style.getPropertyValue('--card-ry')).toBe('0deg');
    await act(async () => {
      card.dispatchEvent(pointer('pointerdown', 10, 10));
      card.dispatchEvent(pointer('pointermove', 100, 10));
      card.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    });
    expect(flip).not.toHaveBeenCalled();
    await act(async () => card.click());
    expect(flip).toHaveBeenCalledOnce();
  } finally {
    query.mockRestore();
  }
});

it('keeps the band legible: its ink meets 4.5:1 on every rarity', async () => {
  const luminance = (rgb: string) => {
    const [r, g, b] = rgb
      .match(/\d+(\.\d+)?/g)!
      .slice(0, 3)
      .map(Number)
      .map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  for (const rarity of ['common', 'rare', 'legendary'] as const) {
    const card = await mount(
      <GameCollectibleCard rarity={rarity} title="T" setLabel="Set" rarityLabel="R" label="T" />,
    );
    const band = card.querySelector('.game-ui-collect-card-band')!;
    const style = getComputedStyle(band);
    const [a, b] = [luminance(style.color), luminance(style.backgroundColor)].sort((x, y) => y - x);
    expect((a! + 0.05) / (b! + 0.05)).toBeGreaterThanOrEqual(4.5);
    await act(async () => root?.unmount());
    host?.remove();
  }
});
