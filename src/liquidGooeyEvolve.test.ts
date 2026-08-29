import { describe, expect, it } from 'vitest';

import {
  advanceEvolve,
  createEvolveState,
  EVOLVE_DEFAULTS,
  resolveEvolveOptions,
  resolveMorphShape,
  type EvolveTarget,
} from './liquidGooeyEvolve';

const stillTarget: EvolveTarget = {
  cx: 48,
  cy: 24,
  w: 96,
  h: 48,
  r: 18,
  scale: 1,
};

describe('liquid-gooey Morph shape adoption', () => {
  it('keeps the donor physics defaults while mapping speed and bounce', () => {
    expect(EVOLVE_DEFAULTS).toMatchObject({
      contentBlur: 7,
      cornerDuration: 460,
      massDamping: 17,
      massStiffness: 320,
      sizeDamping: 11.5,
      sizeStiffness: 170,
    });

    expect(resolveMorphShape(null)).toBe(true);
    expect(resolveMorphShape(null, { shape: false })).toBe(false);

    expect(resolveEvolveOptions(null, { speed: 2, bounce: 0.5, contentBlur: 12 })).toMatchObject({
      contentBlur: 12,
      cornerDuration: 230,
      massDamping: 34,
      massStiffness: 1280,
      sizeDamping: 23,
      sizeStiffness: 680,
    });
  });

  it('moves centre first, then changes size/corners and cross-blurs content', () => {
    const state = createEvolveState(stillTarget);
    const options = resolveEvolveOptions(null, { shape: true });
    advanceEvolve(state, stillTarget, 1 / 60, 0, options);

    const next: EvolveTarget = { ...stillTarget, cx: 210, cy: 30, w: 150, h: 72, r: 30 };
    let frame = advanceEvolve(state, next, 1 / 60, 16, options);
    expect(frame.moving).toBe(true);
    expect(frame.contentBlur).toBeGreaterThan(0);
    expect(frame.path).not.toBe(advanceEvolve(createEvolveState(next), next, 0, 16, options).path);

    for (let index = 2; index < 260; index += 1) {
      frame = advanceEvolve(state, next, 1 / 60, index * 16, options);
    }
    expect(frame.moving).toBe(false);
    expect(frame.contentBlur).toBeLessThan(0.01);
  });
});
