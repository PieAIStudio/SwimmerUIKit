import { describe, expect, it } from 'vitest';
import { liquidRevealShape } from './liquidRevealGeometry';
import { presenceBody } from './liquidPresenceGeometry';

const coordinates = (path: string) => path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
const maxDelta = (a: string, b: string) => {
  const left = coordinates(a),
    right = coordinates(b);
  expect(right.length).toBe(left.length);
  return Math.max(...left.map((value, i) => Math.abs(value - right[i]!)));
};
describe('one body/perimeter vocabulary, no independent corner waves', () => {
  for (const [w, h, input] of [
    [420, 340, true],
    [560, 700, false],
    [360, 62, true],
    [44, 44, false],
  ] as const) {
    it(`keeps ${w}×${h} finite, closed and slowly continuous`, () => {
      const shape = liquidRevealShape(w, h, input, 0);
      expect(shape.outline).not.toMatch(/NaN|Infinity|Q/);
      expect(shape.outline).toMatch(/ Z$/);
      const later = liquidRevealShape(w, h, input, Math.PI);
      expect(later.outline).not.toBe(shape.outline);
      expect(shape.ribbon.slice(shape.outline.length)).toBe(
        later.ribbon.slice(later.outline.length),
      );
      for (let t = 0; t < 2 * Math.PI; t += 0.2) {
        expect(
          maxDelta(
            liquidRevealShape(w, h, input, t).outline,
            liquidRevealShape(w, h, input, t + (2 * Math.PI) / 120).outline,
          ),
        ).toBeLessThan(0.5);
      }
      // Shared closed cubic spline has matching incoming/outgoing seam tangents.
      const p = coordinates(shape.outline);
      const end = p.slice(-6);
      expect(end[4]).toBe(p[0]);
      expect(end[5]).toBe(p[1]);
      expect(Math.abs(p[2]! - p[0]! - (end[4]! - end[2]!))).toBeLessThan(0.04);
      expect(Math.abs(p[3]! - p[1]! - (end[5]! - end[3]!))).toBeLessThan(0.04);
    });
  }
  it('increases discernible idle posture, not speed or every ordinary body default', () => {
    expect(presenceBody()).toBe(presenceBody(0, 0, 0, 1, 0));
    const gentle = maxDelta(presenceBody(0), presenceBody(Math.PI));
    const living = maxDelta(presenceBody(0, 0, 0, 1, 1), presenceBody(Math.PI, 0, 0, 1, 1));
    expect(living).toBeGreaterThan(gentle * 2.5);
    expect((living * 64) / 160).toBeGreaterThan(2);
    expect((living * 64) / 160).toBeLessThan(5);
  });
});
