import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

import { GameSplash, useGameSplashDelay } from './GameSplash';
import './styles.css';

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
  vi.useRealTimers();
});
async function mount(content: React.ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(content));
}

it('enters on the tap once ready, and by itself for an app shell', async () => {
  const onStart = vi.fn();
  await mount(
    <GameSplash
      title="U"
      lines={[{ text: 'a' }]}
      progress={1}
      progressLabel="100%"
      ready
      startLabel="Start"
      onStart={onStart}
    />,
  );
  const button = host!.querySelector('button')!;
  expect(button.textContent).toBe('Start');
  await act(async () => button.click());
  expect(onStart).toHaveBeenCalledTimes(1);

  const auto = vi.fn();
  await act(async () =>
    root!.render(
      <GameSplash
        title="U"
        lines={[{ text: 'a' }]}
        progress={1}
        progressLabel="100%"
        ready
        autoStart
        onStart={auto}
      />,
    ),
  );
  expect(auto).toHaveBeenCalledTimes(1);
});

it('covers the screen', async () => {
  await mount(
    <GameSplash
      title="U"
      lines={[{ text: 'a' }]}
      progress={0.2}
      progressLabel="20%"
      ready={false}
    />,
  );
  const section = host!.querySelector('.game-ui-splash') as HTMLElement;
  const box = section.getBoundingClientRect();
  expect(box.width).toBe(window.innerWidth);
  expect(box.height).toBe(window.innerHeight);
});

function Delay({ waiting }: { waiting: boolean }) {
  return <p>{useGameSplashDelay(waiting, 2000) ? 'late' : 'quiet'}</p>;
}

it('shows a transition only once the wait has passed its delay', async () => {
  vi.useFakeTimers();
  await mount(<Delay waiting />);
  expect(host!.textContent).toBe('quiet');
  await act(async () => vi.advanceTimersByTime(1900));
  expect(host!.textContent).toBe('quiet');
  await act(async () => vi.advanceTimersByTime(200));
  expect(host!.textContent).toBe('late');
  await act(async () => root!.render(<Delay waiting={false} />));
  expect(host!.textContent).toBe('quiet');
});
