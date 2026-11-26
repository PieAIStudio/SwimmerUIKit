import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it } from 'vitest';
import { cdp } from 'vitest/browser';
import { OrbTabBar, type OrbTabSlots } from './OrbTabBar/OrbTabBar';
import { RadialLiquidMenu, type RadialLiquidMenuItem } from './RadialLiquidMenu/RadialLiquidMenu';
import { V12_THEMES } from '../tokens/v12Theme';
import '../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLElement | undefined;
async function mount(content: ReactNode): Promise<HTMLElement> {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(content));
  return host;
}
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});
const ITEMS: readonly RadialLiquidMenuItem[] = [
  { id: 'move', label: 'Move', icon: <span>↗</span> },
  { id: 'disabled', label: 'Disabled', icon: <span>◌</span>, disabled: true },
  { id: 'use', label: 'Use', icon: <span>✦</span> },
];
const TABS: OrbTabSlots = [
  { id: 'home', label: 'Home', icon: <span>⌂</span> },
  { id: 'map', label: 'Map', icon: <span>⌖</span>, disabled: true },
  { id: 'log', label: 'Log', icon: <span>≡</span> },
  { id: 'more', label: 'More', icon: <span>⋯</span> },
];

it('opens and closes the radial menu without stealing focus on mount', async () => {
  const sentinel = document.createElement('input');
  document.body.append(sentinel);
  sentinel.focus();
  const container = await mount(
    <RadialLiquidMenu
      defaultOpen
      items={ITEMS}
      label="Quick actions"
      trigger="+"
      triggerLabel="Open"
    />,
  );
  expect(document.activeElement).toBe(sentinel);
  const trigger = container.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
  expect(trigger.textContent).toContain('×');
  const first = container.querySelector<HTMLButtonElement>('[role="menuitem"]')!;
  await act(async () =>
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
  );
  await expect.poll(() => container.querySelector('[role="menu"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  sentinel.remove();
});
it('skips disabled radial items and keeps the interactive hit target stable', async () => {
  const container = await mount(
    <RadialLiquidMenu items={ITEMS} label="Quick actions" trigger="+" triggerLabel="Open" />,
  );
  const trigger = container.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
  await act(async () => trigger.click());
  const items = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
  items[0]!.focus();
  const x = trigger.getBoundingClientRect().x;
  await act(async () =>
    items[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })),
  );
  expect(document.activeElement).toBe(items[2]);
  expect(trigger.getBoundingClientRect().x).toBeCloseTo(x, 1);
});

it('respects reduced motion and renders no SVG filters or CSS drop shadows', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  const container = await mount(
    <div data-v12-theme="lagoon">
      <OrbTabBar activeId="home" orb="+" orbLabel="Open" tabs={TABS} />
    </div>,
  );
  const path = container.querySelector<SVGPathElement>('.game-ui-v12-liquid-body__path')!;
  const firstD = path.getAttribute('d');
  await new Promise((resolve) => setTimeout(resolve, 60));
  expect(path.getAttribute('d')).toBe(firstD);
  expect(container.querySelector('filter')).toBeNull();
  for (const element of Array.from(container.querySelectorAll<HTMLElement>('*'))) {
    const style = getComputedStyle(element);
    expect(style.filter).toBe('none');
    expect(style.backdropFilter).toBe('none');
  }
});
function rgb(value: string): [number, number, number] {
  const rgbMatch = value.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch)
    return rgbMatch[1]!
      .split(',')
      .slice(0, 3)
      .map((part) => Number(part.trim())) as [number, number, number];
  const srgbMatch = value.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (srgbMatch)
    return srgbMatch.slice(1, 4).map((part) => Number(part) * 255) as [number, number, number];
  throw new Error('Expected computed color, got ' + value);
}
function luminance(color: [number, number, number]): number {
  return color.reduce((sum, channel, index) => {
    const c = channel / 255;
    const linear = c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index]!;
  }, 0);
}

it('keeps every theme label pair at WCAG AA contrast', async () => {
  for (const theme of V12_THEMES) {
    const container = await mount(
      <div data-v12-theme={theme}>
        <span className="game-ui-v12-contrast-probe">Probe</span>
      </div>,
    );
    const probe = container.querySelector<HTMLElement>('.game-ui-v12-contrast-probe')!;
    probe.style.color = 'var(--swimmer-v12-label-ink)';
    probe.style.backgroundColor = 'var(--swimmer-v12-label-bg)';
    const styles = getComputedStyle(probe);
    const foreground = luminance(rgb(styles.color));
    const background = luminance(rgb(styles.backgroundColor));
    const ratio =
      (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    expect(ratio, theme).toBeGreaterThanOrEqual(4.5);
    await act(async () => root!.unmount());
    container.remove();
    root = undefined;
    host = undefined;
  }
});
