import { act, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRoot, type Root } from 'react-dom/client';

import { LiquidGooeyEngine, type LiquidGooeyItemRegistration } from './liquidGooeyEngine';
import {
  getLiquidGooeyBudget,
  resetLiquidGooeyBudgetForTests,
  setLiquidGooeyBudget,
} from './liquidGooeyBudget';
import { LiquidGroup } from './LiquidGroup';
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
          <button style={{ width: '100%', height: '100%' }} type="button">
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

    const runFrame = (milliseconds: number): void => {
      now += milliseconds;
      vi.advanceTimersByTime(milliseconds);
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(now));
    };
    for (let i = 0; i < 60 && frames.size > 0; i += 1) runFrame(16);
    expect(engine.getDebugState().awake).toBe(false);
    expect(frames.size).toBe(0);
    const handlesAtSleep = nextHandle;
    runFrame(1_000);
    expect(nextHandle).toBe(handlesAtSleep);

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
          <button type="button">Snap me</button>
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
            <button type="button">Snap me</button>
          </LiquidGroup.Item>
        </LiquidGroup>,
      );
    });
    expect(item?.style.transform).toContain('80px');
    expect(group?.dataset.liquidMotion).toBe('reduced');
    expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  });

  it('falls back to filtered static rendering when the animation budget is full', () => {
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
    expect(engine.getDebugState()).toMatchObject({ mode: 'static', claimed: false });
    expect(registration.host.style.transform).toContain('80px');
    engine.dispose();
    group.remove();
  });
});
