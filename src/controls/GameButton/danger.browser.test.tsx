import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { GameButton } from './GameButton';
import { GAME_UI_STYLES } from '../../tokens/styles';
import type { GameUiHue } from '../../tokens/hue';
import { contrastRatio } from '../../../scripts/lib/contrast.mjs';
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
const rgba = (value: string): number[] => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d')!;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data];
};
const paint = (button: HTMLButtonElement) => {
  const path = button.querySelector('path')!;
  return {
    text: rgba(getComputedStyle(button).color),
    fill: rgba(getComputedStyle(path).fill),
    edge: rgba(getComputedStyle(path).stroke),
    width: getComputedStyle(path).strokeWidth,
  };
};

it('distinguishes danger from secondary in all six styles and both modes, with red ink, no red background and AA text', async () => {
  for (const style of GAME_UI_STYLES)
    for (const theme of ['light', 'dark'] as const)
      for (const hue of ['coral', 'sun', 'leaf', 'sky', 'grape', 'pink'] as GameUiHue[]) {
        await act(async () =>
          root.render(
            <div data-game-ui-style={style} data-game-ui-theme={theme}>
              <GameButton variant="secondary" hue={hue}>
                普通
              </GameButton>
              <GameButton variant="danger" hue={hue}>
                删除
              </GameButton>
              <GameButton variant="danger" hue={hue} aria-pressed>
                选中删除
              </GameButton>
              <span
                data-probe
                style={{ color: 'var(--game-ui-danger-ink)', background: 'var(--game-ui-danger)' }}
              />
            </div>,
          ),
        );
        const [ordinary, danger, selected] = [...host.querySelectorAll('button')].map(paint);
        const probe = getComputedStyle(host.querySelector('[data-probe]')!);
        const ink = rgba(probe.color),
          red = rgba(probe.backgroundColor);
        const context = `${style}/${theme}/${hue}`;
        for (const result of [danger!, selected!]) {
          expect(result.text, context).not.toEqual(ordinary!.text);
          expect(result.text, context).toEqual(ink);
          expect(result.fill, context).toEqual(ordinary!.fill);
          expect(result.fill, context).not.toEqual(red);
          expect(result.fill[3], context).toBe(255);
          expect(contrastRatio(result.text, result.fill), context).toBeGreaterThanOrEqual(4.5);
          if (style === 'outline' || style === 'ink') expect(result.edge, context).toEqual(ink);
        }
      }
});

it('keeps disabled danger quiet and never turns it into a liquid invitation', async () => {
  await act(async () =>
    root.render(
      <GameButton variant="danger" disabled>
        不可删除
      </GameButton>,
    ),
  );
  const button = host.querySelector('button')!;
  expect(button.disabled).toBe(true);
  expect(button.querySelector('filter')).toBeNull();
  const probe = document.createElement('span');
  probe.style.color = 'var(--game-ui-control-disabled-text)';
  button.append(probe);
  expect(getComputedStyle(button).color).toBe(getComputedStyle(probe).color);
});
