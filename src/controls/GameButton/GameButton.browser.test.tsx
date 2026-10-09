import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GameButton } from './GameButton';
import { resetLiquidGooeyBudgetForTests, setLiquidGooeyBudget } from '../../liquid/budget';
import { MIN_PRESS_HOLD_MS } from '../../liquid/LiquidPressSurface/observePress';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement | undefined;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
/** Polls the real engine clock: liquid motion runs on requestAnimationFrame, not on test time. */
async function until(check: () => boolean, timeout = 3000): Promise<void> {
  const started = performance.now();
  while (!check()) {
    if (performance.now() - started > timeout) throw new Error('liquid state was not reached');
    await act(async () => wait(20));
  }
}

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  resetLiquidGooeyBudgetForTests();
  vi.restoreAllMocks();
});

async function mount(node: ReactNode): Promise<HTMLDivElement> {
  host = document.createElement('div');
  host.style.width = '280px';
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(node));
  return host;
}

describe('liquid CTA keeps layout and native interaction', () => {
  it('fills the parent with both the real hit target and the decorative surface', async () => {
    const container = await mount(
      <GameButton variant="primary" fullWidth>
        开始学习
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    const surface = container.querySelector('.game-ui-liquid-surface')!;
    expect(button.getBoundingClientRect().width).toBeCloseTo(280, 0);
    expect(surface.getBoundingClientRect().width).toBeCloseTo(280, 0);
    const before = button.getBoundingClientRect().toJSON();
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('true');
    expect(button.getBoundingClientRect().toJSON()).toEqual(before);
    expect(getComputedStyle(button).transform).toBe('none');
    expect(getComputedStyle(button).translate).toBe('none');
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('false');
  });

  it('composes the existing native keyboard handlers and click callback', async () => {
    const onKeyDown = vi.fn();
    const onClick = vi.fn();
    const container = await mount(
      <GameButton variant="primary" fullWidth onClick={onClick} onKeyDown={onKeyDown}>
        Go
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    const surface = container.querySelector('.game-ui-liquid-surface')!;
    button.focus();
    expect(document.activeElement).toBe(button);
    await act(async () =>
      button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })),
    );
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(surface.getAttribute('data-liquid-active')).toBe('true');
    await act(async () =>
      button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true })),
    );
    // A quick Space keeps the squash for the minimum hold before the spring.
    expect(surface.getAttribute('data-liquid-active')).toBe('true');
    await act(async () => wait(MIN_PRESS_HOLD_MS + 30));
    expect(surface.getAttribute('data-liquid-active')).toBe('false');
    await act(async () => button.click());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('squashes the CTA body to its press pose, even on a quick tap, then rebounds', async () => {
    const container = await mount(<GameButton variant="primary">Go</GameButton>);
    const button = container.querySelector('button')!;
    const shape = container.querySelector<HTMLElement>('.game-ui-liquid-surface__shape')!;
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    await until(() => shape.style.transform.includes('scale(1.06, 0.87)'));
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 })),
    );
    // Released after the minimum hold: the spring carries the body back to rest.
    await until(() => shape.style.transform.includes('scale(1, 1)'));
  });

  it('does not activate a disabled CTA', async () => {
    const onClick = vi.fn();
    const container = await mount(
      <GameButton variant="primary" disabled fullWidth onClick={onClick}>
        Wait
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    button.click();
    expect(onClick).not.toHaveBeenCalled();
    expect(container.querySelector('.game-ui-liquid-surface')).toBeNull();
    expect(button.getBoundingClientRect().width).toBeCloseTo(280, 0);
  });

  it('honors reduced motion without removing the native action', async () => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
      ...media,
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const onClick = vi.fn();
    const container = await mount(
      <GameButton variant="primary" onClick={onClick}>
        Go
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    expect(
      container.querySelector('.game-ui-liquid-surface')?.getAttribute('data-liquid-active'),
    ).toBe('false');
    await act(async () => button.click());
    expect(onClick).toHaveBeenCalledOnce();
  });
});

/** The engine writes `scale(x, y)` into the body host; read the uniform scale back. */
const bodyScale = (shape: HTMLElement) => {
  const match = /scale\(([\d.]+), ([\d.]+)\)/.exec(shape.style.transform);
  return match ? Number(match[1]) : Number.NaN;
};
const reducedMotionQuery = () => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  vi.spyOn(window, 'matchMedia').mockImplementation(
    () =>
      ({
        ...media,
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
};

describe('pending state keeps the action live', () => {
  it('breathes a pending CTA as liquid, stays enabled and still reaches the product', async () => {
    const onClick = vi.fn();
    const container = await mount(
      <GameButton variant="primary" pending onClick={onClick}>
        保存中
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    const surface = container.querySelector<HTMLElement>('.game-ui-liquid-surface')!;
    const shape = container.querySelector<HTMLElement>('.game-ui-liquid-surface__shape')!;
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(false);
    expect(surface.getAttribute('data-liquid-breathing')).toBe('true');
    await until(() => bodyScale(shape) >= 1.03);
    await until(() => bodyScale(shape) <= 1.005);
    await act(async () => button.click());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('squashes a pending CTA under a press, and releases it without disabling', async () => {
    const container = await mount(
      <GameButton variant="primary" pending>
        保存中
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    const shape = container.querySelector<HTMLElement>('.game-ui-liquid-surface__shape')!;
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    await until(() => shape.style.transform.includes('scale(1.06, 0.87)'));
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 })),
    );
    await until(
      () =>
        container.querySelector('.game-ui-liquid-surface')?.getAttribute('data-liquid-active') ===
        'false',
    );
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(false);
  });

  it('holds the body still under reduced motion while staying busy', async () => {
    reducedMotionQuery();
    const container = await mount(
      <GameButton variant="primary" pending>
        保存中
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    const surface = container.querySelector<HTMLElement>('.game-ui-liquid-surface')!;
    const shape = container.querySelector<HTMLElement>('.game-ui-liquid-surface__shape')!;
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(surface.hasAttribute('data-liquid-breathing')).toBe(false);
    await act(async () => wait(1400));
    expect(bodyScale(shape)).toBe(1);
  });

  it('gives the breath no animation slot when the liquid budget is spent', async () => {
    setLiquidGooeyBudget({ maxAnimatedGroups: 0 });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const container = await mount(
      <GameButton variant="primary" pending>
        保存中
      </GameButton>,
    );
    const shape = container.querySelector<HTMLElement>('.game-ui-liquid-surface__shape')!;
    await act(async () => wait(1400));
    expect(bodyScale(shape)).toBe(1);
    expect(container.querySelector('button')!.getAttribute('aria-busy')).toBe('true');
  });

  it('pulses a pending flat button through its droplet, and holds it under reduced motion', async () => {
    const container = await mount(<GameButton pending>保存中</GameButton>);
    const droplet = container.querySelector<SVGSVGElement>('.game-ui-droplet')!;
    expect(getComputedStyle(droplet).animationName).toBe('game-ui-button-pending');
    expect(container.querySelector('button')!.disabled).toBe(false);
    // Media queries are evaluated by the browser, not by matchMedia, so the hold
    // is asserted as the loaded stylesheet rule that a reduced-motion user gets.
    const rules: CSSRule[] = [];
    const collect = (list: CSSRuleList) => {
      for (const rule of list) {
        rules.push(rule);
        if ('cssRules' in rule) collect((rule as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of document.styleSheets) collect(sheet.cssRules);
    const held = rules.some(
      (rule) =>
        rule instanceof CSSMediaRule &&
        rule.conditionText.includes('prefers-reduced-motion') &&
        [...rule.cssRules].some(
          (inner) =>
            inner instanceof CSSStyleRule &&
            inner.selectorText.includes('aria-busy') &&
            inner.style.animationName === 'none',
        ),
    );
    expect(held).toBe(true);
  });
});
