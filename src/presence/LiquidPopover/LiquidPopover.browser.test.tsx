import { act, StrictMode, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LiquidPopover } from './LiquidPopover';
import { GameButton } from '../../controls/GameButton/GameButton';
import { setLiquidGooeyBudget, resetLiquidGooeyBudgetForTests } from '../../liquid/budget';
import '../../styles.css';
import '../presence.css';
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  resetLiquidGooeyBudgetForTests();
  vi.restoreAllMocks();
});
function Fixture() {
  const source = useRef<HTMLButtonElement>(null),
    [open, setOpen] = useState(false);
  return (
    <section data-game-ui-theme="dark" data-game-ui-style="grey">
      <GameButton ref={source} onClick={() => setOpen(!open)}>
        Open
      </GameButton>
      <LiquidPopover open={open} onOpenChange={setOpen} source={source} title="Choices">
        <input aria-label="Draft" defaultValue="retain" />
        <GameButton>Choose</GameButton>
      </LiquidPopover>
    </section>
  );
}
async function open() {
  await act(async () =>
    root.render(
      <StrictMode>
        <Fixture />
      </StrictMode>,
    ),
  );
  await act(async () => host.querySelector('button')!.click());
  await expect.poll(() => document.activeElement?.textContent).toBe('Choices');
  return document.querySelector<HTMLElement>('.game-ui-liquid-popover')!;
}
it('focuses the labelled non-modal dialog and restores focus after Escape; reopening has a fresh identity', async () => {
  const panel = await open(),
    title = panel.getAttribute('aria-labelledby');
  expect(panel.getAttribute('role')).toBe('dialog');
  expect(panel.getAttribute('aria-modal')).toBe('false');
  expect(document.activeElement?.id).toBe(title);
  expect(panel.closest('[data-game-ui-style]')?.getAttribute('data-game-ui-style')).toBe('grey');
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    ),
  );
  expect(panel.isConnected).toBe(false);
  await expect.poll(() => document.activeElement).toBe(host.querySelector('button'));
  await act(async () => host.querySelector('button')!.click());
  await expect
    .poll(() => document.querySelector('.game-ui-liquid-popover')?.getAttribute('aria-labelledby'))
    .not.toBe(title);
});
it('does not dismiss for inside clicks or composing Escape, but closes for a real outside pointer', async () => {
  const panel = await open();
  await act(async () =>
    panel.querySelector('input')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true }),
    ),
  );
  expect(panel.isConnected).toBe(true);
  await act(async () =>
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );
  expect(panel.isConnected).toBe(false);
  await expect.poll(() => document.activeElement).toBe(host.querySelector('button'));
});
it('is static and usable under a zero animation/area budget', async () => {
  setLiquidGooeyBudget({ maxAnimatedGroups: 0, maxFilterArea: 0 });
  const panel = await open();
  await expect
    .poll(() => panel.querySelector('.game-ui-liquid-reveal')?.getAttribute('data-reveal-motion'))
    .toBe('static');
  expect(panel.querySelector('.game-ui-liquid-reveal')?.getAttribute('data-reveal-filter')).toBe(
    'flat',
  );
  expect(panel.querySelector('input')?.value).toBe('retain');
});
it('prefers top at narrow widths without changing focus or editable content on resize', async () => {
  const original = window.matchMedia.bind(window);
  vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
    query === '(max-width: 767px)'
      ? {
          ...original(query),
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }
      : original(query),
  );
  const panel = await open();
  expect(panel.dataset.popoverPlacement).toBe('top');
  panel.querySelector('input')!.focus();
  window.dispatchEvent(new Event('resize'));
  expect(document.activeElement).toBe(panel.querySelector('input'));
});
