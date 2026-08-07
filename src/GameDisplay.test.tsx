import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameProgress } from './GameDisplay';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('GameProgress', () => {
  it('renders valueLabel in place of the percentage, without requiring showValue', () => {
    const html = compact(
      renderToStaticMarkup(<GameProgress label="Lessons" max={21} value={3} valueLabel="3 / 21" />),
    );

    expect(html).toContain('game-ui-progress-value');
    expect(html).toContain('3 / 21');
    // Percentage must not appear as the visible value label (fill width still uses %).
    expect(html).not.toMatch(/game-ui-progress-value">\d+%/);
  });

  it('keeps showValue percentage behaviour when valueLabel is absent', () => {
    const withValue = compact(
      renderToStaticMarkup(<GameProgress label="Reveal" showValue value={64} />),
    );
    expect(withValue).toContain('game-ui-progress-value');
    expect(withValue).toContain('>64%<');

    const withoutValue = compact(renderToStaticMarkup(<GameProgress label="Reveal" value={64} />));
    expect(withoutValue).not.toContain('game-ui-progress-value');
  });

  it('sets aria-valuetext only when valueLabel is present', () => {
    const labeled = compact(
      renderToStaticMarkup(<GameProgress label="Lessons" max={21} value={3} valueLabel="3 / 21" />),
    );
    expect(labeled).toContain('aria-valuetext="3 / 21"');
    expect(labeled).toContain('role="progressbar"');

    const percent = compact(
      renderToStaticMarkup(<GameProgress label="Reveal" showValue value={64} />),
    );
    expect(percent).not.toContain('aria-valuetext');

    const bare = compact(renderToStaticMarkup(<GameProgress label="Reveal" value={64} />));
    expect(bare).not.toContain('aria-valuetext');
  });
});
