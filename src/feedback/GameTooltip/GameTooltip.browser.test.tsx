import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { GameTooltip, type GameTooltipProps } from './GameTooltip';
import { GameButton } from '../../controls/GameButton/GameButton';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  // Give the trigger room so start/end edges are unambiguous.
  host.style.cssText = 'position:fixed;left:200px;top:300px;width:320px;';
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

async function render(props: Omit<GameTooltipProps, 'children'>): Promise<{
  trigger: HTMLElement;
  bubble: HTMLElement;
}> {
  await act(async () =>
    root.render(
      <GameTooltip {...props}>
        <GameButton>触发</GameButton>
      </GameTooltip>,
    ),
  );
  return {
    trigger: host.querySelector<HTMLElement>('button')!,
    bubble: host.querySelector<HTMLElement>('[role="tooltip"]')!,
  };
}

describe('GameTooltip layout', () => {
  it('aligns the left edge with the trigger for start and extends right', async () => {
    const { trigger, bubble } = await render({ align: 'start', label: '左边对齐' });
    expect(Math.round(bubble.getBoundingClientRect().left)).toBe(
      Math.round(trigger.getBoundingClientRect().left),
    );
  });

  it('aligns the right edge with the trigger for end and extends left', async () => {
    const { trigger, bubble } = await render({ align: 'end', label: '右边对齐' });
    expect(Math.round(bubble.getBoundingClientRect().right)).toBe(
      Math.round(trigger.getBoundingClientRect().right),
    );
  });

  it('centres the bubble by default and places it above the trigger', async () => {
    const { trigger, bubble } = await render({ label: '默认' });
    const center = (rect: DOMRect) => (rect.left + rect.right) / 2;
    expect(
      Math.abs(center(bubble.getBoundingClientRect()) - center(trigger.getBoundingClientRect())),
    ).toBeLessThan(1);
    expect(bubble.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      trigger.getBoundingClientRect().top,
    );
  });

  it('places the bubble below the trigger for bottom', async () => {
    const { trigger, bubble } = await render({ label: '下方', placement: 'bottom' });
    expect(bubble.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      trigger.getBoundingClientRect().bottom,
    );
  });

  it('wraps a long label inside the 280px limit instead of growing in one line', async () => {
    const label = '这是一段很长的提示文字，用来确认它会在两百八十像素以内换行，而不是撑出一整行。';
    const { bubble } = await render({ label });
    const rect = bubble.getBoundingClientRect();
    // 280px content plus 9px padding on each side.
    expect(rect.width).toBeLessThanOrEqual(298.5);
    expect(rect.height).toBeGreaterThan(bubble.getBoundingClientRect().height / 2 + 20);
  });

  it('keeps explicit line breaks in a multi-line label', async () => {
    const single = await render({ label: '第一行' });
    const singleHeight = single.bubble.getBoundingClientRect().height;
    const { bubble } = await render({ label: '第一行\n第二行' });
    expect(getComputedStyle(bubble).whiteSpace).toBe('pre-line');
    expect(bubble.getBoundingClientRect().height).toBeGreaterThan(singleHeight * 1.5);
  });
});

describe('GameTooltip with a lazy trigger', () => {
  it('describes the focusable element after mount, and removes the description on unmount', async () => {
    const payload = { status: 'resolved', value: <GameButton>触发</GameButton> };
    const lazy = {
      $$typeof: Symbol.for('react.lazy'),
      _payload: payload,
      _init: (resolved: typeof payload) => resolved.value,
    } as unknown as ReactElement;
    await act(async () => root.render(<GameTooltip label="提示">{lazy}</GameTooltip>));
    const trigger = host.querySelector<HTMLElement>('button')!;
    const bubble = host.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(trigger.getAttribute('aria-describedby')).toBe(bubble.id);
    await act(async () => root.render(null));
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
  });
});
