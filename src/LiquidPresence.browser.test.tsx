import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { LiquidPresence } from './LiquidPresence';
import type { LiquidPresenceProps } from './liquidPresenceTypes';
import {
  getLiquidGooeyBudget,
  resetLiquidGooeyBudgetForTests,
  setLiquidGooeyBudget,
  tryAcquireLiquidGooeyAnimation,
  releaseLiquidGooeyAnimation,
} from './liquidGooeyBudget';
import './styles.css';
import './liquid-presence.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement | undefined;
let target: HTMLButtonElement | undefined;
const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
const body = () => document.querySelector<HTMLElement>('.game-ui-liquid-presence')!;
const phase = () => body()?.dataset.liquidPhase;
const label = () => document.querySelector<HTMLElement>('.game-ui-liquid-presence-label')!;
let props: LiquidPresenceProps;

async function render(next: Partial<LiquidPresenceProps> = {}) {
  props = { ...props, ...next };
  await act(async () =>
    root!.render(
      <StrictMode>
        <LiquidPresence {...props} />
      </StrictMode>,
    ),
  );
}
async function mount() {
  host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:30px;bottom:40px';
  target = document.createElement('button');
  target.textContent = 'Real destination';
  target.style.cssText = 'position:fixed;right:40px;top:40px;width:110px;height:44px';
  document.body.append(host, target);
  root = createRoot(host);
  props = { size: 160, activity: 'idle', target: null };
  await render();
  return {
    key: 'one',
    label: 'Real destination',
    contextElement: target,
    getRect: vi.fn(() => target!.getBoundingClientRect()),
  };
}
afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  host?.remove();
  target?.remove();
  vi.restoreAllMocks();
  expect(document.querySelector('[data-presence-overlay]')).toBeNull();
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  resetLiquidGooeyBudgetForTests();
});

it('interactive guide clicks do not reopen the source launcher and focus survives a new destination', async () => {
  const guide = await mount();
  const launch = vi.fn(),
    next = vi.fn();
  const renderGuide = async (key: string) =>
    act(async () =>
      root!.render(
        <StrictMode>
          <button onClick={launch} aria-label="Source">
            <LiquidPresence
              size={76}
              target={{ ...guide, key }}
              guideContent={<button onClick={next}>Next place</button>}
            />
          </button>
        </StrictMode>,
      ),
    );
  await renderGuide('first');
  await expect.poll(() => label()?.hidden).toBe(false);
  const button = label().querySelector('button')!;
  button.focus();
  button.click();
  expect(next).toHaveBeenCalledTimes(1);
  expect(launch).not.toHaveBeenCalled();
  await renderGuide('second');
  expect(document.activeElement).toBe(button);
  await wait(300);
  expect(document.activeElement).toBe(button);
  expect(label().hidden).toBe(false);
  expect(document.querySelectorAll('[data-presence-overlay]').length).toBe(1);
});

it('a human-paced explanation does not expire while being read', async () => {
  const guide = await mount();
  const dismiss = vi.fn();
  await render({
    target: guide,
    guideContent: <button>Keep reading</button>,
    reducedMotion: true,
    onDismiss: dismiss,
  });
  await wait(12_300);
  expect(label().hidden).toBe(false);
  expect(dismiss).not.toHaveBeenCalled();
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  await act(async () =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })),
  );
  expect(dismiss).toHaveBeenCalledExactlyOnceWith('dismissed');
  expect(label().hidden).toBe(true);
}, 20_000);

it('a tall explanation and its liquid marker use the same final flipped side', async () => {
  const guide = await mount();
  target!.style.top = `${innerHeight - 160}px`;
  await render({
    target: guide,
    guideContent: <div style={{ height: 210 }}>Long explanation</div>,
    reducedMotion: true,
  });
  await expect
    .poll(() => {
      const destination = target!.getBoundingClientRect();
      const explanation = label().getBoundingClientRect();
      const seat = document.querySelector('[data-presence-seat-body]')!.getBoundingClientRect();
      return (
        explanation.bottom < destination.top &&
        seat.bottom < destination.top &&
        seat.top > explanation.bottom
      );
    })
    .toBe(true);
});

it('switching reduced motion off never replays a guide already delivered statically', async () => {
  const guide = await mount();
  await render({ target: guide, reducedMotion: true });
  await expect.poll(phase).toBe('dock');
  await render({ reducedMotion: false });
  expect(phase()).toBe('dock');
  await wait(100);
  expect(phase()).toBe('dock');
  expect(label().hidden).toBe(false);
});

it('a settled DOM guide has no per-frame layout polling', async () => {
  const guide = await mount();
  await render({ target: guide });
  await expect.poll(phase, { timeout: 3000 }).toBe('dock');
  await wait(80);
  guide.getRect.mockClear();
  await wait(180);
  expect(guide.getRect.mock.calls.length).toBe(0);
});

it('the source disappearing withdraws its guide and frees the animation lease', async () => {
  const guide = await mount();
  const dismissed = vi.fn();
  await render({ target: guide, onDismiss: dismissed });
  await expect.poll(phase, { timeout: 3000 }).toBe('dock');
  host!.hidden = true;
  await expect.poll(() => dismissed.mock.calls.length).toBe(1);
  expect(dismissed).toHaveBeenCalledWith('unavailable');
  expect(label().hidden).toBe(true);
});

it('an unchanged parent render never restarts the current gesture', async () => {
  const guide = await mount();
  await render({ target: guide });
  await expect.poll(phase, { timeout: 3000 }).toBe('dock');
  await render({ target: { ...guide }, colorFrom: '#14d2df' });
  expect(phase()).toBe('dock');
  expect(document.querySelectorAll('[data-presence-overlay]').length).toBe(1);
});

it('an observer wake with unchanged geometry writes no redundant source attributes', async () => {
  await mount();
  let mutations = 0;
  const observer = new MutationObserver((records) => {
    mutations += records.length;
  });
  observer.observe(body(), { attributes: true, subtree: true });
  try {
    document.dispatchEvent(new Event('visibilitychange'));
    await wait(100);
    expect(mutations).toBe(0);
  } finally {
    observer.disconnect();
  }
});

it('a disabled body provides a static destination, not a running flight', async () => {
  const guide = await mount();
  await render({ target: guide, activity: 'disabled' });
  expect(phase()).toBe('dock');
  expect(body().dataset.liquidMotion).toBe('static');
  expect(label().hidden).toBe(false);
});

it('a docked sheet gathers into the same bead before returning', async () => {
  const guide = await mount();
  await render({ target: guide });
  await expect.poll(phase, { timeout: 3000 }).toBe('dock');
  const before = document.querySelector('[data-presence-seat-body]')!.getBoundingClientRect();
  await render({ target: null });
  expect(phase()).toBe('gather');
  const after = document.querySelector('[data-presence-seat-body]')!.getBoundingClientRect();
  expect(Math.abs(before.width - after.width)).toBeLessThan(3);
  expect(label().hidden).toBe(true);
  await expect.poll(phase, { timeout: 3000 }).toBe('still');
});

it('a new request during gathering continues from the gathered bead, not the source', async () => {
  const guide = await mount();
  await render({ target: guide });
  await expect.poll(phase, { timeout: 3000 }).toBe('dock');
  await render({ target: null });
  expect(phase()).toBe('gather');
  const seat = document.querySelector('[data-presence-seat-body]')!.getBoundingClientRect();
  await render({ target: { ...guide, key: 'second' } });
  await expect.poll(phase).toBe('flight');
  const flight = document.querySelector('[data-presence-flight-body]')!.getBoundingClientRect();
  expect(Math.abs(flight.x + flight.width / 2 - (seat.x + seat.width / 2))).toBeLessThan(50);
  await expect.poll(phase, { timeout: 3000 }).toBe('dock');
});

it('an early cancellation retracts the existing neck instead of spawning a detached droplet', async () => {
  const guide = await mount();
  await render({ target: guide });
  await wait(150);
  expect(phase()).toBe('split');
  const bud = document.querySelector<SVGCircleElement>('[data-presence-bud]')!;
  const before = { x: bud.cx.baseVal.value, y: bud.cy.baseVal.value };
  await render({ target: null });
  expect(phase()).toBe('merge');
  expect(Math.hypot(before.x - bud.cx.baseVal.value, before.y - bud.cy.baseVal.value)).toBeLessThan(
    5,
  );
  await expect.poll(phase).toBe('still');
});

it('the label stays inside the viewport even when its projected range spans beyond both edges', async () => {
  const guide = await mount();
  await render({
    reducedMotion: true,
    target: {
      ...guide,
      getRect: () => ({ x: 25, y: -1200, width: innerWidth - 50, height: 3000 }),
    },
  });
  await expect.poll(() => label().hidden).toBe(false);
  await wait(80);
  const bounds = label().getBoundingClientRect();
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.bottom).toBeLessThanOrEqual(innerHeight);
});

it('dismiss observers cannot leave an abandoned guide or budget lease behind', async () => {
  const guide = await mount();
  const dismissed = vi.fn(() => {
    throw new Error('Observer failure');
  });
  await render({ target: guide, onDismiss: dismissed });
  await expect.poll(phase, { timeout: 3000 }).toBe('dock');
  await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  await expect.poll(phase, { timeout: 3000 }).toBe('still');
  expect(dismissed).toHaveBeenCalledTimes(1);
  expect(label().hidden).toBe(true);
});

it('visibility suspension stops geometry work and does not replay the settled gesture', async () => {
  const guide = await mount();
  await render({ target: guide });
  await expect.poll(phase, { timeout: 3000 }).toBe('dock');
  const original = Object.getOwnPropertyDescriptor(document, 'hidden');
  try {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    guide.getRect.mockClear();
    await wait(180);
    expect(guide.getRect.mock.calls.length).toBe(0);
    expect(getLiquidGooeyBudget().activeGroups).toBe(0);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(phase()).toBe('dock');
  } finally {
    if (original) Object.defineProperty(document, 'hidden', original);
    else Reflect.deleteProperty(document, 'hidden');
  }
});

it('opt-in living contour moves slowly without moving the native target or retaining a budget lease', async () => {
  await mount();
  await render({ idleMotion: 'breathe', size: 76 });
  const rect = body().getBoundingClientRect();
  const contour = body().querySelector('[data-presence-body]')!;
  const before = contour.getAttribute('d');
  let writes = 0;
  const observer = new MutationObserver((records) => {
    writes += records.length;
  });
  observer.observe(contour, { attributes: true, attributeFilter: ['d'] });
  await wait(520);
  observer.disconnect();
  expect(contour.getAttribute('d')).not.toBe(before);
  expect(writes).toBeGreaterThan(1);
  expect(writes).toBeLessThanOrEqual(8);
  expect(body().getBoundingClientRect().toJSON()).toEqual(rect.toJSON());
  expect(body().dataset.activity).toBe('idle');
  expect(body().dataset.liquidMotion).toBe('ambient');
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  expect(
    [...body().querySelectorAll<SVGElement>('[data-presence-satellite]')].every(
      (node) => node.style.display === 'none',
    ),
  ).toBe(true);
});

it('reduced motion and zero budget override ambient motion, and turning idle off cancels its timed wake', async () => {
  await mount();
  await render({ idleMotion: 'breathe', reducedMotion: true });
  const contour = body().querySelector('[data-presence-body]')!;
  let before = contour.getAttribute('d');
  await wait(180);
  expect(contour.getAttribute('d')).toBe(before);
  await render({ reducedMotion: false });
  await wait(160);
  await render({ idleMotion: 'still' });
  before = contour.getAttribute('d');
  await wait(200);
  expect(contour.getAttribute('d')).toBe(before);
  setLiquidGooeyBudget(0);
  await render({ idleMotion: 'breathe' });
  before = contour.getAttribute('d');
  await wait(160);
  expect(contour.getAttribute('d')).toBe(before);
  expect(body().dataset.liquidMotion).toBe('static');
});

it('ambient does not claim audio and yields to a native modal then resumes after closure', async () => {
  await mount();
  await render({ idleMotion: 'breathe' });
  const dialog = document.createElement('dialog');
  document.body.append(dialog);
  try {
    dialog.showModal();
    await wait(200);
    expect(body().dataset.liquidMotion).toBe('static');
    expect(getLiquidGooeyBudget().activeGroups).toBe(0);
    dialog.close();
    await expect.poll(() => body().dataset.liquidMotion).toBe('ambient');
    expect(body().dataset.activity).toBe('idle');
  } finally {
    dialog.remove();
  }
});

it('ambient yields to a real control lease and resumes without a user having to wake it again', async () => {
  await mount();
  expect(tryAcquireLiquidGooeyAnimation(1000)).toBe(true);
  await render({ idleMotion: 'breathe' });
  expect(body().dataset.liquidMotion).toBe('static');
  expect(getLiquidGooeyBudget().activeGroups).toBe(1);
  releaseLiquidGooeyAnimation();
  await expect.poll(() => body().dataset.liquidMotion).toBe('ambient');
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
});

it('editor-attached review remains when the real target is clicked; ordinary guidance still dismisses', async () => {
  const guide = await mount();
  const dismissed = vi.fn();
  await render({
    target: guide,
    reducedMotion: true,
    dismissOnTargetClick: false,
    guideContent: <p>Keep the review</p>,
    onDismiss: dismissed,
  });
  target!.click();
  expect(dismissed).not.toHaveBeenCalled();
  expect(label().hidden).toBe(false);
  await render({ dismissOnTargetClick: true });
  target!.click();
  expect(dismissed).toHaveBeenCalledWith('dismissed');
});

it('expanded review is bounded to the viewport and retains native editing controls', async () => {
  const guide = await mount();
  await render({
    target: guide,
    reducedMotion: true,
    guideSize: 'expanded',
    guideContent: <textarea aria-label="review draft" defaultValue="My version" />,
  });
  await expect.poll(() => label().hidden).toBe(false);
  await wait(100);
  const bounds = label().getBoundingClientRect();
  expect(bounds.width).toBeLessThanOrEqual(Math.min(420, innerWidth - 32));
  expect(bounds.height).toBeLessThanOrEqual(innerHeight * 0.65);
  expect(label().querySelector('textarea')?.value).toBe('My version');
});

it('an expanded review does not cover its real target when neither side fits all its content', async () => {
  const guide = await mount();
  target!.style.top = '45vh';
  await render({
    target: guide,
    reducedMotion: true,
    guideSize: 'expanded',
    guideContent: <div style={{ height: 700 }}>A long review, still beside the original</div>,
  });
  await wait(150);
  const source = target!.getBoundingClientRect(),
    card = label().getBoundingClientRect();
  expect(
    card.bottom <= source.top ||
      card.top >= source.bottom ||
      card.left >= source.right ||
      card.right <= source.left,
  ).toBe(true);
  expect(card.top).toBeGreaterThanOrEqual(0);
  expect(card.bottom).toBeLessThanOrEqual(innerHeight);
});

it('interactive review owns Escape and IME while ordinary outside dismissal remains available', async () => {
  const guide = await mount(),
    dismissed = vi.fn();
  await render({
    target: guide,
    reducedMotion: true,
    guideContent: <textarea />,
    onDismiss: dismissed,
  });
  label()
    .querySelector('textarea')!
    .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(dismissed).not.toHaveBeenCalled();
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true }),
  );
  expect(dismissed).not.toHaveBeenCalled();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(dismissed).toHaveBeenCalledTimes(1);
});
