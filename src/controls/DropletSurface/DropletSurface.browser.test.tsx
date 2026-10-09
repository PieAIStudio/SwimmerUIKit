import { act, StrictMode, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameButton } from '../GameButton/GameButton';
import { GameListRow } from '../GameListRow/GameListRow';
import { GameIconButton } from '../GameIconButton/GameIconButton';
import { GameInput } from '../GameInput/GameInput';
import { GameTabs } from '../GameTabs/GameTabs';
import { GameToggle } from '../GameToggle/GameToggle';
import { GameSegmentedControl } from '../GameSegmentedControl/GameSegmentedControl';
import { GameProgress } from '../../feedback/GameProgress/GameProgress';
import { GAME_UI_STYLES, type GameUiStyle } from '../../tokens/styles';
import { MIN_PRESS_HOLD_MS } from '../../liquid/LiquidPressSurface/observePress';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let frames: Map<number, FrameRequestCallback>;
let sequence: number;
let now: number;

beforeEach(() => {
  frames = new Map();
  sequence = 0;
  now = 1000;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++sequence, callback);
    return sequence;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:40px;top:40px;width:520px';
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  expect(frames.size, 'unmount must cancel all owned animation frames').toBe(0);
  host.remove();
  vi.restoreAllMocks();
});
const nativeFrame = window.requestAnimationFrame.bind(window);
const render = async (node: ReactNode) => {
  await act(async () => root.render(<StrictMode>{node}</StrictMode>));
  // Default webfonts may replace the initial system glyph widths. Compare
  // press/rest only after font loading and ResizeObserver have settled; a
  // legitimate font resize is not an ambient animation or a changed hit target.
  await act(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => nativeFrame(() => nativeFrame(() => resolve())));
  });
};
const advance = async (count: number) =>
  act(async () => {
    for (let i = 0; i < count; i++) {
      now += 1000 / 60;
      const callbacks = [...frames.values()];
      frames.clear();
      for (const callback of callbacks) callback(now);
      await Promise.resolve();
    }
  });
const pointer = async (button: HTMLElement, type: string, buttonCode = 0) =>
  act(async () =>
    button.dispatchEvent(
      new PointerEvent(type, { bubbles: true, cancelable: true, button: buttonCode, pointerId: 1 }),
    ),
  );

describe('one flat droplet primitive', () => {
  it('renders a native vector path, not a threshold filter, including under StrictMode', async () => {
    await render(<GameButton>Start</GameButton>);
    const svg = host.querySelector<SVGSVGElement>('.game-ui-droplet')!;
    const path = svg.querySelector('path')!;
    expect(path.getAttribute('d')).toMatch(/^M.*Z$/);
    expect(path.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    expect(svg.querySelector('filter')).toBeNull();
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(svg).pointerEvents).toBe('none');
    expect(frames.size).toBe(0);
  });
  it('spreads only its background and returns to rest without an ambient loop', async () => {
    await render(<GameButton>Start</GameButton>);
    const button = host.querySelector('button')!,
      svg = button.querySelector('svg')!,
      group = svg.querySelector('g')!,
      path = svg.querySelector('path')!;
    const bounds = button.getBoundingClientRect().toJSON(),
      initial = path.getAttribute('d');
    await pointer(button, 'pointerdown');
    await advance(10);
    expect(svg.dataset.pressed).toBe('true');
    expect(path.getAttribute('d')).not.toBe(initial);
    expect(group.getAttribute('transform')).not.toContain('scale(1.00000 1.00000)');
    expect(button.getBoundingClientRect().toJSON()).toEqual(bounds);
    expect(getComputedStyle(button).transform).toBe('none');
    await pointer(button, 'pointerup');
    // A released tap keeps its squash for the minimum hold, then the spring takes over.
    expect(svg.dataset.pressed).toBe('true');
    await act(async () => new Promise((resolve) => setTimeout(resolve, MIN_PRESS_HOLD_MS + 30)));
    await advance(240);
    expect(svg.dataset.pressed).toBe('false');
    expect(path.getAttribute('d')).toBe(initial);
    expect(frames.size).toBe(0);
    const final = svg.outerHTML;
    await advance(60);
    expect(svg.outerHTML).toBe(final);
  });
  it('does not animate static or reduced-motion controls, without altering their native node', async () => {
    await render(<GameButton static>Start</GameButton>);
    const button = host.querySelector('button')!,
      path = button.querySelector('path')!,
      initial = path.getAttribute('d');
    await pointer(button, 'pointerdown');
    await advance(30);
    expect(path.getAttribute('d')).toBe(initial);
    expect(frames.size).toBe(0);
    const original = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
      query === '(prefers-reduced-motion: reduce)'
        ? ({
            matches: true,
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
          } as unknown as MediaQueryList)
        : original(query),
    );
    await act(async () => root.unmount());
    root = createRoot(host);
    await render(<GameButton>Start</GameButton>);
    const reduced = host.querySelector('button')!,
      before = reduced.querySelector('path')!.getAttribute('d');
    await pointer(reduced, 'pointerdown');
    await advance(30);
    expect(reduced.querySelector('path')!.getAttribute('d')).toBe(before);
    expect(frames.size).toBe(0);
  });
  it('honours cancelled events and clears state on lost capture, inherited disable and blur', async () => {
    await render(
      <fieldset>
        <GameButton onPointerDown={(event) => event.preventDefault()}>Start</GameButton>
      </fieldset>,
    );
    let button = host.querySelector('button')!;
    await pointer(button, 'pointerdown');
    await advance(5);
    expect(frames.size).toBe(0);
    await render(
      <fieldset>
        <GameButton>Start</GameButton>
      </fieldset>,
    );
    button = host.querySelector('button')!;
    await pointer(button, 'pointerdown');
    await advance(5);
    expect(button.querySelector('svg')!.dataset.pressed).toBe('true');
    await pointer(button, 'lostpointercapture');
    await advance(240);
    expect(frames.size).toBe(0);
    await pointer(button, 'pointerdown');
    await advance(5);
    await act(async () => {
      host.querySelector('fieldset')!.disabled = true;
      await Promise.resolve();
    });
    expect(button.querySelector('svg')!.dataset.pressed).toBe('false');
    expect(frames.size).toBe(0);
    host.querySelector('fieldset')!.disabled = false;
    await pointer(button, 'pointerdown');
    await advance(5);
    await act(async () => window.dispatchEvent(new Event('blur')));
    await advance(240);
    expect(button.querySelector('svg')!.dataset.pressed).toBe('false');
    expect(frames.size).toBe(0);
  });
  it('keeps selected row ends aligned, separates actions, and paints no other control when an action is pressed', async () => {
    const selected = vi.fn(),
      action = vi.fn();
    const rows = (first: boolean) => (
      <div style={{ display: 'grid', gap: 12 }}>
        <GameListRow
          title="First"
          selected={first}
          onSelect={selected}
          actions={
            <GameIconButton label="Action" onClick={action}>
              +
            </GameIconButton>
          }
        />
        <GameListRow title="Second" selected={!first} onSelect={selected} />
      </div>
    );
    await render(rows(true));
    const elements = [...host.querySelectorAll<HTMLElement>('.game-ui-list-row')],
      before = elements.map((element) => element.getBoundingClientRect().toJSON());
    expect(before[0]!.x).toBe(before[1]!.x);
    expect(before[0]!.width).toBe(before[1]!.width);
    expect(host.querySelector('button button')).toBeNull();
    await render(rows(false));
    expect(elements.map((element) => element.getBoundingClientRect().toJSON())).toEqual(before);
    const side = host.querySelector<HTMLButtonElement>('[aria-label="Action"]')!;
    await pointer(side, 'pointerdown');
    await advance(6);
    expect(elements[0]!.querySelector<SVGSVGElement>(':scope > svg')!.dataset.pressed).not.toBe(
      'true',
    );
    await pointer(side, 'pointerup');
    await act(async () => side.click());
    await advance(240);
    expect(action).toHaveBeenCalledOnce();
    expect(selected).not.toHaveBeenCalled();
  });
  it('changes all twelve styles without changing native text, selection, geometry or focus', async () => {
    const view = (style: GameUiStyle, theme: 'light' | 'dark') => (
      <div data-game-ui-style={style} data-game-ui-theme={theme}>
        <GameInput defaultValue="draft" />
        <GameButton aria-pressed={true}>Saved</GameButton>
      </div>
    );
    await render(view('pastel', 'light'));
    const input = host.querySelector('input')!,
      button = host.querySelector('button')!,
      bounds = button.getBoundingClientRect().toJSON(),
      shape = button.querySelector('path')!.getAttribute('d');
    input.value = '正在编辑';
    input.focus();
    input.setSelectionRange(1, 3);
    for (const style of GAME_UI_STYLES)
      for (const theme of ['light', 'dark'] as const) {
        await render(view(style, theme));
        expect(host.querySelector('input')).toBe(input);
        expect(host.querySelector('button')).toBe(button);
        expect(input.value).toBe('正在编辑');
        expect(document.activeElement).toBe(input);
        expect(input.selectionStart).toBe(1);
        expect(input.selectionEnd).toBe(3);
        expect(button.getBoundingClientRect().toJSON()).toEqual(bounds);
        expect(button.querySelector('path')!.getAttribute('d')).toBe(shape);
        expect(getComputedStyle(button.querySelector('.game-ui-selection-mark')!).visibility).toBe(
          'visible',
        );
      }
  });
  it('resolves the actual theme edge widths and respects a nested light reset', async () => {
    const view = (theme: 'light' | 'dark') => (
      <div data-game-ui-theme="dark" data-game-ui-style="outline">
        <div data-game-ui-theme={theme}>
          <GameButton
            aria-pressed={true}
            style={
              {
                '--game-ui-control-on-edge-width-light': '2px',
                '--game-ui-control-on-edge-width-dark': '3px',
              } as import('react').CSSProperties
            }
          >
            Selected
          </GameButton>
        </div>
      </div>
    );
    for (const theme of ['light', 'dark'] as const) {
      await render(view(theme));
      expect(getComputedStyle(host.querySelector('path')!).strokeWidth).toBe(
        theme === 'dark' ? '3px' : '2px',
      );
    }
  });
  it('uses the S12 tide exception in every style without introducing a filter', async () => {
    for (const style of GAME_UI_STYLES) {
      await render(
        <div data-game-ui-style={style}>
          <GameProgress value={40} label="Completion" />
        </div>,
      );
      for (const bar of host.querySelectorAll<HTMLElement>('.game-ui-progress')) {
        const probe = document.createElement('span');
        bar.append(probe);
        const stops = bar.querySelectorAll('stop');
        for (const [i, token] of ['--game-ui-cta-from', '--game-ui-cta-to'].entries()) {
          probe.style.color = `var(${token})`;
          expect(getComputedStyle(stops[i]!).stopColor).toBe(getComputedStyle(probe).color);
        }
        expect(bar.querySelector('[data-progress-front]')?.getAttribute('d')).toMatch(/^M.*C.*Z$/);
        probe.remove();
      }
      expect(host.querySelectorAll('filter')).toHaveLength(0);
    }
  });
  it('shows a disabled row quietly without disabling its independent side action', async () => {
    const select = vi.fn();
    const action = vi.fn();
    await render(
      <GameListRow
        title="Unavailable"
        selected
        disabled
        onSelect={select}
        actions={
          <GameIconButton label="Details" onClick={action}>
            ?
          </GameIconButton>
        }
      />,
    );
    const main = host.querySelector<HTMLButtonElement>('.game-ui-list-row-main')!;
    const side = host.querySelector<HTMLButtonElement>('[aria-label="Details"]')!;
    const path = host.querySelector<SVGPathElement>('.game-ui-list-row > svg path')!;
    expect(main.disabled).toBe(true);
    expect(side.disabled).toBe(false);
    const initial = path.getAttribute('d');
    await pointer(main, 'pointerdown');
    await advance(20);
    expect(path.getAttribute('d')).toBe(initial);
    expect(frames.size).toBe(0);
    await act(async () => {
      main.click();
      side.click();
    });
    expect(select).not.toHaveBeenCalled();
    expect(action).toHaveBeenCalledOnce();
    const probe = document.createElement('span');
    probe.style.color = 'var(--game-ui-control-disabled-fill)';
    path.closest('.game-ui-list-row')!.append(probe);
    expect(getComputedStyle(path).fill).toBe(getComputedStyle(probe).color);
    probe.remove();
  });
  it('has no shadow, gradient, lip, native scale or liquid filter in ordinary controls, in every style/mode', async () => {
    for (const style of GAME_UI_STYLES)
      for (const theme of ['light', 'dark'] as const) {
        await render(
          <div data-game-ui-style={style} data-game-ui-theme={theme}>
            <GameButton>Action</GameButton>
            <GameIconButton label="Icon">+</GameIconButton>
            <GameToggle checked label="Toggle" />
            <GameTabs tabs={[{ id: 'a', label: 'A' }]} activeId="a" />
            <GameSegmentedControl
              options={[{ id: 'a', label: 'A' }]}
              activeId="a"
              label="Segment"
            />
            <GameInput defaultValue="Edit" />
          </div>,
        );
        expect(host.querySelector('filter')).toBeNull();
        for (const control of host.querySelectorAll<HTMLElement>('button,input')) {
          const css = getComputedStyle(control);
          expect(css.boxShadow, control.outerHTML).toBe('none');
          expect(css.backgroundImage).toBe('none');
          expect(css.filter).toBe('none');
          expect(css.transform).toBe('none');
          expect(css.getPropertyValue('--game-ui-button-lip-depth')).toBe('');
        }
      }
  });
});
