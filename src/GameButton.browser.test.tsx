import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GameButton } from './GameButton';
import { resetLiquidGooeyBudgetForTests } from './liquidGooeyBudget';
import './styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement | undefined;

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  resetLiquidGooeyBudgetForTests();
  vi.restoreAllMocks();
});

async function mount(node: ReactNode): Promise<HTMLDivElement> {
  host = document.createElement('div');
  host.style.width = '280px';
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(node));
  return host;
}

describe('liquid CTA keeps layout and native interaction', () => {
  it('fills the parent with both the real hit target and the decorative surface', async () => {
    const container = await mount(
      <GameButton fullWidth surface="liquid">
        开始学习
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    const surface = container.querySelector('.game-ui-liquid-surface')!;
    expect(button.getBoundingClientRect().width).toBeCloseTo(280, 0);
    expect(surface.getBoundingClientRect().width).toBeCloseTo(280, 0);
    const before = button.getBoundingClientRect().toJSON();
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('true');
    expect(button.getBoundingClientRect().toJSON()).toEqual(before);
    expect(getComputedStyle(button).transform).toBe('none');
    expect(getComputedStyle(button).translate).toBe('none');
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('false');
  });

  it('composes the existing native keyboard handlers and click callback', async () => {
    const onKeyDown = vi.fn();
    const onClick = vi.fn();
    const container = await mount(
      <GameButton fullWidth surface="liquid" onClick={onClick} onKeyDown={onKeyDown}>
        Go
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    const surface = container.querySelector('.game-ui-liquid-surface')!;
    button.focus();
    expect(document.activeElement).toBe(button);
    await act(async () =>
      button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })),
    );
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(surface.getAttribute('data-liquid-active')).toBe('true');
    await act(async () =>
      button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('false');
    await act(async () => button.click());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not activate a disabled CTA', async () => {
    const onClick = vi.fn();
    const container = await mount(
      <GameButton disabled fullWidth surface="liquid" onClick={onClick}>
        Wait
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    button.click();
    expect(onClick).not.toHaveBeenCalled();
    expect(container.querySelector('.game-ui-liquid-surface')).toBeNull();
    expect(button.getBoundingClientRect().width).toBeCloseTo(280, 0);
  });

  it('honors reduced motion without removing the native action', async () => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
      ...media,
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const onClick = vi.fn();
    const container = await mount(
      <GameButton surface="liquid" onClick={onClick}>
        Go
      </GameButton>,
    );
    const button = container.querySelector('button')!;
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    expect(
      container.querySelector('.game-ui-liquid-surface')?.getAttribute('data-liquid-active'),
    ).toBe('false');
    await act(async () => button.click());
    expect(onClick).toHaveBeenCalledOnce();
  });
});
