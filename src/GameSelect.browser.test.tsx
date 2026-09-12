import { act, useState, createRef, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameSelect } from './GameSelect';
import { GameButton } from './GameButton';
import { GameToggle, GameIconButton, GameSegmentedControl, GameSlider } from './GameSurfaces';
import { resetLiquidGooeyBudgetForTests } from './liquidGooeyBudget';
import './styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement | undefined;
async function mount(node: ReactNode) {
  host = document.createElement('div');
  host.style.width = '280px';
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(node));
  return host;
}
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  resetLiquidGooeyBudgetForTests();
  vi.restoreAllMocks();
});

describe('native selection remains real underneath the liquid', () => {
  it('preserves the native node and an uncontrolled selection when decoration or disabled state changes', async () => {
    const ref = createRef<HTMLSelectElement>();
    const render = (
      disabled = false,
      surface: 'flat' | 'liquid' = 'liquid',
      size = 1,
    ): ReactNode => (
      <form>
        <GameSelect
          ref={ref}
          aria-label="Course"
          name="course"
          defaultValue="one"
          disabled={disabled}
          surface={surface}
          size={size}
        >
          <option value="one">One</option>
          <option value="two">Two</option>
        </GameSelect>
      </form>
    );
    const container = await mount(render());
    const select = ref.current!;
    await act(async () => {
      select.value = 'two';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    for (const [disabled, surface, size] of [
      [true, 'liquid', 1],
      [false, 'liquid', 1],
      [false, 'flat', 1],
      [false, 'liquid', 1],
      [false, 'liquid', 4],
      [false, 'liquid', 1],
    ] as const) {
      await act(async () => root?.render(render(disabled, surface, size)));
      expect(ref.current).toBe(select);
      expect(select.value).toBe('two');
      expect(new FormData(container.querySelector('form')!).get('course')).toBe(
        disabled ? null : 'two',
      );
      if (disabled || surface === 'flat' || size > 1)
        expect(container.querySelector('[data-liquid-gooey-silhouette]')).toBeNull();
    }
    container.querySelector('form')!.reset();
    expect(select.value).toBe('one');
  });

  it('submits and resets an uncontrolled select and forwards the actual focus ref', async () => {
    const ref = createRef<HTMLSelectElement>();
    const change = vi.fn();
    const container = await mount(
      <form>
        <label>
          Course
          <GameSelect
            ref={ref}
            name="course"
            defaultValue=""
            required
            surface="liquid"
            liquidFinish="matte"
            onChange={change}
          >
            <option value="">Choose</option>
            <option value="one">One</option>
          </GameSelect>
        </label>
      </form>,
    );
    const form = container.querySelector('form')!;
    const select = ref.current!;
    expect(select.validity.valueMissing).toBe(true);
    select.focus();
    expect(document.activeElement).toBe(select);
    await act(async () => {
      select.value = 'one';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(change).toHaveBeenCalledOnce();
    expect(new FormData(form).get('course')).toBe('one');
    expect(select.checkValidity()).toBe(true);
    form.reset();
    expect(select.value).toBe('');
    expect(select.getBoundingClientRect().width).toBeCloseTo(280, 0);
    expect(container.querySelector('feSpecularLighting')).toBeNull();
  });
  it('respects a disabled fieldset and supports native multiple form entries', async () => {
    const container = await mount(
      <form>
        <fieldset disabled>
          <GameSelect name="disabled" surface="liquid">
            <option>A</option>
          </GameSelect>
        </fieldset>
        <GameSelect
          aria-label="Many"
          multiple
          name="many"
          defaultValue={['a', 'b']}
          surface="liquid"
        >
          <option value="a">A</option>
          <option value="b">B</option>
        </GameSelect>
      </form>,
    );
    const form = container.querySelector('form')!;
    expect(new FormData(form).has('disabled')).toBe(false);
    expect(new FormData(form).getAll('many')).toEqual(['a', 'b']);
    expect(container.querySelector('select')!.matches(':disabled')).toBe(true);
  });
  it('keeps controlled switch state and liquid position coupled without transforming text', async () => {
    function Demo() {
      const [checked, setChecked] = useState(false);
      return (
        <GameToggle
          surface="liquid"
          liquidFinish="matte"
          checked={checked}
          label="Notify"
          onClick={() => setChecked(!checked)}
        />
      );
    }
    const container = await mount(<Demo />);
    const button = container.querySelector('button')!;
    expect(button.getAttribute('aria-checked')).toBe('false');
    await act(async () => button.click());
    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(container.querySelector('.game-ui-toggle-liquid-thumb')).not.toBeNull();
    expect(getComputedStyle(button).transform).toBe('none');
  });
});

describe('press cancellation edge cases', () => {
  it('honors inherited fieldset disabling without requiring duplicate React props', async () => {
    const click = vi.fn();
    const container = await mount(
      <fieldset disabled>
        <GameButton surface="liquid" onClick={click}>
          Go
        </GameButton>
        <GameIconButton label="Save" surface="liquid" onClick={click}>
          ★
        </GameIconButton>
        <GameToggle label="Notify" surface="liquid" checked onClick={click} />
      </fieldset>,
    );
    for (const control of container.querySelectorAll('button')) {
      expect(control.matches(':disabled')).toBe(true);
      control.click();
    }
    expect(click).not.toHaveBeenCalled();
    for (const body of container.querySelectorAll(
      '.game-ui-liquid-surface__body, .game-ui-toggle-liquid-body',
    ))
      expect(getComputedStyle(body).display).toBe('none');
    expect(
      getComputedStyle(container.querySelector('.game-ui-toggle-liquid-track')!, '::after').left,
    ).toBe('27px');
  });
  it('survives WebKit pointerdown-then-blur but cancels on keyboard blur and window deactivation', async () => {
    const container = await mount(<GameButton surface="liquid">Go</GameButton>);
    const button = container.querySelector('button')!;
    const surface = container.querySelector('.game-ui-liquid-surface')!;
    button.focus();
    await act(async () => {
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
      button.blur();
    });
    expect(surface.getAttribute('data-liquid-active')).toBe('true');
    await act(async () => window.dispatchEvent(new Event('blur')));
    expect(surface.getAttribute('data-liquid-active')).toBe('false');
    button.focus();
    await act(async () =>
      button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('true');
    await act(async () => button.blur());
    expect(surface.getAttribute('data-liquid-active')).toBe('false');
  });
  it('keeps disabled controls quiet, non-interactive and visibly selected where appropriate', async () => {
    const onClick = vi.fn();
    const container = await mount(
      <>
        <GameIconButton label="Save" disabled surface="liquid" onClick={onClick}>
          ★
        </GameIconButton>
        <GameToggle label="Notify" checked disabled surface="liquid" onClick={onClick} />
        <GameSegmentedControl
          label="Choice"
          activeId="one"
          disabled
          onSelect={onClick}
          options={[
            { id: 'one', label: 'One' },
            { id: 'two', label: 'Two' },
          ]}
        />
        <GameSlider label="Volume" value={40} disabled onChange={onClick} />
      </>,
    );
    for (const button of container.querySelectorAll('button')) {
      button.click();
      expect(button.disabled).toBe(true);
      expect(getComputedStyle(button).cursor).toBe('not-allowed');
    }
    expect(onClick).not.toHaveBeenCalled();
    expect(container.querySelector('[data-liquid-gooey-silhouette]')).toBeNull();
    expect(container.querySelector('[aria-pressed="true"]')?.textContent).toBe('One');
    expect(container.querySelector('input')?.disabled).toBe(true);
  });
  it('does not press on right click and resets after lost capture', async () => {
    const container = await mount(<GameButton surface="liquid">Go</GameButton>);
    const button = container.querySelector('button')!;
    const surface = container.querySelector('.game-ui-liquid-surface')!;
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('false');
    await act(async () =>
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('true');
    await act(async () =>
      button.dispatchEvent(new PointerEvent('lostpointercapture', { bubbles: true })),
    );
    expect(surface.getAttribute('data-liquid-active')).toBe('false');
  });
  it('honors static and clears a press when the control becomes disabled', async () => {
    const container = await mount(
      <GameButton static surface="liquid">
        Go
      </GameButton>,
    );
    await act(async () =>
      container
        .querySelector('button')!
        .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    expect(
      container.querySelector('.game-ui-liquid-surface')!.getAttribute('data-liquid-active'),
    ).toBe('false');
    await act(async () => root?.render(<GameButton surface="liquid">Go</GameButton>));
    await act(async () =>
      container
        .querySelector('button')!
        .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })),
    );
    await act(async () =>
      root?.render(
        <GameButton disabled surface="liquid">
          Go
        </GameButton>,
      ),
    );
    await act(async () => root?.render(<GameButton surface="liquid">Go</GameButton>));
    expect(
      container.querySelector('.game-ui-liquid-surface')!.getAttribute('data-liquid-active'),
    ).toBe('false');
  });
});
