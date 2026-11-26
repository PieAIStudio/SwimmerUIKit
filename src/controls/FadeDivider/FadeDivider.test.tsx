import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FadeDivider } from './FadeDivider';

describe('FadeDivider', () => {
  it('marks a horizontal divider with the semantic separator role', () => {
    const html = renderToStaticMarkup(<FadeDivider theme="paper" />);
    expect(html).toContain('role="separator"');
    expect(html).toContain('aria-orientation="horizontal"');
    expect(html).toContain('data-v12-theme="paper"');
  });

  it('supports the vertical orientation', () => {
    const html = renderToStaticMarkup(<FadeDivider orientation="vertical" />);
    expect(html).toContain('game-ui-v12-fade-divider--vertical');
    expect(html).toContain('aria-orientation="vertical"');
  });
});
