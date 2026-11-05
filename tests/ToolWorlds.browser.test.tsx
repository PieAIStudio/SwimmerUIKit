import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ManagerSheet } from '../src/tool-worlds';
import '../src/styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it('only offers row Open with a handler and respects disabled rows', async () => {
  const props = {
    actionLabel: 'Restore',
    groups: [],
    rows: [
      { id: 'photo', name: 'Weekend.jpg' },
      { id: 'locked', name: 'Locked.jpg', disabled: true },
    ],
    title: 'Files',
  };
  await act(async () => root.render(<ManagerSheet {...props} />));
  expect(host.querySelector('.game-ui-manager-sheet-row-open')).toBeNull();

  const open = vi.fn();
  await act(async () => root.render(<ManagerSheet {...props} onRowOpen={open} />));
  const buttons = host.querySelectorAll<HTMLButtonElement>('.game-ui-manager-sheet-row-open');
  expect(buttons).toHaveLength(2);
  expect(buttons[0]!.disabled).toBe(false);
  expect(buttons[1]!.disabled).toBe(true);
  await act(async () => userEvent.click(buttons[0]!));
  await act(async () => buttons[1]!.click());
  expect(open).toHaveBeenCalledExactlyOnceWith('photo');
});
