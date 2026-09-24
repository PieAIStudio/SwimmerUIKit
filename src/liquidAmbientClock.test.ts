import { afterEach, expect, it, vi } from 'vitest';
import { requestLiquidAmbient } from './liquidAmbientClock';
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('coalesces two courtesy painters and cancels the last wake without an immortal RAF', () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
  const raf = vi.fn((fn: FrameRequestCallback) => setTimeout(() => fn(performance.now()), 16));
  vi.stubGlobal('requestAnimationFrame', raf);
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  let a = 0,
    b = 0;
  let stopA = () => {},
    stopB = () => {};
  const paintA = () => {
    a++;
    stopA = requestLiquidAmbient(paintA);
  };
  const paintB = () => {
    b++;
    stopB = requestLiquidAmbient(paintB);
  };
  stopA = requestLiquidAmbient(paintA);
  stopB = requestLiquidAmbient(paintB);
  vi.advanceTimersByTime(1000);
  expect(a).toBeGreaterThan(8);
  expect(b).toBe(a);
  expect(raf.mock.calls.length).toBeLessThanOrEqual(13);
  stopA();
  stopB();
  expect(vi.getTimerCount()).toBe(0);
});
