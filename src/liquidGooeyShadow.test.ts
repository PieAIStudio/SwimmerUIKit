import { describe, expect, it } from 'vitest';

import {
  compositorDropShadowFilter,
  isCompositorOuterShadow,
  parseShadow,
  shadowExtentOf,
  svgFilterShadows,
} from './liquidGooeyShadow';

const BUTTON = '0 13px 26px rgba(76, 52, 28, 0.22), inset 0 2px 0 rgba(255, 255, 255, 0.42)';

describe('liquid gooey shadow split', () => {
  it('sends the 26px outer layer to CSS drop-shadow and keeps inset in SVG', () => {
    const layers = parseShadow(BUTTON);
    expect(layers).toHaveLength(2);
    expect(isCompositorOuterShadow(layers[0]!)).toBe(true);
    expect(isCompositorOuterShadow(layers[1]!)).toBe(false);
    expect(compositorDropShadowFilter(layers)).toBe(
      'drop-shadow(0px 13px 26px rgba(76, 52, 28, 0.22))',
    );
    expect(svgFilterShadows(layers)).toEqual([layers[1]]);
    expect(shadowExtentOf(svgFilterShadows(layers))).toBe(2);
    expect(shadowExtentOf(layers)).toBe(52);
  });

  it('keeps spread rings in the SVG filter', () => {
    const layers = parseShadow('0 0 0 4px rgba(76, 52, 28, 0.22)');
    expect(isCompositorOuterShadow(layers[0]!)).toBe(false);
    expect(compositorDropShadowFilter(layers)).toBeUndefined();
    expect(svgFilterShadows(layers)).toEqual(layers);
    expect(shadowExtentOf(layers)).toBe(4);
  });

  it('chains several outer layers in document order', () => {
    const layers = parseShadow('0 8px 18px rgba(0, 0, 0, 0.22), 0 2px 4px rgba(0, 0, 0, 0.12)');
    expect(compositorDropShadowFilter(layers)).toBe(
      'drop-shadow(0px 8px 18px rgba(0, 0, 0, 0.22)) drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.12))',
    );
    expect(svgFilterShadows(layers)).toEqual([]);
  });
});
