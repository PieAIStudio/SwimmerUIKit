import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useGameCardOrientation } from './gameCardOrientation';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let host: HTMLDivElement | undefined;
let latest: ReturnType<typeof useGameCardOrientation>;
let media: EventTarget & { matches: boolean };
let visible = true;
const permission = vi.fn<() => Promise<'granted' | 'denied'>>();
const originalVisibility = Object.getOwnPropertyDescriptor(document, 'visibilityState');

beforeEach(() => {
  permission.mockReset().mockResolvedValue('granted');
  class SyntheticSensor {
    static requestPermission = permission;
  }
  vi.stubGlobal('DeviceOrientationEvent', SyntheticSensor);
  media = Object.assign(new EventTarget(), { matches: false });
  vi.spyOn(window, 'matchMedia').mockImplementation(() => media as unknown as MediaQueryList);
  visible = true;
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (visible ? 'visible' : 'hidden'),
  });
});
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalVisibility) Object.defineProperty(document, 'visibilityState', originalVisibility);
  else Reflect.deleteProperty(document, 'visibilityState');
});
async function mount() {
  function Probe() {
    latest = useGameCardOrientation();
    return <button onClick={() => void latest.enable()}>Enable optional tilt</button>;
  }
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    ),
  );
}
async function sample(beta: number | null, gamma: number | null) {
  const event = Object.assign(new Event('deviceorientation'), { beta, gamma });
  await act(async () => window.dispatchEvent(event));
}
async function visibility(next: boolean) {
  visible = next;
  await act(async () => document.dispatchEvent(new Event('visibilitychange')));
}

it('never requests permission or reads a sensor on mount; an explicit action enables one owner', async () => {
  const add = vi.spyOn(window, 'addEventListener');
  await mount();
  expect(permission).not.toHaveBeenCalled();
  expect(add.mock.calls.filter(([type]) => type === 'deviceorientation')).toHaveLength(0);
  await act(async () => host!.querySelector('button')!.click());
  expect(permission).toHaveBeenCalledOnce();
  expect(latest.status).toBe('enabled');
  expect(add.mock.calls.filter(([type]) => type === 'deviceorientation')).toHaveLength(1);
  const clock = vi.spyOn(performance, 'now').mockReturnValue(100);
  await sample(70, 5);
  expect(latest.tilt).toEqual({ x: 0, y: 0 });
  clock.mockReturnValue(160);
  await sample(80, 15);
  expect(latest.tilt).toEqual({ x: 0.5, y: 0.5 });
  await sample(null, NaN);
  expect(latest.tilt).toEqual({ x: 0.5, y: 0.5 });
});

it('leaves denial as a state and never retries automatically', async () => {
  permission.mockResolvedValue('denied');
  await mount();
  await act(async () => {
    expect(await latest.enable()).toBe(false);
  });
  expect(latest.status).toBe('denied');
  expect(latest.tilt).toBeNull();
  await sample(60, 60);
  expect(latest.tilt).toBeNull();
  expect(permission).toHaveBeenCalledOnce();
});

it('does not request in an insecure or missing-capability context', async () => {
  vi.stubGlobal('isSecureContext', false);
  await mount();
  expect(latest.status).toBe('unavailable');
  await act(async () => {
    expect(await latest.enable()).toBe(false);
  });
  expect(permission).not.toHaveBeenCalled();
});

it.each(['disable', 'unmount', 'hidden', 'reduced'] as const)(
  'rejects a late permission result after %s',
  async (end) => {
    let finish!: (value: 'granted') => void;
    permission.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await mount();
    let result!: Promise<boolean>;
    await act(async () => {
      result = latest.enable();
    });
    expect(latest.status).toBe('requesting');
    await act(async () => {
      expect(await latest.enable()).toBe(false);
    });
    expect(permission).toHaveBeenCalledOnce();
    if (end === 'disable') await act(async () => latest.disable());
    if (end === 'unmount') {
      await act(async () => root!.unmount());
      root = undefined;
    }
    if (end === 'hidden') {
      await visibility(false);
      await visibility(true);
    }
    if (end === 'reduced') {
      media.matches = true;
      await act(async () =>
        media.dispatchEvent(Object.assign(new Event('change'), { matches: true })),
      );
    }
    await act(async () => {
      finish('granted');
      expect(await result).toBe(false);
    });
    if (end !== 'unmount') {
      expect(latest.status).not.toBe('enabled');
      expect(latest.tilt).toBeNull();
    }
  },
);

it('pauses hidden-page samples and recalibrates rather than retaining a stale tilt', async () => {
  const remove = vi.spyOn(window, 'removeEventListener');
  await mount();
  await act(async () => {
    await latest.enable();
  });
  const clock = vi.spyOn(performance, 'now').mockReturnValue(100);
  await sample(70, 5);
  clock.mockReturnValue(160);
  await sample(80, 15);
  expect(latest.tilt?.x).toBe(0.5);
  await visibility(false);
  expect(latest.tilt).toBeNull();
  await sample(100, 30);
  expect(latest.tilt).toBeNull();
  expect(remove.mock.calls.some(([type]) => type === 'deviceorientation')).toBe(true);
  await visibility(true);
  clock.mockReturnValue(220);
  await sample(100, 30);
  expect(latest.tilt).toEqual({ x: 0, y: 0 });
  expect(permission).toHaveBeenCalledOnce();
});
