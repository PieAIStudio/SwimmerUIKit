import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { HelpTip } from './HelpTip';
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
      <HelpTip label="Help">A plain explanation.</HelpTip>
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
    <HelpTip label="Recovery help">Use the latest recovery email.</HelpTip>,
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
    <HelpTip label="Touch help">Tap to read this explanation.</HelpTip>,
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

it('names animated help with its caption and shows the still poster under reduced motion inside a dialog', async () => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  );
  const caption = 'Join the same Wi-Fi on both devices.';
  const container = await mount(
    <HelpTip
      label="Connection help"
      caption={caption}
      media={<svg data-testid="moving" viewBox="0 0 320 180" />}
      poster={<svg data-testid="poster" viewBox="0 0 320 180" />}
    />,
    true,
  );
  await act(async () => container.querySelector('button')!.click());
  const tip = container.querySelector('[role="tooltip"]')!;
  expect(tip.getAttribute('aria-label')).toBe(caption);
  expect(tip.querySelector('[data-testid="poster"]')).not.toBeNull();
  expect(tip.querySelector('[data-testid="moving"]')).toBeNull();
  const bounds = tip.getBoundingClientRect();
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(innerWidth);
  expect(bounds.height).toBeLessThan(innerHeight);
});

it('warns without throwing for long text-only help, but not for an illustrated sentence', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const long =
    'This optional explanation is much longer than a short sentence and needs a picture.';
  await mount(<HelpTip label="Help">{long}</HelpTip>);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('HelpTip'));
  warn.mockClear();
  await act(async () => root!.render(<HelpTip label="Help" caption={long} media={<svg />} />));
  expect(warn).not.toHaveBeenCalled();
});

it('cancels native Escape when help is open but focus remains in another modal control', async () => {
  const container = await mount(
    <>
      <input aria-label="Another control" />
      <HelpTip label="Hover help">Optional explanation.</HelpTip>
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
