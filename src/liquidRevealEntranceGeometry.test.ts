import { expect, it } from 'vitest';
import { liquidRevealEntranceFrames, LIQUID_REVEAL_DURATION } from './liquidRevealEntranceGeometry';
import { liquidRevealShape } from './liquidRevealGeometry';

it('keeps finite equal-topology stages and ends at exactly the ambient silhouette', () => {
  for (const [width, height] of [
    [420, 360],
    [360, 62],
    [44, 44],
  ]) {
    const frames = liquidRevealEntranceFrames(
      width!,
      height!,
      true,
      { x: 200, y: 450 },
      { x: 200, y: height! - 28 },
      { x: 0, y: 0, width: 800, height: 900 },
    );
    const count = frames[0]!.d.match(/ C /g)!.length;
    for (const frame of frames) {
      expect(frame.d).not.toMatch(/NaN|Infinity/);
      expect(frame.d.match(/ C /g)).toHaveLength(count);
    }
    expect(frames.at(-1)?.d).toBe(`path("${liquidRevealShape(width!, height!, true).outline}")`);
    expect(LIQUID_REVEAL_DURATION).toBeLessThanOrEqual(750);
  }
});

it('the perimeter expands outward while its reading shore is unchanged', () => {
  const calm = liquidRevealShape(420, 360, false, 0, 0.5);
  const expressive = liquidRevealShape(420, 360, false, 0, 1.25);
  expect(calm.outline).not.toBe(expressive.outline);
  expect(calm.ribbon.slice(calm.outline.length)).toBe(
    expressive.ribbon.slice(expressive.outline.length),
  );
});
