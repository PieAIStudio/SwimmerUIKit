import { describe, expect, it } from 'vitest';
import { samplePresenceMotion } from './liquidPresenceMotion';
import {
  presenceBody,
  presenceCurve,
  presenceLanding,
  presenceSeat,
  validPresenceRect,
  visiblePresenceRect,
} from './liquidPresenceGeometry';

const source = { x: 100, y: 80, width: 160, height: 160 };
const viewport = { x: 0, y: 0, width: 1280, height: 800 };
const destination = { x: 900, y: 500 };
const sample = (elapsed: number) =>
  samplePresenceMotion({ elapsed, source, viewport, destination });

describe('liquid gesture independent geometry review', () => {
  it('keeps source and travelling bead continuous at the renderer handoff', () => {
    const before = sample(460 - 0.001);
    const after = sample(460);
    expect(before.phase).toBe('split');
    expect(after.phase).toBe('flight');
    expect(Math.hypot(after.point.x - before.point.x, after.point.y - before.point.y)).toBeLessThan(
      0.02,
    );
    expect(after.diameter).toBeCloseTo(before.bud!.radius * 2, 2);
  });

  it('lands at the actual destination and never removes the core', () => {
    const atRest = sample(2400);
    expect(atRest.phase).toBe('dock');
    expect(atRest.point).toEqual(destination);
    expect(atRest.seat).toBe(1);
    for (let elapsed = 0; elapsed <= 2400; elapsed += 13) {
      const frame = sample(elapsed);
      expect(
        [frame.point.x, frame.point.y, frame.diameter, frame.angle, frame.stretch].every(
          Number.isFinite,
        ),
      ).toBe(true);
      expect(frame.diameter).toBeGreaterThan(0);
      expect(frame.separation).toBeGreaterThanOrEqual(0);
      expect(frame.separation).toBeLessThanOrEqual(1);
      const body = presenceBody(elapsed / 1000, 0.3, frame.separation);
      expect(body.startsWith('M')).toBe(true);
      expect(body).not.toMatch(/NaN|Infinity/);
    }
  });

  it('joins the returning bead back into the source without a position jump', () => {
    const motion = (elapsed: number) =>
      samplePresenceMotion({
        elapsed,
        source,
        viewport,
        destination,
        returning: true,
        from: destination,
      });
    const before = motion(620 - 0.001);
    const after = motion(620);
    expect(before.phase).toBe('return');
    expect(after.phase).toBe('merge');
    expect(Math.hypot(after.point.x - before.point.x, after.point.y - before.point.y)).toBeLessThan(
      0.02,
    );
    expect(motion(1040).phase).toBe('still');
    expect(motion(1040).separation).toBe(0);
    expect(motion(1040).bud).toBeNull();
  });

  it('can redirect from a current bead rather than spawn a second body', () => {
    const current = sample(700).point;
    const redirected = samplePresenceMotion({
      elapsed: 0,
      source,
      viewport,
      destination: { x: 400, y: 90 },
      from: current,
    });
    expect(redirected.phase).toBe('flight');
    expect(redirected.point.x).toBeCloseTo(current.x);
    expect(redirected.point.y).toBeCloseTo(current.y);
    expect(redirected.bud).toBeNull();
  });

  it('handles coincident points and shifted visual viewports without invalid paths', () => {
    const point = { x: 44, y: 88 };
    for (const progress of [-1, 0, 0.5, 1, 2]) {
      const curve = presenceCurve(point, point, progress, {
        x: 10,
        y: 50,
        width: 390,
        height: 600,
      });
      expect([curve.x, curve.y, curve.angle].every(Number.isFinite)).toBe(true);
    }
    for (const amount of [0, 0.25, 1])
      expect(presenceSeat(64, amount, 12)).not.toMatch(/NaN|Infinity/);
  });

  it('does not treat invalid or entirely offscreen targets as visible', () => {
    expect(validPresenceRect({ ...source, width: 0 })).toBe(false);
    expect(validPresenceRect({ ...source, y: NaN })).toBe(false);
    expect(validPresenceRect(null)).toBe(false);
    expect(visiblePresenceRect({ x: -100, y: 0, width: 10, height: 10 }, viewport)).toBe(false);
    expect(visiblePresenceRect({ x: 0, y: 900, width: 10, height: 10 }, viewport)).toBe(false);
    expect(visiblePresenceRect(source, viewport)).toBe(true);
  });

  it('chooses an unobscuring seat above targets near the screen bottom', () => {
    const target = { x: 40, y: 740, width: 120, height: 44 };
    const seat = presenceLanding(target, viewport);
    expect(seat.side).toBe('top');
    expect(seat.y).toBeLessThan(target.y);
    expect(seat.width).toBeLessThanOrEqual(84);
  });

  it('keeps the landing inside the viewport for a tall partly clipped editor', () => {
    const seat = presenceLanding({ x: 40, y: -1200, width: 600, height: 3000 }, viewport);
    expect(seat.y).toBeGreaterThanOrEqual(16);
    expect(seat.y).toBeLessThanOrEqual(viewport.height - 16);
  });

  it('changes direction during the neck phase without resetting the current shape', () => {
    const origin = sample(180);
    const redirected = samplePresenceMotion({
      elapsed: 0,
      source,
      viewport,
      destination: { x: 20, y: 500 },
      origin,
    });
    expect(redirected.bud).toEqual(origin.bud);
    expect(redirected.point.x).toBeCloseTo(origin.point.x);
    expect(redirected.point.y).toBeCloseTo(origin.point.y);
    expect(redirected.separation).toBe(origin.separation);
  });
});
