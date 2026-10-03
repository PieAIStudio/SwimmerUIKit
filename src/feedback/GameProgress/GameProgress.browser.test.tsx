import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GameProgress } from './GameProgress';
import {
  getLiquidGooeyBudget,
  resetLiquidGooeyBudgetForTests,
  setLiquidGooeyBudget,
} from '../../liquid/budget';
import { progressFrontPath } from './geometry';
import { attachProgress } from './controller';
import '../../styles.css';
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  host = document.createElement('div');
  host.style.width = '420px';
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  resetLiquidGooeyBudgetForTests();
  vi.restoreAllMocks();
});
const render = async (value: number, max = 100) => {
  await act(async () =>
    root.render(
      <StrictMode>
        <GameProgress label="Progress" value={value} max={max} showValue />
      </StrictMode>,
    ),
  );
};
const svg = () => host.querySelector('svg')!;
const front = () => host.querySelector('[data-progress-front]')!;

it('runs a value transition to the 600ms boundary and schedules nothing afterwards', () => {
  const frames = new Map<number, FrameRequestCallback>();
  let ticket = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++ticket, callback);
    return ticket;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  vi.spyOn(performance, 'now').mockReturnValue(0);
  host.innerHTML =
    '<div style="width:400px;height:10px"><svg><path data-progress-track/><path data-progress-clip/><path data-progress-front/></svg></div>';
  const element = host.querySelector('svg')!;
  const instance = attachProgress(element, 0, 0, true);
  expect(frames.size).toBe(0);
  instance.update(1);
  const advance = (time: number) => {
    const pending = [...frames];
    frames.clear();
    for (const [, callback] of pending) callback(time);
  };
  advance(300);
  expect(element.dataset.progressMotion).toBe('moving');
  expect(element.querySelector('[data-progress-front]')?.getAttribute('d')).toContain('C');
  expect(frames.size).toBe(1);
  advance(600);
  expect(element.dataset.progressMotion).toBe('static');
  expect(frames.size).toBe(0);
  const settled = element.querySelector('[data-progress-front]')?.getAttribute('d');
  advance(1200);
  expect(element.querySelector('[data-progress-front]')?.getAttribute('d')).toBe(settled);
  instance.dispose();
});

it('moves the curved meniscus for a bounded interval, then performs no idle writes or filter work', async () => {
  setLiquidGooeyBudget({ maxAnimatedGroups: 0, maxFilterArea: 0 });
  await render(0);
  expect(front().getAttribute('d')).toBe('M0 0Z');
  expect(host.querySelector('[role=progressbar]')!.getBoundingClientRect().height).toBe(10);
  await render(65);
  expect(host.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')).toBe('65');
  await expect.poll(() => svg().dataset.progressMotion).toBe('moving');
  await expect.poll(() => front().getAttribute('d')).toMatch(/C/);
  await expect.poll(() => svg().dataset.progressMotion).toBe('static');
  const stable = front().getAttribute('d');
  let mutations = 0;
  const observer = new MutationObserver((records) => (mutations += records.length));
  observer.observe(svg(), { attributes: true, subtree: true });
  await new Promise((resolve) => setTimeout(resolve, 180));
  observer.disconnect();
  expect(mutations).toBe(0);
  expect(front().getAttribute('d')).toBe(stable);
  expect(host.querySelectorAll('filter')).toHaveLength(0);
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
  await render(100);
  await expect.poll(() => svg().dataset.progressMotion).toBe('static');
  expect(front().getAttribute('d')).not.toContain('C');
});
it('snaps immediately for reduced motion and clamps invalid native values', async () => {
  const original = window.matchMedia.bind(window);
  vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
    query === '(prefers-reduced-motion: reduce)'
      ? {
          ...original(query),
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }
      : original(query),
  );
  await render(0);
  await render(63);
  expect(svg().dataset.progressMotion).toBe('static');
  const width = Number(svg().getAttribute('viewBox')!.split(' ')[2]) - 8;
  expect(front().getAttribute('d')).toBe(progressFrontPath(width, 0.63));
  await render(300, 200);
  expect(host.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')).toBe('200');
  await render(Number.NaN, 0);
  expect(host.querySelector('[role=progressbar]')?.getAttribute('aria-valuemax')).toBe('100');
  expect(front().getAttribute('d')).toBe('M0 0Z');
});
it('settles latest values across resize, interruption and hidden-page suspension', async () => {
  await render(5);
  await render(90);
  await render(22);
  host.style.width = '300px';
  await expect.poll(() => Number(svg().getAttribute('viewBox')!.split(' ')[2])).toBeLessThan(320);
  await expect.poll(() => svg().dataset.progressMotion).toBe('static');
  await render(80);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(svg().dataset.progressMotion).toBe('static');
  await act(async () => root.unmount());
  expect(getLiquidGooeyBudget().activeGroups).toBe(0);
});
