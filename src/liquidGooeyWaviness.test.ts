import { describe, expect, it } from 'vitest';

import {
  LIQUID_GOOEY_WAVINESS_MAX_FRACTION,
  resolveLiquidGooeyWaviness,
} from './liquidGooeyWaviness';

describe('liquid gooey waviness clamp', () => {
  it('uses the measured shorter side to protect thin surfaces', () => {
    expect(LIQUID_GOOEY_WAVINESS_MAX_FRACTION).toBe(0.3);
    expect(resolveLiquidGooeyWaviness(6, 14)).toBe(4.2);
  });

  it('leaves a 52px control and a 150px blob unchanged', () => {
    expect(resolveLiquidGooeyWaviness(6, 52)).toBe(6);
    expect(resolveLiquidGooeyWaviness(6, 150)).toBe(6);
  });

  it('supports a deliberate per-group override', () => {
    expect(resolveLiquidGooeyWaviness(6, 14, false)).toBe(6);
    expect(resolveLiquidGooeyWaviness(6, 14, 1)).toBe(6);
  });
});
