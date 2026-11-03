import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { HowToPanel } from './HowToPanel';

it('renders only the first captioned step and localized non-submit navigation', () => {
  const html = renderToStaticMarkup(
    <HowToPanel
      label="Pair devices"
      previousLabel="Previous"
      nextLabel="Next"
      steps={[
        { media: <svg data-step="one" />, caption: 'Join the same Wi-Fi.' },
        { media: <svg data-step="two" />, caption: 'Keep both devices nearby.' },
      ]}
    />,
  );
  expect(html).toContain('aria-label="Join the same Wi-Fi."');
  expect(html).toContain('data-step="one"');
  expect(html).not.toContain('data-step="two"');
  expect(html).toContain('type="button"');
  expect(html).toContain('>Previous<');
  expect(html).toContain('disabled=""');
});
