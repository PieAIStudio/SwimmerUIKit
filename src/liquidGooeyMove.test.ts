import { describe, expect, it } from 'vitest';

import {
  advanceMove,
  createMoveState,
  MOVE_DEFAULTS,
  resolveMoveOptions,
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
