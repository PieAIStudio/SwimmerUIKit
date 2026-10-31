import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovementPad, type MovementAction } from './MovementPad';
import '../../styles.css';

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

async function key(target: Element, name: string): Promise<KeyboardEvent> {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: name });
  await act(async () => target.dispatchEvent(event));
  return event;
}

describe('MovementPad keyboard', () => {
  it('maps WASD, arrows and space to moves and claims only those keys', async () => {
    const onMove = vi.fn();
    const actions: MovementAction[] = [
      { direction: 'forward', label: 'Up' },
      { direction: 'left', label: 'Left' },
      { direction: 'reset', label: 'Reset' },
    ];
    await act(async () =>
      root.render(<MovementPad actions={actions} label="Move" onMove={onMove} />),
    );
    const pad = host.querySelector('section')!;
    expect((await key(pad, 'w')).defaultPrevented).toBe(true);
    await key(pad, 'ArrowLeft');
    await key(pad, ' ');
    expect(onMove.mock.calls).toEqual([['forward'], ['left'], ['reset']]);

    // A key for a direction this pad does not offer, or an unrelated key, is left alone.
    expect((await key(pad, 'ArrowRight')).defaultPrevented).toBe(false);
    expect((await key(pad, 'Enter')).defaultPrevented).toBe(false);
    expect(onMove).toHaveBeenCalledTimes(3);
  });

  it('ignores a disabled action and a disabled pad', async () => {
    const onMove = vi.fn();
    const actions: MovementAction[] = [
      { direction: 'forward', label: 'Up', disabled: true },
      { direction: 'left', label: 'Left' },
    ];
    await act(async () =>
      root.render(<MovementPad actions={actions} label="Move" onMove={onMove} />),
    );
    const pad = host.querySelector('section')!;
    expect((await key(pad, 'w')).defaultPrevented).toBe(false);
    await act(async () =>
      root.render(<MovementPad actions={actions} disabled label="Move" onMove={onMove} />),
    );
    expect((await key(pad, 'a')).defaultPrevented).toBe(false);
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[data-direction="left"]')?.click(),
    );
    expect(onMove).not.toHaveBeenCalled();
  });
});
