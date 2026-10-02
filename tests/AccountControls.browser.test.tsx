import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import * as Kit from '../src/index';
import '../src/styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement | undefined;
async function mount(node: ReactNode) {
  host = document.createElement('div');
  host.style.width = '360px';
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(node));
  return host;
}
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
});
function paste(input: HTMLInputElement, text: string) {
  const data = new DataTransfer();
  data.setData('text/plain', text);
  input.dispatchEvent(
    new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }),
  );
}
function nativeInput(input: HTMLInputElement, value: string, composing = false) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      inputType: composing ? 'insertCompositionText' : 'insertText',
      data: value,
      isComposing: composing,
    }),
  );
}

describe('WO-UI-1 account controls', () => {
  it('retains native disabled states with legible flat paint instead of opacity fading', async () => {
    const click = vi.fn();
    const node = await mount(
      <>
        <Kit.GameButton disabled onClick={click}>
          Unavailable
        </Kit.GameButton>
        <Kit.GameIconButton label="Unavailable account" disabled onClick={click}>
          A
        </Kit.GameIconButton>
      </>,
    );
    for (const button of node.querySelectorAll('button')) {
      expect(button.disabled).toBe(true);
      button.click();
      const css = getComputedStyle(button);
      expect(css.opacity).toBe('1');
      expect(css.cursor).toBe('not-allowed');
      expect(css.getPropertyValue('--game-ui-paint-text').trim()).toBe(
        css.getPropertyValue('--game-ui-control-disabled-text').trim(),
      );
      expect(button.querySelector('[data-liquid-gooey-silhouette]')).toBeNull();
    }
    expect(click).not.toHaveBeenCalled();
  });

  it('exports a controlled OTP, accepts a complete paste once and exposes accessible numeric slots', async () => {
    expect(Kit.GameOtpInput).toBeTypeOf('function');
    const complete = vi.fn();
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <Kit.GameOtpInput
          aria-label="Verification code"
          value={value}
          onChange={setValue}
          onComplete={complete}
          getSlotLabel={(i, length) => `Digit ${i + 1} of ${length}`}
        />
      );
    }
    const node = await mount(<Demo />);
    const inputs = Array.from(node.querySelectorAll('input'));
    expect(inputs).toHaveLength(6);
    expect(node.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe(
      'Verification code',
    );
    for (const [index, input] of inputs.entries()) {
      expect(input.inputMode).toBe('numeric');
      expect(input.getAttribute('aria-label')).toBe(`Digit ${index + 1} of 6`);
      expect(input.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      expect(input.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
    expect(inputs[0]!.autocomplete).toBe('one-time-code');
    await act(async () => paste(inputs[0]!, '123 456'));
    expect(inputs.map((input) => input.value).join('')).toBe('123456');
    expect(complete).toHaveBeenCalledExactlyOnceWith('123456');
    await act(async () => paste(inputs[0]!, '123456'));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('supports keyboard entry, backspace, middle replacement and a caller reset without submitting on mount', async () => {
    expect(Kit.GameOtpInput).toBeTypeOf('function');
    const complete = vi.fn();
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <>
          <Kit.GameOtpInput
            aria-label="Code"
            value={value}
            onChange={setValue}
            onComplete={complete}
          />
          <button onClick={() => setValue('')} type="button">
            Reset
          </button>
        </>
      );
    }
    const node = await mount(<Demo />);
    const inputs = Array.from(node.querySelectorAll('input'));
    expect(complete).not.toHaveBeenCalled();
    await act(async () => {
      await userEvent.click(inputs[0]!);
      await userEvent.keyboard('123456');
    });
    expect(complete).toHaveBeenCalledExactlyOnceWith('123456');
    await act(async () => {
      await userEvent.keyboard('{Backspace}');
    });
    expect(inputs.map((input) => input.value).join('')).toBe('12345');
    expect(document.activeElement).toBe(inputs[4]);
    await act(async () => {
      await userEvent.click(inputs[2]!);
      await userEvent.keyboard('9');
    });
    expect(inputs.map((input) => input.value).join('')).toBe('12945');
    await act(async () => {
      await userEvent.click(node.querySelector('button')!);
    });
    expect(inputs.map((input) => input.value).join('')).toBe('');
    await act(async () => paste(inputs[0]!, '654321'));
    expect(complete).toHaveBeenLastCalledWith('654321');
  });

  it('does not publish or submit composing text, then completes full-width digits once', async () => {
    expect(Kit.GameOtpInput).toBeTypeOf('function');
    const changed = vi.fn();
    const complete = vi.fn();
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <Kit.GameOtpInput
            aria-label="Code"
            value={value}
            onChange={(next) => {
              changed(next);
              setValue(next);
            }}
            onComplete={complete}
          />
        </form>
      );
    }
    const node = await mount(<Demo />);
    const input = node.querySelector('input')!;
    await act(async () => {
      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      nativeInput(input, '１２３４５６', true);
    });
    expect(changed).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
      isComposing: true,
    });
    input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    await act(async () => {
      input.dispatchEvent(
        new CompositionEvent('compositionend', { data: '１２３４５６', bubbles: true }),
      );
    });
    expect(changed).toHaveBeenCalledExactlyOnceWith('123456');
    expect(complete).toHaveBeenCalledExactlyOnceWith('123456');
  });

  it('supports arbitrary length, invalid descriptions and disabling without completing programmatic values', async () => {
    expect(Kit.GameOtpInput).toBeTypeOf('function');
    const changed = vi.fn();
    const complete = vi.fn();
    const node = await mount(
      <Kit.GameOtpInput
        aria-label="Short code"
        aria-describedby="code-error"
        length={4}
        value="1234"
        onChange={changed}
        onComplete={complete}
        invalid
        disabled
        getSlotDescription={(i) => `Position ${i + 1}`}
      />,
    );
    const inputs = Array.from(node.querySelectorAll('input'));
    expect(inputs).toHaveLength(4);
    expect(complete).not.toHaveBeenCalled();
    for (const input of inputs) {
      expect(input.disabled).toBe(true);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toContain('code-error');
    }
    await act(async () => paste(inputs[0]!, '9876'));
    expect(changed).not.toHaveBeenCalled();
  });

  it('uses only vertical arrow keys for vertical tabs and preserves horizontal navigation', async () => {
    function Demo({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) {
      const [activeId, setActive] = useState('profile');
      return (
        <Kit.GameTabs
          activeId={activeId}
          onSelect={setActive}
          orientation={orientation}
          aria-label="Account sections"
          tabs={[
            { id: 'profile', label: 'Profile' },
            { id: 'security', label: 'Security' },
            { id: 'privacy', label: 'Privacy' },
          ]}
        />
      );
    }
    const node = await mount(<Demo orientation="vertical" />);
    const tabs = node.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(node.querySelector('[role="tablist"]')?.getAttribute('aria-orientation')).toBe(
      'vertical',
    );
    expect(node.querySelector('[role="tablist"]')!.getBoundingClientRect().width).toBe(200);
    await act(async () => {
      await userEvent.click(tabs[0]!);
      await userEvent.keyboard('{ArrowDown}');
    });
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
    await act(async () => {
      await userEvent.keyboard('{ArrowRight}');
    });
    expect(document.activeElement).toBe(tabs[1]);
    await act(async () => {
      await userEvent.keyboard('{Home}{ArrowUp}');
    });
    expect(document.activeElement).toBe(tabs[2]);
    await act(async () => root?.render(<Demo orientation="horizontal" />));
    await act(async () => {
      await userEvent.keyboard('{Home}{ArrowRight}');
    });
    expect(document.activeElement).toBe(tabs[1]);
    expect(Array.from(tabs).filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
  });

  it('keeps row selection and right-side actions separate and avoids nested buttons', async () => {
    expect(Kit.GameListRow).toBeTypeOf('function');
    const select = vi.fn();
    const more = vi.fn();
    const remove = vi.fn();
    const node = await mount(
      <Kit.GameListRow
        title="Story"
        description="Edited today"
        thumbnail={<Kit.GameAvatar name="Story" />}
        current
        selected
        onSelect={select}
        actions={
          <>
            <Kit.GameIconButton label="More" onClick={more}>
              …
            </Kit.GameIconButton>
            <Kit.GameButton variant="danger" onClick={remove}>
              Remove
            </Kit.GameButton>
          </>
        }
      />,
    );
    expect(node.querySelector('button button')).toBeNull();
    expect(node.querySelector('[aria-current="true"]')).not.toBeNull();
    await act(async () => {
      await userEvent.click(node.querySelector('[aria-label="More"]')!);
    });
    expect(more).toHaveBeenCalledOnce();
    expect(select).not.toHaveBeenCalled();
    await act(async () => {
      await userEvent.click(node.querySelectorAll('button')[2]!);
    });
    expect(remove).toHaveBeenCalledOnce();
    expect(select).not.toHaveBeenCalled();
    await act(async () => {
      await userEvent.click(node.querySelector('.game-ui-list-row-main')!);
    });
    expect(select).toHaveBeenCalledOnce();
    const row = node.querySelector('.game-ui-list-row')!;
    expect(getComputedStyle(row).borderRadius).toBe('16px');
    expect(row.querySelector(':scope > .game-ui-droplet path')?.getAttribute('vector-effect')).toBe(
      'non-scaling-stroke',
    );
  });

  it('retains the static circular avatar frame while ordinary buttons have no plaque skin', async () => {
    const node = await mount(
      <>
        <Kit.GameButton>作品</Kit.GameButton>
        <Kit.GameIconButton label="Account">A</Kit.GameIconButton>
        <Kit.GameAvatar surface="plaque" name="River" />
        <Kit.GameButton>Default</Kit.GameButton>
      </>,
    );
    const plaques = node.querySelectorAll('[data-game-ui-surface="plaque"]');
    expect(plaques).toHaveLength(1);
    expect(plaques[0]!.classList.contains('game-ui-avatar')).toBe(true);
    expect(getComputedStyle(plaques[0]!).borderRadius).toBe('999px');
    for (const button of node.querySelectorAll('button'))
      expect(button.querySelector('.game-ui-droplet')).not.toBeNull();
    expect(node.querySelectorAll('button')[2]!.hasAttribute('data-game-ui-surface')).toBe(false);
    expect(node.querySelector('[data-liquid-gooey-silhouette]')).toBeNull();
  });
});
