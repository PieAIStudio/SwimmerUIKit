import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { GameIcon } from './GameIcon';
import { GAME_ICON_NAMES } from '../registry';

it.each(GAME_ICON_NAMES)('%s uses its reviewed path geometry', (icon) => {
  const html = renderToStaticMarkup(<GameIcon icon={icon} label={icon} />);
  expect(html).toContain('viewBox="0 0 24 24"');
  expect(html).toContain('stroke="currentColor"');
  expect(html).toContain('stroke-width="2"');
  expect(html).toContain('fill="none"');
  expect(html).toContain('role="img"');
  expect(html).not.toContain('<img');
  expect(html).not.toContain('href');
  expect(html).toMatchSnapshot();
});
it('keeps decorative icons silent and exposes only the three intended sizes', () => {
  for (const [size, pixels] of [
    ['sm', 16],
    ['md', 20],
    ['lg', 24],
  ] as const) {
    const html = renderToStaticMarkup(<GameIcon icon="check" size={size} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role=');
    expect(html).toContain(`width="${pixels}"`);
    expect(html).toContain(`height="${pixels}"`);
  }
});
