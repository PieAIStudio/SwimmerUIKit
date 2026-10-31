import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GAME_ICONS } from '../registry';
import { ToolIcon, type ToolIconName } from './ToolIcon';

function paths(html: string): string[] {
  return [...html.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1] ?? '');
}

describe('ToolIcon', () => {
  it('prefers the kit icon when the name exists in the main registry', () => {
    const html = renderToStaticMarkup(<ToolIcon name="search" />);
    expect(paths(html)).toEqual([...GAME_ICONS.search.paths]);
  });

  it('draws a tool-only glyph that the kit registry does not have', () => {
    const names: ToolIconName[] = ['back', 'chev', 'sync', 'wifi'];
    for (const name of names) {
      expect(name in GAME_ICONS, name).toBe(false);
      expect(paths(renderToStaticMarkup(<ToolIcon name={name} />)).length, name).toBeGreaterThan(0);
    }
  });

  it('is decorative by default and an image when labelled', () => {
    const plain = renderToStaticMarkup(<ToolIcon name="back" />);
    expect(plain).toContain('aria-hidden="true"');
    expect(plain).not.toContain('role="img"');
    expect(plain).toContain('width="18"');
    expect(plain).toContain('focusable="false"');

    const labelled = renderToStaticMarkup(
      <ToolIcon className="extra" label="Back" name="back" size={24} />,
    );
    expect(labelled).toContain('role="img"');
    expect(labelled).toContain('aria-label="Back"');
    expect(labelled).not.toContain('aria-hidden');
    expect(labelled).toContain('class="game-ui-tool-icon extra"');
    expect(labelled).toContain('height="24"');
  });

  it('renders an empty icon rather than throwing for an unknown name', () => {
    const html = renderToStaticMarkup(<ToolIcon name={'nope' as ToolIconName} />);
    expect(html).toContain('<svg');
    expect(paths(html)).toEqual([]);
  });
});
