import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameButton } from './GameButton';

describe('GameButton fullWidth is an opt-in layout contract', () => {
  it('keeps default full-width behaviour unchanged while primary has the new CTA paint', () => {
    const html = renderToStaticMarkup(<GameButton variant="primary">Go</GameButton>);
    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(html).toContain('class="game-ui-button game-ui-button--primary"');
    expect(html).toContain('type="button"');
    expect(html).toContain('data-game-ui-cta="true"');
    expect(html).not.toContain('game-ui-button--full-width');
    expect(
      renderToStaticMarkup(
        <GameButton fullWidth={false} variant="primary">
          Go
        </GameButton>,
      ),
    ).toBe(renderToStaticMarkup(<GameButton variant="primary">Go</GameButton>));
  });

  it('does not leak the layout prop to native DOM', () => {
    const html = renderToStaticMarkup(
      <GameButton fullWidth type="submit" name="start">
        Go
      </GameButton>,
    );
    expect(html).toContain('game-ui-button--full-width');
    expect(html).toContain('type="submit"');
    expect(html).toContain('name="start"');
    expect(html).not.toContain('fullWidth=');
    expect(html).not.toContain('fullwidth=');
  });

  it('keeps one native button and uses the existing press form for a liquid CTA', () => {
    const html = renderToStaticMarkup(
      <GameButton fullWidth variant="primary">
        Go
      </GameButton>,
    );
    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(html).toContain('game-ui-button-frame');
    expect(html).toContain('data-full-width="true"');
    expect(html).toContain('game-ui-button--full-width');
    expect(html).toContain('data-liquid-form="press"');
    expect(html).toContain('aria-hidden="true"');
  });

  it('keeps the disabled fallback flat, including full-width layout', () => {
    const html = renderToStaticMarkup(
      <GameButton fullWidth disabled>
        Wait
      </GameButton>,
    );
    expect(html).toContain('game-ui-button--full-width');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('game-ui-liquid-surface');
  });
});
