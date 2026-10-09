import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MIN_PRESS_HOLD_MS, observePress } from './observePress';

/** Real time on purpose: the hold is a real timer, and the release is measured on the clock. */
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const microtask = () => Promise.resolve();

let target: HTMLButtonElement;
let events: Array<{ pressed: boolean; at: number }>;
let dispose: (() => void) | undefined;

beforeEach(() => {
  target = document.createElement('button');
  document.body.append(target);
  events = [];
  dispose = observePress(target, (pressed) => events.push({ pressed, at: performance.now() }));
});

afterEach(() => {
  dispose?.();
  dispose = undefined;
  target.remove();
});

const pointer = (type: string, pointerId = 1) =>
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, pointerId }),
  );
const key = (type: 'keydown' | 'keyup', name: string) =>
  target.dispatchEvent(new KeyboardEvent(type, { key: name, bubbles: true, cancelable: true }));
/** A pointerdown begins its press in a microtask, after the event has finished dispatching. */
async function press(pointerId = 1) {
  pointer('pointerdown', pointerId);
  await microtask();
}
const last = () => events[events.length - 1]!;
const heldFor = () => last().at - events[0]!.at;

describe('minimum press hold', () => {
  it('keeps a fast tap pressed for the full minimum, then releases', async () => {
    await press();
    await wait(20);
    pointer('pointerup');
    expect(events.map((event) => event.pressed)).toEqual([true]);
    await wait(MIN_PRESS_HOLD_MS + 40);
    expect(events.map((event) => event.pressed)).toEqual([true, false]);
    expect(heldFor()).toBeGreaterThanOrEqual(MIN_PRESS_HOLD_MS - 5);
  });

  it('releases a long press at the moment of pointerup', async () => {
    await press();
    await wait(MIN_PRESS_HOLD_MS + 60);
    const lifted = performance.now();
    pointer('pointerup');
    expect(last().pressed).toBe(false);
    expect(last().at - lifted).toBeLessThan(20);
  });

  it('releases a cancelled pointer at once, inside the hold', async () => {
    await press();
    await wait(20);
    const cancelled = performance.now();
    pointer('pointercancel');
    expect(last().pressed).toBe(false);
    expect(last().at - cancelled).toBeLessThan(20);
  });

  it('releases at once when a release is prevented, which counts as a cancel', async () => {
    const prevent = (event: Event) => event.preventDefault();
    document.addEventListener('pointerup', prevent, { capture: true, once: true });
    await press();
    await wait(20);
    pointer('pointerup');
    document.removeEventListener('pointerup', prevent, { capture: true });
    expect(events.map((event) => event.pressed)).toEqual([true, false]);
    expect(heldFor()).toBeLessThan(MIN_PRESS_HOLD_MS);
  });

  it('never begins a press whose pointerdown was prevented', async () => {
    const prevent = (event: Event) => event.preventDefault();
    document.addEventListener('pointerdown', prevent, { capture: true, once: true });
    await press();
    pointer('pointerup');
    await wait(MIN_PRESS_HOLD_MS + 20);
    expect(events).toEqual([]);
  });

  it('holds the Space and Enter presses to the same minimum', async () => {
    for (const name of [' ', 'Enter']) {
      events = [];
      key('keydown', name);
      await microtask();
      await wait(15);
      key('keyup', name);
      expect(events.map((event) => event.pressed)).toEqual([true]);
      await wait(MIN_PRESS_HOLD_MS + 40);
      expect(events.map((event) => event.pressed)).toEqual([true, false]);
      expect(heldFor()).toBeGreaterThanOrEqual(MIN_PRESS_HOLD_MS - 5);
    }
  });

  it('lets Escape cancel a keyboard press inside the hold', async () => {
    key('keydown', ' ');
    await microtask();
    key('keydown', 'Escape');
    expect(events.map((event) => event.pressed)).toEqual([true, false]);
  });

  it('ignores touch leave events that arrive after the lift', async () => {
    await press();
    await wait(20);
    pointer('pointerup');
    pointer('pointerleave');
    pointer('lostpointercapture');
    expect(events.map((event) => event.pressed)).toEqual([true]);
    await wait(MIN_PRESS_HOLD_MS + 40);
    expect(events.map((event) => event.pressed)).toEqual([true, false]);
  });

  it('still releases immediately when the pointer leaves during a long press', async () => {
    await press();
    await wait(MIN_PRESS_HOLD_MS + 20);
    pointer('pointerleave');
    expect(last().pressed).toBe(false);
  });

  it('does not let focus moving on from a click cut the hold short', async () => {
    const other = document.createElement('input');
    document.body.append(other);
    try {
      await press();
      await wait(20);
      pointer('pointerup');
      target.dispatchEvent(new FocusEvent('blur', { bubbles: true, relatedTarget: other }));
      expect(events.map((event) => event.pressed)).toEqual([true]);
      await wait(MIN_PRESS_HOLD_MS + 40);
      expect(events.map((event) => event.pressed)).toEqual([true, false]);
    } finally {
      other.remove();
    }
  });

  it('keeps the body down for a second press that lands inside the hold', async () => {
    await press(1);
    await wait(20);
    pointer('pointerup', 1);
    await wait(20);
    await press(2);
    await wait(MIN_PRESS_HOLD_MS + 20);
    expect(events.map((event) => event.pressed)).toEqual([true]);
    pointer('pointerup', 2);
    expect(events.map((event) => event.pressed)).toEqual([true, false]);
  });

  it('clears the pending release when torn down, with no late notification', async () => {
    await press();
    pointer('pointerup');
    dispose?.();
    dispose = undefined;
    expect(events.map((event) => event.pressed)).toEqual([true, false]);
    await wait(MIN_PRESS_HOLD_MS + 40);
    expect(events.map((event) => event.pressed)).toEqual([true, false]);
  });
});
