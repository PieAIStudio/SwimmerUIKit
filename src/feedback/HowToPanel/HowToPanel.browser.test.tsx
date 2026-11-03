import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { HowToPanel } from './HowToPanel';
import { HelpLoop } from '../HelpLoop/HelpLoop';
import { FirstSessionOnboarding } from '../../game/FirstSessionOnboarding/FirstSessionOnboarding';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLElement | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  vi.restoreAllMocks();
});
async function mount(content: ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(content));
  return host;
}
const steps = [
  {
    media: <svg data-frame="moving-one" />,
    poster: <svg data-frame="still-one" />,
    caption: 'Join the same Wi-Fi.',
  },
  { media: <svg data-frame="moving-two" />, caption: 'Keep both devices nearby.' },
  { media: <svg data-frame="moving-three" />, caption: 'Confirm the connection.' },
];

it('keeps just one step mounted and supports keyboard and touch-sized next/previous buttons', async () => {
  const container = await mount(
    <HowToPanel label="Connect" previousLabel="Back" nextLabel="Next" steps={steps} />,
  );
  await expect.element(page.getByRole('img', { name: steps[0].caption })).toBeVisible();
  const next = container.querySelectorAll('button')[1]!;
  expect(next.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  await act(async () => next.click());
  await expect.element(page.getByRole('img', { name: steps[1].caption })).toBeVisible();
  expect(container.querySelector('[data-frame="moving-one"]')).toBeNull();
  await act(async () =>
    next.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }),
    ),
  );
  expect(next.disabled).toBe(true);
  await act(async () =>
    container
      .querySelector('button')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }),
      ),
  );
  await expect.element(page.getByRole('img', { name: steps[1].caption })).toBeVisible();
});

it('uses posters for the panel and onboarding and freezes media without a poster under reduced motion', async () => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  );
  const container = await mount(
    <>
      <HowToPanel label="Connect" previousLabel="Back" nextLabel="Next" steps={steps} />
      <FirstSessionOnboarding
        open
        onDismiss={() => {}}
        labels={{
          title: 'Welcome',
          badge: 'New',
          body: 'Get connected.',
          start: 'Start',
          skip: 'Skip',
          steps: [
            {
              title: 'Connect',
              body: steps[0].caption,
              media: steps[0].media,
              poster: steps[0].poster,
            },
          ],
        }}
      />
    </>,
  );
  expect(container.querySelectorAll('[data-frame="still-one"]')).toHaveLength(2);
  expect(container.querySelector('[data-frame="moving-one"]')).toBeNull();
  expect(container.querySelector('.is-playing')).toBeNull();
  await act(async () => container.querySelectorAll('button')[1]!.click());
  expect(container.querySelector('[data-frame="moving-two"]')).not.toBeNull();
  expect(container.querySelector('.is-playing')).toBeNull();
});

it('pauses author CSS animations off screen and resumes the same loop when visible', async () => {
  const container = await mount(
    <>
      <style>
        {
          '@keyframes help-test { to { opacity: .5; } } .help-test-mark { animation: help-test 1s infinite; }'
        }
      </style>
      <HelpLoop>
        <svg viewBox="0 0 320 180">
          <circle className="help-test-mark" cx="160" cy="90" r="20" />
        </svg>
      </HelpLoop>
    </>,
  );
  const loop = container.querySelector('.swimmer-help-loop')!;
  const mark = container.querySelector('circle')!;
  await expect.poll(() => loop.classList.contains('is-playing')).toBe(true);
  expect(getComputedStyle(mark).animationPlayState).toBe('running');
  await act(async () => {
    container.style.marginTop = '200vh';
  });
  await expect.poll(() => loop.classList.contains('is-playing')).toBe(false);
  expect(getComputedStyle(mark).animationPlayState).toBe('paused');
  await act(async () => loop.scrollIntoView());
  await expect.poll(() => loop.classList.contains('is-playing')).toBe(true);
});
