import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { LiquidReveal } from './LiquidReveal';

it('keeps real content outside the visual filter and has no implicit modal or media', () => {
  const html = renderToStaticMarkup(
    <LiquidReveal>
      <input aria-label="Original draft" defaultValue="retained" />
      <button>Open</button>
    </LiquidReveal>,
  );
  expect(html).toContain('Original draft');
  expect(html).toContain('retained');
  expect(html).not.toContain('<dialog');
  expect(html).not.toContain('<canvas');
  expect(html).not.toContain('<iframe');
  expect(html).not.toContain('autofocus');
});
