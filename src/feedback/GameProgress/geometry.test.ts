import { expect, it } from 'vitest';
import { progressFrontPath } from './geometry';
it('keeps zero empty, full clipped, finite intermediate arcs and bounded wave input', () => {
  expect(progressFrontPath(400, 0)).toBe('M0 0Z');
  expect(progressFrontPath(400, 1)).not.toContain('C');
  expect(progressFrontPath(400, 0.5)).toContain('C');
  expect(progressFrontPath(400, 0.5, 100)).toBe(progressFrontPath(400, 0.5, 1.4));
  expect(progressFrontPath(Number.NaN, Number.NaN)).not.toMatch(/NaN|Infinity/);
  expect(progressFrontPath(400, -1)).toBe('M0 0Z');
});
