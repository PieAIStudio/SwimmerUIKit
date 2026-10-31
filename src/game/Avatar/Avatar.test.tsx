import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';

function initials(html: string): string | undefined {
  return /class="game-ui-avatar-initials">([^<]*)</.exec(html)?.[1];
}

describe('Avatar', () => {
  it('shows up to two uppercase initials and keeps the full name for screen readers', () => {
    const html = renderToStaticMarkup(<Avatar name="  ada   lovelace byron " />);
    expect(initials(html)).toBe('AL');
    expect(html).toContain('<span class="game-ui-sr-only">  ada   lovelace byron </span>');
    expect(html).not.toContain('<img');
  });

  it('falls back to a question mark for a blank name', () => {
    expect(initials(renderToStaticMarkup(<Avatar name="   " />))).toBe('?');
  });

  it('keeps a character outside the basic plane whole instead of splitting it', () => {
    // 𠮷 (U+20BB7) and emoji are two UTF-16 code units. Taking `part[0]`
    // keeps only a lone surrogate, which renders as a broken glyph.
    expect(initials(renderToStaticMarkup(<Avatar name="𠮷野 家" />))).toBe('𠮷家');
    expect(initials(renderToStaticMarkup(<Avatar name="😀 smile" />))).toBe('😀S');
  });

  it('uses the image with the name as alt text when a source is given', () => {
    const html = renderToStaticMarkup(<Avatar name="Ada" src="/ada.png" status="online" />);
    expect(html).toContain('<img alt="Ada" src="/ada.png"/>');
    expect(html).not.toContain('game-ui-avatar-initials');
    expect(html).toContain('data-avatar-status="online"');
    expect(html).toContain('class="game-ui-avatar-status"');
  });

  it('hides the status dot by default and marks the optional plaque surface', () => {
    const flat = renderToStaticMarkup(<Avatar name="Ada" />);
    expect(flat).not.toContain('game-ui-avatar-status"');
    expect(flat).not.toContain('data-game-ui-surface');
    expect(flat).toContain('data-avatar-size="md"');
    const plaque = renderToStaticMarkup(<Avatar name="Ada" size="xl" surface="plaque" />);
    expect(plaque).toContain('data-game-ui-surface="plaque"');
    expect(plaque).toContain('data-avatar-size="xl"');
  });
});
