import { describe, expect, it } from 'vitest';
import { createDropletGeometry, dropletPath, dropletSeed } from './geometry';
import { advanceDropletSpring, createDropletSpring, pressedPose, restingPose } from './spring';

describe('flat droplet geometry', () => {
  it.each([
    [44, 44, 22],
    [180, 44, 999],
    [720, 48, 16],
    [320, 84, 16],
    [1, 1, 0],
  ])('is finite, closed and bounded at %sx%s', (width, height, radius) => {
    const geometry = createDropletGeometry(width, height, radius);
    const contour = dropletPath(geometry, 1.4, 0.7, 0.9, 10);
    expect(contour).toMatch(/^M/);
    expect(contour).toMatch(/Z$/);
    expect(contour).not.toMatch(/NaN|Infinity|undefined/);
    expect(contour.match(/C/g)).toHaveLength(geometry.points.length);
    expect(geometry.points.length).toBeGreaterThanOrEqual(48);
    expect(geometry.points.length).toBeLessThanOrEqual(224);
    for (const point of geometry.points) {
      expect(point.x).toBeGreaterThanOrEqual(-0.0001);
      expect(point.x).toBeLessThanOrEqual(width + 0.0001);
      expect(point.y).toBeGreaterThanOrEqual(-0.0001);
      expect(point.y).toBeLessThanOrEqual(height + 0.0001);
      expect(Math.hypot(point.nx, point.ny)).toBeCloseTo(1, 8);
    }
  });
  it('does not depend on a style or theme to produce its outline', () => {
    const geometry = createDropletGeometry(260, 44, 999);
    expect(dropletPath(geometry, 1.4, 0, 1)).toBe(dropletPath(geometry, 1.4, 0, 1));
    expect(dropletPath(geometry, 1.4, 0, 1)).not.toBe(dropletPath(geometry, 1.4, 0.8, 1));
    expect(dropletPath(geometry, 0, 0, 1)).toBe(dropletPath(geometry, 0, 0.8, 99));
    expect(dropletSeed('same')).toBe(dropletSeed('same'));
    expect(dropletSeed('first')).not.toBe(dropletSeed('second'));
  });
  it('guards degenerate input and never creates unbounded sampling work', () => {
    for (const value of [NaN, Infinity, -100, 0, 1e8]) {
      const geometry = createDropletGeometry(value, value, value);
      expect(geometry.points.length).toBeLessThanOrEqual(224);
      expect(dropletPath(geometry, value, value, value)).not.toMatch(/NaN|Infinity/);
    }
  });
  it('caps the actual wave at 1.4px even during press overshoot or on long rows', () => {
    for (const width of [44, 180, 720, 2400]) {
      const geometry = createDropletGeometry(width, 48, 16);
      for (const phase of [0, 0.8, 2.5]) {
        const capped = dropletPath(geometry, 1.4, phase, 1);
        for (const amplitude of [3.1, 4, 99])
          expect(dropletPath(geometry, amplitude, phase, 1)).toBe(capped);
      }
    }
  });
});

describe('droplet press spring', () => {
  it('spreads horizontally, compresses vertically, crosses rest and then sleeps', () => {
    const spring = createDropletSpring(1.4);
    spring.target = pressedPose(1.4);
    for (let i = 0; i < 24; i++) advanceDropletSpring(spring, 1 / 60);
    expect(spring.value.x).toBeGreaterThan(1);
    expect(spring.value.y).toBeLessThan(1);
    spring.target = restingPose(1.4);
    let crossed = false;
    for (let i = 0; i < 180; i++) {
      advanceDropletSpring(spring, 1 / 60);
      crossed ||= spring.value.y > 1;
    }
    expect(crossed).toBe(true);
    expect(spring.value).toEqual(restingPose(1.4));
    expect(advanceDropletSpring(spring, 1 / 60)).toBe(false);
  });
  it('bounds stalled-frame work without adding energy or invalid numbers', () => {
    const spring = createDropletSpring(1.4);
    spring.target = pressedPose(1.4);
    for (const dt of [10, NaN, -1, Infinity, 0.016]) advanceDropletSpring(spring, dt);
    expect(Object.values(spring.value).every(Number.isFinite)).toBe(true);
    expect(spring.value.x).toBeGreaterThan(0.9);
    expect(spring.value.x).toBeLessThan(1.2);
  });
});
