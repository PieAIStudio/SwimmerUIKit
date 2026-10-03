import { act, createRef, forwardRef, StrictMode, type ComponentProps, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GameButton } from '../GameButton/GameButton';
import { GameIconButton } from '../GameIconButton/GameIconButton';
import '../../styles.css';

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
  vi.restoreAllMocks();
});
const render = async (node: ReactNode) => {
  await act(async () => root.render(<StrictMode>{node}</StrictMode>));
  await document.fonts.ready;
};

it('retains native anchor destination, download, new-tab protection and the actual forwarded ref', async () => {
  const ref = createRef<HTMLAnchorElement>();
  await render(
    <GameButton href="#download" target="_blank" rel="author" download="lesson.txt" ref={ref}>
      Read
    </GameButton>,
  );
  const link = host.querySelector('a')!;
  expect(ref.current).toBe(link);
  expect(link.getAttribute('href')).toBe('#download');
  expect(link.download).toBe('lesson.txt');
  expect(link.rel.split(' ')).toEqual(expect.arrayContaining(['author', 'noopener', 'noreferrer']));
  expect(host.querySelector('button')).toBeNull();
  expect(link.querySelector('path')?.getAttribute('d')).toMatch(/^M.*Z$/);
});

it('uses a router component only for enabled links and makes disabled links inert', async () => {
  let mounts = 0;
  const Router = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>((props, ref) => {
    mounts++;
    return <a {...props} ref={ref} data-router="true" />;
  });
  const click = vi.fn();
  await render(
    <GameIconButton href="#route" linkComponent={Router} label="Read" onClick={click}>
      ↗
    </GameIconButton>,
  );
  expect(host.querySelector('a')?.dataset.router).toBe('true');
  mounts = 0;
  await render(
    <GameIconButton
      href="#route"
      linkComponent={Router}
      disabled
      tabIndex={0}
      label="Read"
      onClick={click}
    >
      ↗
    </GameIconButton>,
  );
  const disabled = host.querySelector('a')!;
  expect(mounts).toBe(0);
  expect(disabled.getAttribute('aria-disabled')).toBe('true');
  expect(disabled.hasAttribute('href')).toBe(false);
  expect(disabled.hasAttribute('tabindex')).toBe(false);
  disabled.focus();
  expect(document.activeElement).not.toBe(disabled);
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  disabled.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  expect(click).not.toHaveBeenCalled();
});

it('keeps sm at 32px, with only the SVG changing under a pointer press', async () => {
  await render(
    <>
      <GameButton href="#small" size="sm">
        Small
      </GameButton>
      <GameIconButton href="#small" size="sm" label="Small">
        +
      </GameIconButton>
    </>,
  );
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const [link, icon] = host.querySelectorAll('a');
  expect(link!.getBoundingClientRect().height).toBe(32);
  expect(icon!.getBoundingClientRect().width).toBe(32);
  expect(icon!.getBoundingClientRect().height).toBe(32);
  expect(getComputedStyle(link!).fontSize).toBe('14px');
  const bounds = link!.getBoundingClientRect().toJSON();
  const original = link!.querySelector('path')!.getAttribute('d');
  await act(async () =>
    link!.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }),
    ),
  );
  await expect.poll(() => link!.querySelector('path')!.getAttribute('d')).not.toBe(original);
  expect(link!.getBoundingClientRect().toJSON()).toEqual(bounds);
  expect(getComputedStyle(link!).boxShadow).toBe('none');
  await act(async () => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 })));
});

it('uses liquid for a primary link while keeping Space native and Enter pressable', async () => {
  await render(
    <GameButton variant="primary" href="#start">
      Start
    </GameButton>,
  );
  const link = host.querySelector('a')!;
  const surface = host.querySelector('.game-ui-liquid-surface')!;
  const bounds = link.getBoundingClientRect().toJSON();
  await act(async () =>
    link.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })),
  );
  expect(surface.getAttribute('data-liquid-active')).toBe('false');
  await act(async () =>
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
  );
  expect(surface.getAttribute('data-liquid-active')).toBe('true');
  expect(link.getBoundingClientRect().toJSON()).toEqual(bounds);
  await act(async () => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' })));
  expect(surface.getAttribute('data-liquid-active')).toBe('false');
});

it('does not detach the external callback ref on a parent-only rerender', async () => {
  const refs: Array<Element | null> = [];
  const ref = (element: HTMLButtonElement | HTMLAnchorElement | null) => {
    refs.push(element);
  };
  await render(<GameButton ref={ref}>First</GameButton>);
  const native = host.querySelector('button');
  refs.length = 0;
  await render(<GameButton ref={ref}>Second</GameButton>);
  expect(refs).toEqual([]);
  expect(host.querySelector('button')).toBe(native);
});

it('keeps native form submission separate from link activation', async () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  await render(
    <form onSubmit={submit}>
      <GameButton type="submit">Save</GameButton>
      <GameButton href="#read" onClick={(event) => event.preventDefault()}>
        Read
      </GameButton>
    </form>,
  );
  await act(async () => host.querySelector('a')!.click());
  expect(submit).not.toHaveBeenCalled();
  await act(async () => host.querySelector('button')!.click());
  expect(submit).toHaveBeenCalledOnce();
});
