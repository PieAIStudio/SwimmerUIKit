import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { GameHelpTip } from './GameHelpTip';
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
});
async function mount(content: ReactNode, dialog = false) {
  host = document.createElement(dialog ? 'dialog' : 'div');
  document.body.append(host);
  root = createRoot(host);
  if (host instanceof HTMLDialogElement) host.showModal();
  await act(async () => root!.render(content));
  return host;
}

it('opens by click, never submits a form, and dismisses by Escape without losing focus', async () => {
  const submit = vi.fn((event: Event) => event.preventDefault());
  const container = await mount(
    <form>
      <GameHelpTip label="Help">A plain explanation.</GameHelpTip>
    </form>,
  );
  container.querySelector('form')!.addEventListener('submit', submit);
  const button = container.querySelector('button')!;
  await act(async () => button.click());
  await expect
    .poll(() => document.querySelector('[role="tooltip"]')?.textContent)
    .toBe('A plain explanation.');
  expect(submit).not.toHaveBeenCalled();
  await act(async () => {
    button.focus();
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
  });
  await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull();
  expect(document.activeElement).toBe(button);
});

it('keeps help inside a modal and does not close the modal when help is dismissed', async () => {
  const container = await mount(
    <GameHelpTip label="Recovery help">Use the latest recovery email.</GameHelpTip>,
    true,
  );
  const button = container.querySelector('button')!;
  await act(async () => button.click());
  await expect
    .poll(() => container.querySelector('[role="tooltip"]')?.textContent)
    .toBe('Use the latest recovery email.');
  const bounds = container.querySelector('[role="tooltip"]')!.getBoundingClientRect();
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(innerWidth);
  await act(async () =>
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    ),
  );
  await expect.poll(() => container.querySelector('[role="tooltip"]')).toBeNull();
  expect((container as HTMLDialogElement).open).toBe(true);
});

it('provides a touch-sized trigger and releases the portal on unmount', async () => {
  const container = await mount(
    <GameHelpTip label="Touch help">Tap to read this explanation.</GameHelpTip>,
  );
  const button = container.querySelector('button')!;
  const bounds = button.getBoundingClientRect();
  expect(bounds.width).toBeGreaterThanOrEqual(44);
  expect(bounds.height).toBeGreaterThanOrEqual(44);
  await act(async () => button.click());
  await expect.poll(() => document.querySelector('[role="tooltip"]')).not.toBeNull();
  await act(async () => root?.unmount());
  root = undefined;
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});

it('cancels native Escape when help is open but focus remains in another modal control', async () => {
  const container = await mount(
    <>
      <input aria-label="Another control" />
      <GameHelpTip label="Hover help">Optional explanation.</GameHelpTip>
    </>,
    true,
  );
  const button = container.querySelector('button')!;
  const input = container.querySelector('input')!;
  await act(async () => {
    input.focus();
    button.click();
  });
  await expect.poll(() => container.querySelector('[role="tooltip"]')).not.toBeNull();
  expect(document.activeElement).toBe(input);
  const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  await act(async () => input.dispatchEvent(escape));
  expect(escape.defaultPrevented).toBe(true);
  await expect.poll(() => container.querySelector('[role="tooltip"]')).toBeNull();
  expect((container as HTMLDialogElement).open).toBe(true);
  expect(document.activeElement).toBe(input);
});
