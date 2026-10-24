import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { SegmentedControl } from './SegmentedControl';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
let viewport: { width: number; height: number };

beforeEach(() => {
  viewport = { width: innerWidth, height: innerHeight };
  host = document.createElement('div');
  host.style.padding = '16px';
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  await page.viewport(viewport.width, viewport.height);
});

const options = [
  { id: 'prompt', label: 'Describe the party you want to create' },
  { id: 'template', label: 'Start with a ready-made party template' },
  { id: 'import', label: 'Import an existing game configuration' },
  { id: 'long', label: 'AReallyLongLabelWithNoBreakOpportunitiesAtAll' },
];

describe('SegmentedControl long labels', () => {
  it.each([360, 1024])('keeps complete labels inside their targets at %i px', async (width) => {
    await page.viewport(width, 720);
    const onSelect = vi.fn();
    const render = async (activeId: string) => {
      await act(async () =>
        root.render(
          <SegmentedControl
            label="Party setup"
            activeId={activeId}
            options={options}
            onSelect={onSelect}
          />,
        ),
      );
    };
    await render('prompt');
    const buttons = [...host.querySelectorAll<HTMLButtonElement>('button')];
    const before = buttons.map((button) => button.getBoundingClientRect());
    for (const [index, button] of buttons.entries()) {
      const bounds = button.getBoundingClientRect();
      const label = [...button.querySelectorAll<HTMLSpanElement>('span')].find(
        (span) => span.textContent === options[index]!.label,
      )!;
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(width);
      expect(label.scrollWidth, options[index]!.label).toBeLessThanOrEqual(label.clientWidth + 1);
      const range = document.createRange();
      range.selectNodeContents(label);
      for (const line of range.getClientRects()) {
        expect(line.left).toBeGreaterThanOrEqual(bounds.left);
        expect(line.right).toBeLessThanOrEqual(bounds.right);
      }
    }
    for (let index = 1; index < before.length; index++) {
      const previous = before[index - 1]!;
      const current = before[index]!;
      expect(current.top >= previous.bottom || current.left >= previous.right).toBe(true);
    }
    await act(async () => buttons[1]!.click());
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('template');
    await render('template');
    for (const [index, button] of buttons.entries()) {
      const after = button.getBoundingClientRect();
      expect(after.width).toBeCloseTo(before[index]!.width, 1);
      expect(after.height).toBeCloseTo(before[index]!.height, 1);
      expect(button.getAttribute('aria-pressed')).toBe(String(index === 1));
    }
  });
});
