import { describe, expect, it } from 'vitest';

import {
  advanceBend,
  advanceMove,
  createBendState,
  createMoveState,
  MOVE_DEFAULTS,
  resolveBendOptions,
  resolveMoveOptions,
  type BendState,
  type MoveTarget,
} from './liquidGooeyMove';

const box = {
  x: 0,
  y: 0,
  w: 96,
  h: 44,
  r: [999, 999, 999, 999] as [number, number, number, number],
};

function step(
  state: ReturnType<typeof createMoveState>,
  target: MoveTarget,
  count: number,
  dt = 1 / 60,
) {
  const options = resolveMoveOptions(null);
  let frame = advanceMove(state, target, box, dt, options);
  for (let index = 1; index < count; index += 1) {
    frame = advanceMove(state, target, box, dt, options);
  }
  return frame;
}

describe('liquid-gooey Move adoption', () => {
  it('keeps the donor defaults and emits a stretched tail during a follow gesture', () => {
    expect(MOVE_DEFAULTS).toEqual({
      damping: 18,
      force: 0.5,
      stiffness: 380,
      stretch: 0.18,
      tail: 0.46,
    });

    const initial: MoveTarget = { cx: 48, cy: 22, scale: 1 };
    const state = createMoveState(initial);
    const frame = step(state, { cx: 300, cy: 22, scale: 1 }, 10);

    expect(frame.moving).toBe(true);
    expect(frame.tail.visible).toBe(true);
    expect(frame.tail.radius).toBeGreaterThan(0);
    expect(frame.tail.midARadius).toBeGreaterThan(0);
    expect(frame.tail.midBRadius).toBeGreaterThan(0);
    expect(frame.transform).toContain('rotate(');
  });

  it('lets the body and droplets settle back to one still silhouette', () => {
    const state = createMoveState({ cx: 48, cy: 22, scale: 1 });
    step(state, { cx: 300, cy: 22, scale: 1 }, 18);
    const frame = step(state, { cx: 300, cy: 22, scale: 1 }, 240);

    expect(frame.moving).toBe(false);
    expect(frame.tail.visible).toBe(false);
    expect(frame.tail.radius).toBe(0);
  });
});

describe('liquid-gooey Bend adoption', () => {
  it('keeps the donor vertical and horizontal knob defaults', () => {
    expect(resolveBendOptions(null)).toMatchObject({ vertical: 0.6, horizontal: 0.35 });
    expect(resolveBendOptions(null, { vertical: 0.2, horizontal: 0.8 })).toMatchObject({
      vertical: 0.2,
      horizontal: 0.8,
    });
  });

  it('bows and cap-deforms around the exact target centre without a tail', () => {
    const box = {
      x: 0,
      y: 0,
      w: 120,
      h: 64,
      r: [28, 28, 28, 28] as [number, number, number, number],
    };
    const start: MoveTarget = { cx: 60, cy: 32, scale: 1 };
    const target: MoveTarget = { cx: 300, cy: 160, scale: 1 };
    const state: BendState = createBendState(start);
    advanceBend(state, start, box, 1 / 60, resolveBendOptions(null));
    const frame = advanceBend(state, target, box, 1 / 60, resolveBendOptions(null));

    expect(frame.moving).toBe(true);
    expect(frame.bendX).toBeGreaterThan(0);
    expect(frame.bendY).toBeGreaterThan(0);
    expect(frame.path).toContain('Q');
    expect(frame.transform).toContain('translate(240 128)');

    let settled = frame;
    for (let index = 0; index < 240; index += 1) {
      settled = advanceBend(state, target, box, 1 / 60, resolveBendOptions(null));
    }
    expect(settled.moving).toBe(false);
    expect(settled.bendX).toBe(0);
    expect(settled.bendY).toBe(0);
    expect(settled.path).not.toContain('Q');
  });
});
