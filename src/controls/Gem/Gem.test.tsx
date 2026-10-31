import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ActionPill } from '../ActionPill/ActionPill';
import { Gem } from './Gem';

describe('Gem', () => {
  it('is hidden from assistive technology unless labelled', () => {
    const plain = renderToStaticMarkup(<Gem>★</Gem>);
    expect(plain).toBe('<span aria-hidden="true" class="game-ui-gem game-ui-gem--sm">★</span>');

    const labelled = renderToStaticMarkup(<Gem className="x" label="Starred" size="lg" />);
    expect(labelled).toContain('role="img"');
    expect(labelled).toContain('aria-label="Starred"');
    expect(labelled).not.toContain('aria-hidden');
    expect(labelled).toContain('class="game-ui-gem game-ui-gem--lg x"');
  });
});

describe('ActionPill', () => {
  it('defaults to a non-submitting button and keeps host attributes', () => {
    const html = renderToStaticMarkup(
      <ActionPill className="wide" disabled>
        Clean up
      </ActionPill>,
    );
    expect(html).toContain('type="button"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('class="game-ui-action-pill wide"');
    expect(html).toContain('data-tool-action-pill="true"');
    expect(html).toContain('>Clean up</button>');
  });

  it('lets a form opt in to submit', () => {
    expect(renderToStaticMarkup(<ActionPill type="submit">Go</ActionPill>)).toContain(
      'type="submit"',
    );
  });
});
