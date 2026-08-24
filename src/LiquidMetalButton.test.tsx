import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  DEFAULT_LIQUID_METAL_CONTEXT_BUDGET,
  getLiquidMetalContextBudget,
  releaseLiquidMetalContext,
  resetLiquidMetalContextBudgetForTests,
  setLiquidMetalContextBudget,
  shouldAttemptWebGL,
  tryAcquireLiquidMetalContext,
} from './liquidMetalBudget';
import { attachLiquidMetalWebGL } from './liquidMetalWebGL';
import { LiquidMetalButton } from './LiquidMetalButton';

const SRC = dirname(fileURLToPath(import.meta.url));

afterEach(() => {
  resetLiquidMetalContextBudgetForTests();
});

describe('liquid metal WebGL context budget', () => {
  it('refuses a third context at the default limit of 2, so the extra button stays on CSS', () => {
    expect(DEFAULT_LIQUID_METAL_CONTEXT_BUDGET).toBe(2);
    expect(tryAcquireLiquidMetalContext()).toBe(true);
    expect(tryAcquireLiquidMetalContext()).toBe(true);
    expect(tryAcquireLiquidMetalContext()).toBe(false);
    expect(getLiquidMetalContextBudget()).toEqual({ limit: 2, used: 2 });
  });

  it('returns the slot on release so a later mount can upgrade', () => {
    expect(tryAcquireLiquidMetalContext()).toBe(true);
    expect(tryAcquireLiquidMetalContext()).toBe(true);
    expect(tryAcquireLiquidMetalContext()).toBe(false);
    releaseLiquidMetalContext();
    expect(getLiquidMetalContextBudget().used).toBe(1);
    expect(tryAcquireLiquidMetalContext()).toBe(true);
  });

  it('lets a host raise or lower the cap, including to zero', () => {
    setLiquidMetalContextBudget(0);
    expect(tryAcquireLiquidMetalContext()).toBe(false);
    setLiquidMetalContextBudget(3);
    expect(tryAcquireLiquidMetalContext()).toBe(true);
    expect(tryAcquireLiquidMetalContext()).toBe(true);
    expect(tryAcquireLiquidMetalContext()).toBe(true);
    expect(tryAcquireLiquidMetalContext()).toBe(false);
  });
});

describe('when the WebGL renderer is allowed to start', () => {
  const ready = {
    renderer: 'auto' as const,
    hasWebGL2: true,
    prefersReducedMotion: false,
    isInViewport: true,
  };

  it('does not start WebGL when prefers-reduced-motion is reduce', () => {
    expect(shouldAttemptWebGL({ ...ready, prefersReducedMotion: true })).toBe(false);
  });

  it('does not start WebGL when the browser has no webgl2', () => {
    expect(shouldAttemptWebGL({ ...ready, hasWebGL2: false })).toBe(false);
  });

  it('does not start WebGL while the button is off-screen', () => {
    expect(shouldAttemptWebGL({ ...ready, isInViewport: false })).toBe(false);
  });

  it('never starts WebGL when the caller asked for the CSS renderer', () => {
    expect(shouldAttemptWebGL({ ...ready, renderer: 'css' })).toBe(false);
  });

  it('attempts WebGL only when every upgrade gate passes', () => {
    expect(shouldAttemptWebGL(ready)).toBe(true);
  });
});

describe('LiquidMetalButton markup', () => {
  it('defaults to the CSS renderer, as a real button, with no iframe', () => {
    const html = renderToStaticMarkup(<LiquidMetalButton>Unlock</LiquidMetalButton>);
    expect(html).toContain('data-renderer="css"');
    expect(html).toContain('<button');
    expect(html).toContain('Unlock');
    expect(html).not.toContain('<iframe');
  });

  it('does not throw when WebGL2 cannot be created', () => {
    const canvas = {
      getContext: () => null,
    } as unknown as HTMLCanvasElement;
    const host = {} as HTMLElement;
    const button = {} as HTMLElement;
    expect(() => attachLiquidMetalWebGL(canvas, button, host)).not.toThrow();
    expect(attachLiquidMetalWebGL(canvas, button, host)).toBeNull();
  });
});

describe('liquid metal tokens and clip', () => {
  const themeCss = readFileSync(join(SRC, 'theme.css'), 'utf8');
  const stylesCss = readFileSync(join(SRC, 'styles.css'), 'utf8');

  it('defines face and ink on both light and night, because inheriting ink-deep would invert on night', () => {
    expect(themeCss).toMatch(/:root\s*\{[\s\S]*--game-ui-liquid-metal-face:/);
    expect(themeCss).toMatch(/:root\s*\{[\s\S]*--game-ui-liquid-metal-ink:/);
    expect(themeCss).toMatch(
      /\[data-game-ui-theme='night'\]\s*\{[\s\S]*--game-ui-liquid-metal-face:/,
    );
    expect(themeCss).toMatch(
      /\[data-game-ui-theme='night'\]\s*\{[\s\S]*--game-ui-liquid-metal-ink:/,
    );
  });

  it('clips the travelling highlight to the rounded face so it cannot sit beside the button', () => {
    // A previous CSS recreation put the sweep on an unclipped sibling; the
    // highlight then painted as a hard strip to the left of the pill.
    expect(stylesCss).toMatch(/\.game-ui-liquid-metal\s*\{[^}]*overflow:\s*hidden/);
    expect(stylesCss).toMatch(
      /\.game-ui-liquid-metal\s*\{[^}]*border-radius:\s*var\(--game-ui-radius-control\)/,
    );
    expect(stylesCss).toMatch(/\.game-ui-liquid-metal-host\s*\{[^}]*overflow:\s*visible/);
  });
});
