import { describe, expect, it, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { LiquidGroup, LiquidItem } from './LiquidGroup';
import { DISSOLVE_DEFAULTS, resolveDissolveOptions } from './liquidGooeyImageMelt';
import {
  DEFAULT_LIQUID_GOOEY_ANIMATION_BUDGET,
  DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET,
  getLiquidGooeyBudget,
  releaseLiquidGooeyAnimation,
  resetLiquidGooeyBudgetForTests,
  setLiquidGooeyBudget,
  tryAcquireLiquidGooeyAnimation,
} from './liquidGooeyBudget';

afterEach(() => resetLiquidGooeyBudgetForTests());

describe('liquid gooey animation budget', () => {
  it('defaults to two animated groups and a bounded filter area', () => {
    expect(DEFAULT_LIQUID_GOOEY_ANIMATION_BUDGET).toBe(2);
    expect(DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET).toBeGreaterThan(0);
    expect(getLiquidGooeyBudget()).toEqual({
      maxAnimatedGroups: 2,
      maxFilterArea: DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET,
      activeGroups: 0,
    });
  });

  it('rejects a third active group and releases its slot cleanly', () => {
    expect(tryAcquireLiquidGooeyAnimation(20_000)).toBe(true);
    expect(tryAcquireLiquidGooeyAnimation(20_000)).toBe(true);
    expect(tryAcquireLiquidGooeyAnimation(20_000)).toBe(false);
    releaseLiquidGooeyAnimation();
    expect(getLiquidGooeyBudget().activeGroups).toBe(1);
    expect(tryAcquireLiquidGooeyAnimation(20_000)).toBe(true);
  });

  it('rejects an oversized filter region without rejecting smaller regions', () => {
    setLiquidGooeyBudget({ maxAnimatedGroups: 3, maxFilterArea: 1_000 });
    expect(tryAcquireLiquidGooeyAnimation(1_001)).toBe(false);
    expect(tryAcquireLiquidGooeyAnimation(1_000)).toBe(true);
  });

  it('accepts the metal-budget-shaped numeric setter for the group cap', () => {
    setLiquidGooeyBudget(0);
    expect(tryAcquireLiquidGooeyAnimation(1)).toBe(false);
    setLiquidGooeyBudget(1);
    expect(tryAcquireLiquidGooeyAnimation(1)).toBe(true);
  });
});

describe('LiquidGroup DOM architecture', () => {
  it('keeps the fill token and puts the filter only on the SVG silhouette group', () => {
    const html = renderToStaticMarkup(
      <LiquidGroup>
        <LiquidItem>
          <button type="button">Claim reward</button>
        </LiquidItem>
      </LiquidGroup>,
    );

    expect(html).toContain('fill="var(--game-ui-surface, var(--game-ui-panel-strong))"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-liquid-gooey-silhouette');
    expect(html).toContain('filter="url(#liquid-gooey-');
    expect(html).toContain('<button');
    expect(html).not.toMatch(/<button[^>]*filter=/);
    expect(html).not.toContain('<iframe');
  });

  it('supports the named LiquidGroup.Item API as well as the standalone alias', () => {
    const html = renderToStaticMarkup(
      <LiquidGroup>
        <LiquidGroup.Item>
          <span>One</span>
        </LiquidGroup.Item>
        <LiquidItem>
          <span>Two</span>
        </LiquidItem>
      </LiquidGroup>,
    );

    expect(html.match(/class="game-ui-liquid-item"/g)).toHaveLength(2);
  });

  it('keeps an explicit calm override and reserves a larger filter region for waviness', () => {
    const renderGroup = (waviness?: number): string =>
      renderToStaticMarkup(
        <LiquidGroup {...(waviness === undefined ? {} : { waviness })}>
          <LiquidGroup.Item>
            <span>Surface</span>
          </LiquidGroup.Item>
        </LiquidGroup>,
      );
    const calm = renderGroup(0);
    const wavy = renderGroup(6);
    const filterWidth = (html: string): number =>
      Number(html.match(/<filter[^>]*width="([\d.]+)"/)?.[1] ?? 0);
    const filterHeight = (html: string): number =>
      Number(html.match(/<filter[^>]*height="([\d.]+)"/)?.[1] ?? 0);

    expect(calm).not.toContain('feTurbulence');
    expect(wavy).toContain('baseFrequency="0.018"');
    expect(wavy).toContain('scale="12"');
    expect(filterWidth(wavy)).toBeGreaterThan(filterWidth(calm));
    expect(filterHeight(wavy)).toBeGreaterThan(filterHeight(calm));
  });

  it('supports the image Melt item without leaking effect props into the DOM', () => {
    const html = renderToStaticMarkup(
      <LiquidGroup>
        <LiquidGroup.Item
          data-testid="melt-item"
          effect="melt"
          melt={{ src: 'data:image/svg+xml,test', mix: 1 }}
        >
          <img alt="palette" src="data:image/svg+xml,test" />
          <span>Keep this label crisp</span>
        </LiquidGroup.Item>
      </LiquidGroup>,
    );

    expect(html).toContain('data-testid="melt-item"');
    expect(html).toContain('Keep this label crisp');
    expect(html).not.toContain('effect="melt"');
    expect(html).not.toContain('dissolve=');
    expect(html).toContain('class="game-ui-liquid-item"');
  });

  it('keeps dissolve defaults donor-shaped and numeric shorthand explicit', () => {
    expect(resolveDissolveOptions(null, true)).toMatchObject(DISSOLVE_DEFAULTS);
    expect(resolveDissolveOptions(null, 0.5)).toMatchObject({
      strength: 0.5,
      mix: DISSOLVE_DEFAULTS.mix,
      warp: DISSOLVE_DEFAULTS.warp,
    });
    expect(resolveDissolveOptions(null, { active: false, mix: 2 })).toMatchObject({
      active: false,
      mix: 1,
    });
  });
});

describe('reduced-motion detection', () => {
  /*
    The kit's own suite runs in node, where `window` is absent and the first
    guard is enough. jsdom is the shape nobody tested: `window` exists and
    `matchMedia` does not, which is how 1.10.0 reached a consumer and threw
    inside a `useState` initializer — in a client render and again in an SSR
    pass. Pin the middle case here rather than in the consumer that found it.
  */
  it('renders where window exists but matchMedia does not', () => {
    const globals = globalThis as { window?: unknown };
    const had = 'window' in globals;
    const previous = globals.window;
    globals.window = {};

    try {
      const html = renderToStaticMarkup(
        <LiquidGroup>
          <LiquidItem>
            <button type="button">Claim reward</button>
          </LiquidItem>
        </LiquidGroup>,
      );
      expect(html).toContain('data-liquid-gooey-silhouette');
    } finally {
      if (had) globals.window = previous;
      else delete globals.window;
    }
  });
});
