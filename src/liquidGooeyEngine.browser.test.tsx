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
import { LIQUID_GOOEY_WAVINESS_MAX_FRACTION } from './liquidGooeyWaviness';
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

async function waitFrames(count: number): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => {
      let remaining = Math.max(1, count);
      const tick = (): void => {
        remaining -= 1;
        if (remaining <= 0) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });
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

  it('renders static waviness and expands the measured filter area', async () => {
    const container = await mount(
      <div>
        <LiquidGroup
          data-testid="calm-liquid"
          style={{ height: '120px', width: '240px' }}
          waviness={0}
        >
          <LiquidGroup.Item
            style={{
              height: '64px',
              left: '24px',
              position: 'absolute',
              top: '28px',
              width: '64px',
            }}
          >
            <button type="button">A</button>
          </LiquidGroup.Item>
        </LiquidGroup>
        <LiquidGroup
          data-testid="wavy-liquid"
          style={{ height: '120px', width: '240px' }}
          waviness={6}
          wavinessFreq={0.018}
        >
          <LiquidGroup.Item
            style={{
              height: '64px',
              left: '24px',
              position: 'absolute',
              top: '28px',
              width: '64px',
            }}
          >
            <button type="button">B</button>
          </LiquidGroup.Item>
        </LiquidGroup>
      </div>,
    );

    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });

    const calmFilter = container.querySelector('[data-testid="calm-liquid"] filter');
    const wavyFilter = container.querySelector('[data-testid="wavy-liquid"] filter');
    const calmWidth = Number(calmFilter?.getAttribute('width') ?? 0);
    const wavyWidth = Number(wavyFilter?.getAttribute('width') ?? 0);
    const calmHeight = Number(calmFilter?.getAttribute('height') ?? 0);
    const wavyHeight = Number(wavyFilter?.getAttribute('height') ?? 0);
    const wavyNoise = container.querySelector('[data-testid="wavy-liquid"] feTurbulence');
    const wavyDisplacement = container.querySelector(
      '[data-testid="wavy-liquid"] feDisplacementMap',
    );
    const wavyEdgeBlur = container.querySelector(
      '[data-testid="wavy-liquid"] feGaussianBlur[in="shape-displaced"]',
    );
    const paths = [...container.querySelectorAll<SVGPathElement>('[data-liquid-gooey-blob]')];

    expect(wavyWidth).toBeGreaterThan(calmWidth);
    expect(wavyHeight).toBeGreaterThan(calmHeight);
    expect(wavyNoise?.getAttribute('baseFrequency')).toBe('0.018');
    expect(wavyNoise?.getAttribute('seed')).toBe('7');
    expect(wavyDisplacement?.getAttribute('result')).toBe('shape-displaced');
    expect(wavyEdgeBlur?.getAttribute('stdDeviation')).toBe('0.5');
    expect(wavyEdgeBlur?.getAttribute('result')).toBe('shape');
    expect(container.querySelector('[data-testid="calm-liquid"] feTurbulence')).toBeNull();
    expect(paths).toHaveLength(2);
    expect(paths.every((path) => (path.getAttribute('d') ?? '').length > 0)).toBe(true);
  });

  it('draws offset-only inset from the anti-aliased silhouette and skips BINARIZE', async () => {
    const surface = (testId: string, shadow: string, stroke?: string) => (
      <LiquidGroup
        data-testid={testId}
        shadow={shadow}
        style={{ height: '64px', position: 'relative', width: '160px' }}
        waviness={6}
        {...(stroke === undefined ? {} : { stroke })}
      >
        <LiquidGroup.Item
          style={{ height: '40px', left: '12px', position: 'absolute', top: '12px', width: '80px' }}
        >
          {null}
        </LiquidGroup.Item>
      </LiquidGroup>
    );
    const container = await mount(
      <div>
        {surface(
          'inset-only',
          '0 13px 26px rgba(76, 52, 28, 0.22), inset 0 2px 0 rgba(255, 255, 255, 0.42)',
        )}
        {surface(
          'inset-and-stroke',
          'inset 0 2px 0 rgba(255, 255, 255, 0.42)',
          '1px solid rgba(90, 64, 42, 0.28)',
        )}
        {surface('spread-shadow', '0 0 0 4px rgba(76, 52, 28, 0.22)')}
      </div>,
    );
    await waitFrames(2);

    const binarizeOf = (testId: string) =>
      [...container.querySelectorAll(`[data-testid="${testId}"] feColorMatrix`)].find((node) =>
        (node.getAttribute('values') ?? '').includes('60 -29.5'),
      );
    const insetOffset = container.querySelector('[data-testid="inset-only"] feOffset[dy="2"]');
    const insetBand = [
      ...container.querySelectorAll('[data-testid="inset-only"] feComposite'),
    ].find((node) => node.getAttribute('operator') === 'out');

    expect(binarizeOf('inset-only')).toBeUndefined();
    expect(insetOffset?.getAttribute('in')).toBe('shape');
    expect(insetBand?.getAttribute('in')).toBe('shape');
    expect(binarizeOf('inset-and-stroke')).toBeDefined();
    expect(binarizeOf('spread-shadow')).toBeDefined();
    const strokeInsetOffset = container.querySelector(
      '[data-testid="inset-and-stroke"] feOffset[dy="2"]',
    );
    expect(strokeInsetOffset?.getAttribute('in')).toBe('shape');
  });

  it('clamps thin surfaces by their shorter side and preserves larger surfaces', async () => {
    const surface = (testId: string, width: string, height: string, clamp?: number | false) => (
      <LiquidGroup
        data-testid={testId}
        style={{ height, position: 'relative', width }}
        waviness={6}
        {...(clamp === undefined ? {} : { wavinessClamp: clamp })}
      >
        <LiquidGroup.Item style={{ inset: 0, position: 'absolute' }}>{null}</LiquidGroup.Item>
      </LiquidGroup>
    );
    const container = await mount(
      <div>
        {surface('thin-liquid', '240px', '14px')}
        {surface('control-liquid', '240px', '52px')}
        {surface('blob-liquid', '150px', '150px')}
        {surface('explicit-liquid', '240px', '14px', false)}
      </div>,
    );

    await waitFrames(2);

    const readWaviness = (testId: string): number =>
      Number(
        container.querySelector(`[data-testid="${testId}"]`)?.getAttribute('data-liquid-waviness'),
      );
    const readScale = (testId: string): number =>
      Number(
        container
          .querySelector(`[data-testid="${testId}"] feDisplacementMap`)
          ?.getAttribute('scale'),
      );

    expect(readWaviness('thin-liquid')).toBeCloseTo(14 * LIQUID_GOOEY_WAVINESS_MAX_FRACTION);
    expect(readScale('thin-liquid')).toBeCloseTo(14 * LIQUID_GOOEY_WAVINESS_MAX_FRACTION * 2);
    expect(readWaviness('control-liquid')).toBe(6);
    expect(readWaviness('blob-liquid')).toBe(6);
    expect(readWaviness('explicit-liquid')).toBe(6);
    expect(readScale('explicit-liquid')).toBe(12);
  });

  it('cross-blurs the content layer during Morph and sharpens it at rest', async () => {
    const renderMorph = (x: number): ReactNode => (
      <LiquidGroup style={{ height: '140px', width: '320px' }} waviness={0}>
        <LiquidGroup.Item
          morph={{ contentBlur: 7, shape: true }}
          style={{ height: '64px', left: '24px', position: 'absolute', top: '38px', width: '96px' }}
          transition={{ duration: 240, ease: 'linear' }}
          x={x}
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
            Inside
          </button>
        </LiquidGroup.Item>
      </LiquidGroup>
    );

    const container = await mount(renderMorph(0));
    await waitFrames(3);
    await act(async () => {
      mountedRoot?.render(renderMorph(160));
    });
    await waitFrames(4);

    const item = container.querySelector<HTMLElement>('.game-ui-liquid-item');
    const button = container.querySelector<HTMLButtonElement>('button');
    const silhouette = container.querySelector<SVGGElement>('[data-liquid-gooey-silhouette] g');
    expect(item?.style.filter).toContain('blur(');
    expect(button?.style.filter).toBe('');
    expect(silhouette?.getAttribute('filter')).toContain('url(#');
    expect(silhouette?.style.filter).toBe('');

    await waitFrames(180);
    expect(item?.style.filter).toBe('');
  });

  it('keeps Bend content glued to the observed rect and publishes all four CSS variables', async () => {
    const renderBend = (shifted: boolean): ReactNode => (
      <LiquidGroup style={{ height: '160px', width: '360px' }} waviness={0}>
        <LiquidGroup.Item
          bend={{ horizontal: 0.35, vertical: 0.6 }}
          effect="bend"
          style={{ left: '24px', position: 'absolute', top: '42px' }}
        >
          <button
            data-testid="bend-content"
            style={{
              background: 'transparent',
              border: '0',
              boxShadow: 'none',
              height: '64px',
              transform: shifted ? 'translate(180px, 20px)' : 'translate(0, 0)',
              width: '120px',
            }}
            type="button"
          >
            Glued
          </button>
        </LiquidGroup.Item>
      </LiquidGroup>
    );

    const container = await mount(renderBend(false));
    await waitFrames(3);
    await act(async () => {
      mountedRoot?.render(renderBend(true));
    });
    await waitFrames(4);

    const item = container.querySelector<HTMLElement>('.game-ui-liquid-item');
    const button = container.querySelector<HTMLButtonElement>('[data-testid="bend-content"]');
    const blob = container.querySelector<SVGPathElement>('[data-liquid-gooey-blob]');
    expect(item?.style.transform).toBe('');
    expect(item?.style.getPropertyValue('--lg-bend-x')).not.toBe('');
    expect(item?.style.getPropertyValue('--lg-bend-y')).not.toBe('');
    expect(item?.style.getPropertyValue('--lg-bend-xn')).not.toBe('');
    expect(item?.style.getPropertyValue('--lg-bend-yn')).not.toBe('');
    expect(blob?.getAttribute('d')).toContain('Q');
    expect(container.querySelector('[data-liquid-gooey-move-tail]')).toBeNull();
    expect(button?.getBoundingClientRect().width).toBeGreaterThan(0);

    await act(async () => {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 1200);
      });
    });
    expect(item?.style.getPropertyValue('--lg-bend-x')).toBe('0px');
    expect(item?.style.getPropertyValue('--lg-bend-y')).toBe('0px');
  });

  it('counts Morph content blur and Bend bow slack in the 480,000px² filter-area readout', async () => {
    const renderBudget = (kind: 'plain' | 'morph' | 'bend' | 'all'): ReactNode => (
      <LiquidGroup data-testid={kind} style={{ height: '160px', width: '360px' }} waviness={0}>
        {(kind === 'plain' || kind === 'morph' || kind === 'all') && (
          <LiquidGroup.Item
            morph={kind === 'plain' ? { shape: false } : { contentBlur: 7, shape: true }}
            style={{
              height: '64px',
              left: '24px',
              position: 'absolute',
              top: '42px',
              width: '120px',
            }}
          >
            <span>Shape</span>
          </LiquidGroup.Item>
        )}
        {(kind === 'bend' || kind === 'all') && (
          <LiquidGroup.Item
            effect="bend"
            style={{
              height: '64px',
              left: kind === 'all' ? '190px' : '24px',
              position: 'absolute',
              top: '42px',
              width: '120px',
            }}
          >
            <span>Bend</span>
          </LiquidGroup.Item>
        )}
      </LiquidGroup>
    );
    const container = await mount(
      <div>
        {renderBudget('plain')}
        {renderBudget('morph')}
        {renderBudget('bend')}
        {renderBudget('all')}
      </div>,
    );
    await waitFrames(5);

    const read = (kind: string, name: string): number =>
      Number(container.querySelector<HTMLElement>(`[data-testid="${kind}"]`)?.dataset[name] ?? 0);
    const plainArea = read('plain', 'liquidFilterArea');
    const morphArea = read('morph', 'liquidFilterArea');
    const bendArea = read('bend', 'liquidFilterArea');
    const allArea = read('all', 'liquidFilterArea');
    expect(morphArea).toBeGreaterThan(plainArea);
    expect(bendArea).toBeGreaterThan(plainArea);
    expect(allArea).toBeGreaterThan(plainArea);
    expect(allArea).toBeLessThanOrEqual(480_000);
    expect(read('morph', 'liquidFeaturePadding')).toBeGreaterThan(0);
    expect(read('bend', 'liquidFeaturePadding')).toBeGreaterThan(0);
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
    expect(engine.getDebugState().filterArea).toBe(20_000);
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
