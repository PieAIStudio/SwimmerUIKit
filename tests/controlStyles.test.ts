import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  inspectControlStyleBlocks,
  contrastRatio,
} from '../scripts/lib/control-style-contract.mjs';

const css = readFileSync(new URL('../src/tokens/control-styles.css', import.meta.url), 'utf8');
describe('twelve complete style blocks', () => {
  it('reads six styles times two modes from their real CSS source', () => {
    const blocks = inspectControlStyleBlocks(css);
    expect(blocks).toHaveLength(12);
    expect(blocks.every((block) => Object.keys(block.variables).length === 22)).toBe(true);
  });
  it('rejects a missing token rather than borrowing another style’s definition', () => {
    expect(() =>
      inspectControlStyleBlocks(
        css.replace(
          /--game-ui-control-on-text-dark:[^;]+;/,
          '--missing-control-token: transparent;',
        ),
      ),
    ).toThrow(/missing on-text/);
  });
  it('rejects a missing mode and a duplicate declaration', () => {
    expect(() =>
      inspectControlStyleBlocks(
        css.replace("data-game-ui-style='ink'", "data-game-ui-style='unknown'"),
      ),
    ).toThrow(/Unknown/);
    expect(() =>
      inspectControlStyleBlocks(
        css.replace(
          '--game-ui-control-fill-light:',
          '--game-ui-control-fill-light: red; --game-ui-control-fill-light:',
        ),
      ),
    ).toThrow(/duplicate/);
  });
  it('uses the standard luminance calculation and does not round up a failing pair', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 10);
    expect(contrastRatio([120, 120, 120], [255, 255, 255])).toBeLessThan(4.5);
    expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBe(1);
  });
});
