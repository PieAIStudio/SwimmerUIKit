import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it } from 'vitest';
import { LiquidReveal } from './LiquidReveal';
import { LiquidAnchor } from './LiquidAnchor';
import {
  getLiquidGooeyBudget,
  resetLiquidGooeyBudgetForTests,
  setLiquidGooeyBudget,
} from './liquidGooeyBudget';
import './styles.css';
import './liquid-presence.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined, host: HTMLDivElement | undefined, origin: HTMLButtonElement | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  origin?.remove();
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  resetLiquidGooeyBudgetForTests();
});
async function mount(reduced = false, idleMotion: 'still' | 'breathe' = 'still') {
  host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:50px;top:50px;width:360px';
  origin = document.createElement('button');
  origin.style.cssText = 'position:fixed;left:480px;top:480px;width:64px;height:64px';
  document.body.append(host, origin);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <StrictMode>
        <LiquidReveal source={{ current: origin! }} reducedMotion={reduced} idleMotion={idleMotion}>
          <textarea aria-label="draft" defaultValue="keep me" />
        </LiquidReveal>
      </StrictMode>,
    ),
  );
}
it('draws then sleeps, preserves controls, and resize never replays the scene', async () => {
  await mount();
  await expect
    .poll(() => host!.querySelector('.game-ui-liquid-reveal')?.getAttribute('data-reveal-motion'))
    .toMatch(/drawing|settled/);
  await expect
    .poll(() => host!.querySelector('.game-ui-liquid-reveal')?.getAttribute('data-reveal-motion'), {
      timeout: 4000,
    })
    .toBe('settled');
  expect(host!.querySelector('textarea')!.value).toBe('keep me');
  expect(host!.getAnimations({ subtree: true })).toHaveLength(0);
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  await act(async () => {
    host!.style.width = '300px';
    await new Promise((done) => setTimeout(done, 30));
  });
  await expect.poll(() => host!.querySelector('svg')?.getAttribute('width')).toBe('300');
  expect(host!.getAnimations({ subtree: true })).toHaveLength(0);
});

it('opt-in perimeter flows while text and native hit boxes stay still, then stops without a lease', async () => {
  await mount(false, 'breathe');
  const frame = () => host!.querySelector<HTMLElement>('.game-ui-liquid-reveal')!;
  const outline = () => host!.querySelector('[data-reveal-outline]')!.getAttribute('d');
  await expect.poll(() => frame().dataset.revealAmbient, { timeout: 4000 }).toBe('flowing');
  const before = outline();
  const input = host!.querySelector('textarea')!;
  const rect = input.getBoundingClientRect().toJSON();
  await expect.poll(outline).not.toBe(before);
  expect(input.getBoundingClientRect().toJSON()).toEqual(rect);
  expect(input.value).toBe('keep me');
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  await act(async () =>
    root!.render(
      <LiquidReveal reducedMotion idleMotion="breathe">
        <textarea defaultValue="keep me" />
      </LiquidReveal>,
    ),
  );
  const stopped = outline();
  await new Promise((done) => setTimeout(done, 240));
  expect(outline()).toBe(stopped);
  expect(frame().dataset.revealAmbient).toBe('static');
});
it('zero budget and reduced motion leave an immediately usable still frame', async () => {
  setLiquidGooeyBudget(0);
  await mount(true);
  await expect
    .poll(() => host!.querySelector('.game-ui-liquid-reveal')?.getAttribute('data-reveal-motion'))
    .toBe('static');
  expect(host!.querySelector('textarea')!.value).toBe('keep me');
  expect(host!.getAnimations({ subtree: true })).toHaveLength(0);
});

it('enabling motion later never replays a surface already shown with reduced motion', async () => {
  await mount(true);
  await act(async () => {
    root!.render(
      <StrictMode>
        <LiquidReveal source={{ current: origin! }} reducedMotion={false}>
          <textarea aria-label="draft" defaultValue="keep me" />
        </LiquidReveal>
      </StrictMode>,
    );
    await new Promise((done) => setTimeout(done, 120));
  });
  expect(host!.getAnimations({ subtree: true })).toHaveLength(0);
  expect(getComputedStyle(host!.querySelector('.game-ui-liquid-reveal-content')!).opacity).toBe(
    '1',
  );
  expect(host!.querySelector('textarea')!.value).toBe('keep me');
});

it('a directly focused input is visible immediately and resizing never hides it again', async () => {
  await mount();
  await act(async () => {
    root!.render(
      <StrictMode>
        <LiquidReveal
          source={{ current: origin! }}
          surface="material"
          variant="input"
          revealKey="text"
        >
          <textarea key="direct-text" autoFocus aria-label="draft" defaultValue="keep me" />
        </LiquidReveal>
      </StrictMode>,
    );
  });
  const input = host!.querySelector('textarea')!;
  expect(document.activeElement).toBe(input);
  const visible = () =>
    getComputedStyle(host!.querySelector('.game-ui-liquid-reveal-content')!).opacity;
  expect(visible()).toBe('1');
  await act(async () => {
    host!.style.width = '300px';
    await new Promise((done) => setTimeout(done, 160));
  });
  expect(visible()).toBe('1');
  expect(input.value).toBe('keep me');
  expect(host!.getAnimations({ subtree: true })).toHaveLength(0);
});

it('focused text never becomes transparent when a new measurement arrives', async () => {
  await mount(false, 'breathe');
  const input = host!.querySelector('textarea')!;
  input.focus();
  await act(async () =>
    root!.render(
      <StrictMode>
        <LiquidReveal
          source={{ current: origin! }}
          surface="material"
          revealKey="focused-new-layout"
        >
          <textarea aria-label="draft" defaultValue="keep me" />
        </LiquidReveal>
      </StrictMode>,
    ),
  );
  await new Promise((done) => setTimeout(done, 200));
  expect(document.activeElement).toBe(input);
  expect(getComputedStyle(host!.querySelector('.game-ui-liquid-reveal-content')!).opacity).toBe(
    '1',
  );
  expect(host!.getAnimations({ subtree: true })).toHaveLength(0);
  expect(input.value).toBe('keep me');
});

it('pause and rerender retain the current material rather than flashing phase zero', async () => {
  await mount(false, 'breathe');
  const outline = () => host!.querySelector('[data-reveal-outline]')!.getAttribute('d');
  const ribbon = () => host!.querySelector('[data-reveal-ribbon]')!.getAttribute('d');
  await expect
    .poll(() => host!.querySelector<HTMLElement>('.game-ui-liquid-reveal')!.dataset.revealAmbient, {
      timeout: 4000,
    })
    .toBe('flowing');
  await new Promise((done) => setTimeout(done, 600));
  let pausedPath: string | null = null,
    pausedRibbon: string | null = null;
  await act(async () => {
    pausedPath = outline();
    pausedRibbon = ribbon();
    root!.render(
      <StrictMode>
        <LiquidReveal source={{ current: origin! }} idleMotion="still">
          <textarea aria-label="draft" defaultValue="keep me" />
        </LiquidReveal>
      </StrictMode>,
    );
  });
  expect(outline()).toBe(pausedPath);
  expect(ribbon()).toBe(pausedRibbon);
  await new Promise((done) => setTimeout(done, 220));
  expect(outline()).toBe(pausedPath);
  expect(host!.querySelector('[data-reveal-tip]')).toBeNull();
  expect(host!.getAnimations({ subtree: true })).toHaveLength(0);
  await act(async () => {
    root!.render(
      <StrictMode>
        <LiquidReveal source={{ current: origin! }} idleMotion="breathe">
          <textarea aria-label="draft" defaultValue="keep me" />
        </LiquidReveal>
      </StrictMode>,
    );
  });
  expect(outline()).toBe(pausedPath);
  await expect.poll(outline).not.toBe(pausedPath);
  expect(host!.querySelector('textarea')!.value).toBe('keep me');
});

it('material grows from the positioned source, not a fully visible panel at frame zero', async () => {
  host = document.createElement('div');
  origin = document.createElement('button');
  origin.style.cssText = 'position:fixed;right:30px;bottom:30px;width:64px;height:64px';
  document.body.append(host, origin);
  const source = { current: origin };
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <StrictMode>
        <LiquidAnchor source={source}>
          <LiquidReveal source={source} surface="material">
            <div style={{ width: 300, height: 200 }}>
              <button>Original action</button>
            </div>
          </LiquidReveal>
        </LiquidAnchor>
      </StrictMode>,
    ),
  );
  const element = () => document.querySelector<HTMLElement>('.game-ui-liquid-reveal')!;
  await expect.poll(() => element()?.dataset.revealMotion, { interval: 10 }).toBe('drawing');
  const shape = element().querySelector<SVGPathElement>('[data-reveal-body]')!;
  const animation = shape.getAnimations()[0]!;
  expect(animation).toBeDefined();
  const frames = (animation.effect as KeyframeEffect).getKeyframes();
  expect(frames.length).toBe(49);
  expect(frames[0]!.d).not.toBe(frames[48]!.d);
  const region = element().getBoundingClientRect();
  expect(region.x).toBeGreaterThan(0);
  expect(region.bottom).toBeLessThan(origin.getBoundingClientRect().top);
  animation.pause();
  animation.currentTime = 70;
  const small = shape.getBBox();
  expect(small.width).toBeLessThan(40);
  animation.currentTime = 530;
  expect(shape.getBBox().width).toBeGreaterThan(270);
  // Keyboard focus ends decorative delay but does not trigger the action.
  element().querySelector('button')!.focus();
  await expect.poll(() => element().dataset.revealMotion).toBe('settled');
  expect(element().getAnimations({ subtree: true })).toHaveLength(0);
  expect(getComputedStyle(element(), '::before').backgroundColor).toBe('rgba(0, 0, 0, 0)');
});
