import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameTooltip } from './GameTooltip';
import { GameButton } from '../../controls/GameButton/GameButton';

describe('GameTooltip placement and alignment', () => {
  it('keeps the existing centred bubble above the trigger by default', () => {
    const html = renderToStaticMarkup(
      <GameTooltip label="提示">
        <GameButton>按钮</GameButton>
      </GameTooltip>,
    );
    expect(html).toContain('data-tooltip-align="center"');
    expect(html).toContain('data-tooltip-placement="top"');
  });

  it('carries the requested alignment and placement on the bubble', () => {
    const html = renderToStaticMarkup(
      <GameTooltip align="end" label="提示" placement="bottom">
        <GameButton>按钮</GameButton>
      </GameTooltip>,
    );
    expect(html).toContain('data-tooltip-align="end"');
    expect(html).toContain('data-tooltip-placement="bottom"');
  });

  it('still links the trigger to the bubble it describes', () => {
    const html = renderToStaticMarkup(
      <GameTooltip align="start" label="提示">
        <GameButton>按钮</GameButton>
      </GameTooltip>,
    );
    const id = /<span id="([^"]+)" role="tooltip"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`aria-describedby="${id}"`);
  });
});

describe('GameTooltip with a lazy trigger', () => {
  it('renders a lazy child from a Server Component without reading its props', () => {
    const payload = { status: 'resolved', value: <GameButton>按钮</GameButton> };
    const lazy = {
      $$typeof: Symbol.for('react.lazy'),
      _payload: payload,
      _init: (resolved: typeof payload) => resolved.value,
    } as unknown as ReactElement;
    const html = renderToStaticMarkup(<GameTooltip label="提示">{lazy}</GameTooltip>);
    expect(html).toContain('class="game-ui-trigger-slot"');
    expect(html).toContain('<button');
    expect(html).toContain('role="tooltip"');
  });
});
