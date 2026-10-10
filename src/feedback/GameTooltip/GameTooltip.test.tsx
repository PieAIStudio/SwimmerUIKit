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
