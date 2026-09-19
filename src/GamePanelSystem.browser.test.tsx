import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GameModal } from './GamePanelSystem';
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
});

async function mount(node: ReactNode): Promise<HTMLDivElement> {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(node));
  return host;
}

function PreservedModalDemo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button data-testid="open-preserved" onClick={() => setOpen(true)} type="button">
        Open preserved
      </button>
      <GameModal keepMounted onClose={() => setOpen(false)} open={open} title="Questionnaire">
        <label>
          Answer
          <input aria-label="preserved answer" defaultValue="" />
        </label>
      </GameModal>
    </>
  );
}

function DefaultModalDemo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button data-testid="open-default" onClick={() => setOpen(true)} type="button">
        Open default
      </button>
      <GameModal onClose={() => setOpen(false)} open={open} title="Default questionnaire">
        <label>
          Answer
          <input aria-label="default answer" defaultValue="" />
        </label>
      </GameModal>
    </>
  );
}

describe('GameModal keepMounted lifecycle', () => {
  it('preserves an uncontrolled input across Escape while closed content is inert', async () => {
    const container = await mount(<PreservedModalDemo />);
    const opener = container.querySelector('[data-testid="open-preserved"]')!;
    await act(async () => {
      await userEvent.click(opener);
    });

    const dialog = container.querySelector('dialog')! as HTMLDialogElement;
    const input = container.querySelector('[aria-label="preserved answer"]')! as HTMLInputElement;
    expect(dialog.open).toBe(true);
    await act(async () => {
      await userEvent.fill(input, 'unfinished answer');
    });
    expect(input.value).toBe('unfinished answer');
    await page.screenshot({
      path: '../.scratch/university-modal-preservation/keep-mounted-open.png',
    });

    await act(async () => {
      await userEvent.keyboard('{Escape}');
    });
    await expect.poll(() => dialog.open).toBe(false);
    expect(container.querySelector('[aria-label="preserved answer"]')).toBe(input);
    expect(input.closest('[inert]')).not.toBeNull();
    await userEvent.tab();
    expect(document.activeElement).not.toBe(input);
    input.focus();
    expect(document.activeElement).not.toBe(input);

    await act(async () => {
      await userEvent.click(opener);
    });
    await expect.poll(() => dialog.open).toBe(true);
    expect(input.value).toBe('unfinished answer');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('keeps the default cleanup behavior when keepMounted is omitted', async () => {
    const container = await mount(<DefaultModalDemo />);
    const opener = container.querySelector('[data-testid="open-default"]')!;
    await act(async () => {
      await userEvent.click(opener);
    });

    const dialog = container.querySelector('dialog')! as HTMLDialogElement;
    const input = container.querySelector('[aria-label="default answer"]')! as HTMLInputElement;
    await act(async () => {
      await userEvent.fill(input, 'discard me');
    });
    await act(async () => {
      await userEvent.keyboard('{Escape}');
    });
    await expect.poll(() => dialog.open).toBe(false);
    expect(container.querySelector('[aria-label="default answer"]')).toBeNull();

    await act(async () => {
      await userEvent.click(opener);
    });
    await expect.poll(() => dialog.open).toBe(true);
    expect(
      (container.querySelector('[aria-label="default answer"]') as HTMLInputElement).value,
    ).toBe('');
  });
});
