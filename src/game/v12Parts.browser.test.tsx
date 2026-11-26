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

async function unmountHost(): Promise<void> {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
}

afterEach(async () => {
  await unmountHost();
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

function rgb(value: string): [number, number, number] {
  const rgbMatch = value.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch)
    return rgbMatch[1]!
      .split(/[,\s/]+/)
      .filter(Boolean)
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

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

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

it('skips disabled radial items, skips disabled tabs, and keeps hit targets stable', async () => {
  const selected: string[] = [];
  const container = await mount(
    <div>
      <RadialLiquidMenu items={ITEMS} label="Quick actions" trigger="+" triggerLabel="Open" />
      <OrbTabBar
        activeId="home"
        onSelect={(id) => selected.push(id)}
        orb="+"
        orbLabel="Open"
        tabs={TABS}
      />
    </div>,
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

  const tabs = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  tabs[0]!.focus();
  await act(async () =>
    tabs[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })),
  );
  expect(document.activeElement).toBe(tabs[2]);
  expect(selected).toEqual(['log']);
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

it('resolves non-black luminous liquid gradients and white glyphs in every theme', async () => {
  for (const theme of V12_THEMES) {
    const container = await mount(
      <div data-v12-theme={theme} style={{ width: '360px', padding: '12px' }}>
        <RadialLiquidMenu
          defaultOpen
          items={ITEMS}
          label="Quick actions"
          theme={theme}
          trigger="+"
          triggerLabel="Open"
        />
      </div>,
    );
    const stops = Array.from(container.querySelectorAll<SVGStopElement>('linearGradient stop'));
    expect(stops.length, theme).toBeGreaterThanOrEqual(4);
    for (const stop of stops) {
      const color = rgb(getComputedStyle(stop).stopColor);
      expect(luminance(color), `${theme} stop must not fall back to black`).toBeGreaterThan(0.2);
      if (theme === 'blossom') {
        expect(color[0], `${theme} should be rosy pink`).toBeGreaterThan(color[1] + 40);
      } else {
        expect(color[1], `${theme} should be aqua/teal`).toBeGreaterThan(color[0] + 60);
      }
    }
    const icon = container.querySelector<HTMLElement>('.game-ui-v12-radial-menu__icon')!;
    expect(rgb(getComputedStyle(icon).color), `${theme} glyph ink`).toEqual([255, 255, 255]);

    const box = container.firstElementChild!.getBoundingClientRect();
    for (const item of Array.from(
      container.querySelectorAll<HTMLElement>('.game-ui-v12-radial-menu__item'),
    )) {
      const rect = item.getBoundingClientRect();
      expect(rect.left, `${theme} left clip`).toBeGreaterThanOrEqual(box.left - 1);
      expect(rect.right, `${theme} right clip`).toBeLessThanOrEqual(box.right + 1);
    }
    await unmountHost();
  }
});

it('keeps every theme text, label, and tab pair at WCAG AA contrast', async () => {
  const pairs: readonly [string, string, string][] = [
    ['label', '--swimmer-v12-label-ink', '--swimmer-v12-label-bg'],
    ['ink on frost', '--swimmer-v12-ink', '--swimmer-v12-frost-bg'],
    ['muted on frost', '--swimmer-v12-muted', '--swimmer-v12-frost-bg'],
    ['tab on bar', '--swimmer-v12-tab', '--swimmer-v12-bar'],
    ['active tab on bar', '--swimmer-v12-ink', '--swimmer-v12-bar'],
  ];
  for (const theme of V12_THEMES) {
    const container = await mount(
      <div data-v12-theme={theme}>
        <span className="game-ui-v12-contrast-probe">Probe</span>
      </div>,
    );
    const probe = container.querySelector<HTMLElement>('.game-ui-v12-contrast-probe')!;
    for (const [label, fgVar, bgVar] of pairs) {
      probe.style.color = `var(${fgVar})`;
      probe.style.backgroundColor = `var(${bgVar})`;
      const styles = getComputedStyle(probe);
      expect(
        contrast(rgb(styles.color), rgb(styles.backgroundColor)),
        `${theme} ${label}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
    await unmountHost();
  }
});
