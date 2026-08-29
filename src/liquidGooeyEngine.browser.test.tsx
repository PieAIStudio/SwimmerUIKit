import { StrictMode, act, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRoot, type Root } from 'react-dom/client';

import { LiquidGooeyEngine, type LiquidGooeyItemRegistration } from './liquidGooeyEngine';
import {
  getLiquidGooeyBudget,
  resetLiquidGooeyBudgetForTests,
  setLiquidGooeyBudget,
} from './liquidGooeyBudget';
import { LiquidGroup } from './LiquidGroup';
import { GameProgress } from './GameDisplay';
import { GameSegmentedControl } from './GameSurfaces';
import './styles.css';

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

let mountedRoot: Root | null = null;
let mountedContainer: HTMLDivElement | null = null;

afterEach(async () => {
  await act(async () => mountedRoot?.unmount());
  mountedRoot = null;
  mountedContainer?.remove();
  mountedContainer = null;
  resetLiquidGooeyBudgetForTests();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function mount(node: ReactNode): Promise<HTMLDivElement> {
  mountedContainer = document.createElement('div');
  document.body.append(mountedContainer);
  mountedRoot = createRoot(mountedContainer);
  await act(async () => mountedRoot?.render(node));
  return mountedContainer;
}

function makeRegistration(): LiquidGooeyItemRegistration {
  const host = document.createElement('div');
  host.style.width = '64px';
  host.style.height = '64px';
  const blob = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  return { id: 'test-item', host, blob, config: { transition: { duration: 160 } } };
}

describe('LiquidGroup browser architecture', () => {
  it('paints the Morph silhouette when mounted inside React StrictMode', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const renderMorph = (merged: boolean): ReactNode => {
      const firstX = merged ? 24 : -12;
      const secondX = merged ? -24 : 12;
      return (
        <StrictMode>
          <LiquidGroup style={{ height: '120px', width: '240px' }}>
            <LiquidGroup.Item
              style={{
                height: '64px',
                left: '24px',
                position: 'absolute',
                top: '28px',
                width: '64px',
              }}
              transition="snappy"
              x={firstX}
            >
              <button
                style={{ border: '0', boxShadow: 'none', height: '100%', width: '100%' }}
                type="button"
              >
                A
              </button>
            </LiquidGroup.Item>
            <LiquidGroup.Item
              style={{
                height: '64px',
                left: '132px',
                position: 'absolute',
                top: '28px',
                width: '84px',
              }}
              transition="snappy"
              x={secondX}
            >
              <button
                style={{ border: '0', boxShadow: 'none', height: '100%', width: '100%' }}
                type="button"
              >
                B
              </button>
            </LiquidGroup.Item>
          </LiquidGroup>
        </StrictMode>
      );
    };

    const container = await mount(renderMorph(false));

    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });

    await act(async () => {
      mountedRoot?.render(renderMorph(true));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });

    const paths = [...container.querySelectorAll<SVGPathElement>('[data-liquid-gooey-blob]')];
    expect(paths).toHaveLength(2);
    expect(paths.every((path) => (path.getAttribute('d') ?? '').length > 0)).toBe(true);
    expect(console.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('liquid animation budget is insufficient'),
    );
  });

  it('keeps focus, hit testing, and focus styles on the unfiltered child DOM', async () => {
    const container = await mount(
      <LiquidGroup style={{ width: '240px', height: '120px' }}>
        <LiquidGroup.Item
          style={{
            position: 'absolute',
            top: '24px',
            left: '48px',
            width: '112px',
            height: '64px',
          }}
        >
          <button
            style={{
              background: 'transparent',
              border: '0',
              boxShadow: 'none',
              height: '100%',
              width: '100%',
            }}
            type="button"
          >
            Focus me
          </button>
        </LiquidGroup.Item>
      </LiquidGroup>,
    );
    const button = container.querySelector('button');
    const silhouette = container.querySelector<SVGElement>('[data-liquid-gooey-silhouette]');
    const filteredLayer = silhouette?.querySelector('[filter]');
    expect(button).not.toBeNull();
    expect(silhouette).not.toBeNull();
    expect(filteredLayer).not.toBeNull();

    button?.focus();
    expect(document.activeElement).toBe(button);
    const rect = button!.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)).toBe(
      button,
    );
    expect(button?.closest('[filter]')).toBeNull();
    expect(getComputedStyle(button!).filter).toBe('none');
    expect(getComputedStyle(button!).outlineStyle).toBe('solid');
    expect(getComputedStyle(button!).outlineWidth).toBe('3px');
    expect(silhouette?.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(silhouette!).pointerEvents).toBe('none');
  });
});

describe('LiquidGooeyEngine idle clock', () => {
  it('stops scheduling rAF after 500ms of stillness and wakes on a new target', () => {
    vi.useFakeTimers();
    let now = 0;
    let nextHandle = 0;
    const frames = new Map<number, FrameRequestCallback>();
    const requestFrame = (callback: FrameRequestCallback): number => {
      const handle = ++nextHandle;
      frames.set(handle, callback);
      return handle;
    };
    const cancelFrame = (handle: number): void => {
      frames.delete(handle);
    };
    const group = document.createElement('div');
    const content = document.createElement('div');
    const registration = makeRegistration();
    content.append(registration.host);
    group.append(content);
    document.body.append(group);

    const engine = new LiquidGooeyEngine({
      getGroup: () => group,
      getFilterArea: () => 20_000,
      now: () => now,
      requestFrame,
      cancelFrame,
    });
    engine.register(registration);

    let callbacks = 0;
    const runFrame = (milliseconds: number): void => {
      now += milliseconds;
      vi.advanceTimersByTime(milliseconds);
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => {
        callbacks += 1;
        callback(now);
      });
    };
    for (let i = 0; i < 60 && frames.size > 0; i += 1) runFrame(16);
    expect(engine.getDebugState().awake).toBe(false);
    expect(frames.size).toBe(0);
    const handlesAtSleep = nextHandle;
    const callbacksAtSleep = callbacks;
    runFrame(1_000);
    expect(nextHandle).toBe(handlesAtSleep);
    expect(callbacks - callbacksAtSleep).toBe(0);

    engine.update('test-item', { x: 40, transition: { duration: 120 } });
    expect(engine.getDebugState()).toMatchObject({ awake: true, mode: 'animated', claimed: true });
    engine.dispose();
    group.remove();
  });

  it('snaps reduced-motion groups without claiming an animation slot', async () => {
    const container = await mount(
      <LiquidGroup motion="reduced" style={{ width: '240px', height: '120px' }}>
        <LiquidGroup.Item
          style={{
            position: 'absolute',
            top: '24px',
            left: '48px',
            width: '112px',
            height: '64px',
          }}
          x={0}
        >
          <button
            style={{ background: 'transparent', border: '0', boxShadow: 'none' }}
            type="button"
          >
            Snap me
          </button>
        </LiquidGroup.Item>
      </LiquidGroup>,
    );
    const group = container.querySelector<HTMLElement>('[data-liquid-motion]');
    const item = container.querySelector<HTMLElement>('.game-ui-liquid-item');
    expect(group?.dataset.liquidMotion).toBe('reduced');
    expect(getLiquidGooeyBudget().activeGroups).toBe(0);

    await act(async () => {
      mountedRoot?.render(
        <LiquidGroup motion="reduced" style={{ width: '240px', height: '120px' }}>
          <LiquidGroup.Item
            style={{
              position: 'absolute',
              top: '24px',
              left: '48px',
              width: '112px',
              height: '64px',
            }}
            x={80}
          >
            <button
              style={{ background: 'transparent', border: '0', boxShadow: 'none' }}
              type="button"
            >
              Snap me
            </button>
          </LiquidGroup.Item>
        </LiquidGroup>,
      );
    });
    expect(item?.style.transform).toContain('80px');
    expect(group?.dataset.liquidMotion).toBe('reduced');
    expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  });

  it('falls back to filtered static rendering when the animation budget is full', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setLiquidGooeyBudget(0);
    const group = document.createElement('div');
    const registration = makeRegistration();
    group.append(registration.host);
    document.body.append(group);
    const engine = new LiquidGooeyEngine({
      getGroup: () => group,
      getFilterArea: () => 20_000,
      requestFrame: () => 1,
      cancelFrame: () => undefined,
    });
    engine.register(registration);
    engine.update('test-item', { x: 80, transition: { duration: 120 } });
    engine.update('test-item', { x: 100, transition: { duration: 120 } });
    expect(engine.getDebugState()).toMatchObject({ mode: 'static', claimed: false });
    expect(registration.host.style.transform).toContain('100px');
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('liquid animation budget is insufficient'),
    );
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('static rendering'));
    engine.dispose();
    group.remove();
  });

  it('renders Move tail circles, claims the shared budget, then releases it after settling', () => {
    vi.useFakeTimers();
    let now = 0;
    let nextHandle = 0;
    const frames = new Map<number, FrameRequestCallback>();
    const requestFrame = (callback: FrameRequestCallback): number => {
      const handle = ++nextHandle;
      frames.set(handle, callback);
      return handle;
    };
    const cancelFrame = (handle: number): void => {
      frames.delete(handle);
    };
    const group = document.createElement('div');
    const registration = makeRegistration();
    group.append(registration.host, registration.blob);
    document.body.append(group);
    const engine = new LiquidGooeyEngine({
      cancelFrame,
      follow: true,
      getFilterArea: () => 20_000,
      getGroup: () => group,
      now: () => now,
      requestFrame,
    });
    engine.register(registration);

    const runFrame = (milliseconds: number): void => {
      now += milliseconds;
      vi.advanceTimersByTime(milliseconds);
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(now));
    };
    runFrame(16);
    engine.update('test-item', { transition: { duration: 0 }, x: 180 });
    expect(engine.getDebugState()).toMatchObject({ claimed: true, mode: 'animated' });

    let largestTail = 0;
    for (let index = 0; index < 18; index += 1) {
      runFrame(16);
      const radius = Number(
        group
          .querySelector<SVGCircleElement>('[data-liquid-gooey-move-tail="lead"]')
          ?.getAttribute('r') ?? '0',
      );
      largestTail = Math.max(largestTail, radius);
    }
    expect(group.querySelectorAll('[data-liquid-gooey-move-tail]').length).toBe(3);
    expect(largestTail).toBeGreaterThan(0);

    for (let index = 0; index < 180 && frames.size > 0; index += 1) runFrame(16);
    expect(engine.getDebugState()).toMatchObject({ awake: false, claimed: false, mode: 'static' });
    engine.dispose();
    group.remove();
  });

  it('does not animate Move when the process-wide budget rejects the group', () => {
    setLiquidGooeyBudget(0);
    const group = document.createElement('div');
    const registration = makeRegistration();
    group.append(registration.host, registration.blob);
    document.body.append(group);
    const engine = new LiquidGooeyEngine({
      cancelFrame: () => undefined,
      follow: true,
      getFilterArea: () => 20_000,
      getGroup: () => group,
      requestFrame: () => 1,
    });
    engine.register(registration);
    engine.update('test-item', { transition: { duration: 0 }, x: 180 });
    expect(engine.getDebugState()).toMatchObject({ claimed: false, mode: 'static' });
    expect(
      group
        .querySelector<SVGCircleElement>('[data-liquid-gooey-move-tail="lead"]')
        ?.getAttribute('r'),
    ).toBe('0');
    engine.dispose();
    group.remove();
  });

  it('does not animate Move when the filter-area ceiling rejects the group', () => {
    setLiquidGooeyBudget({ maxFilterArea: 100 });
    const group = document.createElement('div');
    const registration = makeRegistration();
    group.append(registration.host, registration.blob);
    document.body.append(group);
    const engine = new LiquidGooeyEngine({
      cancelFrame: () => undefined,
      follow: true,
      getFilterArea: () => 20_000,
      getGroup: () => group,
      requestFrame: () => 1,
    });
    engine.register(registration);
    engine.update('test-item', { transition: { duration: 0 }, x: 180 });
    expect(engine.getDebugState()).toMatchObject({ claimed: false, mode: 'static' });
    expect(
      group
        .querySelector<SVGCircleElement>('[data-liquid-gooey-move-tail="lead"]')
        ?.getAttribute('r'),
    ).toBe('0');
    engine.dispose();
    group.remove();
  });
});

describe('Move target component content layers', () => {
  it('mounts both target components without the painted-child warning', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = await mount(
      <div>
        <GameSegmentedControl
          activeId="one"
          label="Mode"
          options={[
            { id: 'one', label: 'One' },
            { id: 'two', label: 'Two' },
          ]}
        />
        <GameProgress label="Progress" value={48} />
      </div>,
    );
    expect(container.querySelectorAll('[data-liquid-gooey-blob]').length).toBeGreaterThan(0);
    expect(warning).not.toHaveBeenCalledWith(
      expect.stringContaining('LiquidGroup.Item children should not have their own border'),
    );
    warning.mockRestore();
  });
});
