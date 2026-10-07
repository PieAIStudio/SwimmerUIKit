import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GameButton, GameIconButton } from '../src/index';

describe('native action metadata is independent of link intent', () => {
  it('forwards native button metadata without inventing a link or losing submit semantics', () => {
    const html = renderToStaticMarkup(
      <GameButton rel="tag" type="submit" name="account" value="save">
        Save
      </GameButton>,
    );
    expect(html).toContain('<button');
    expect(html).toContain('rel="tag"');
    expect(html).toContain('type="submit"');
    expect(html).toContain('name="account"');
    expect(html).toContain('value="save"');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('href=');
  });
  it('gives icon buttons the same native metadata contract while keeping their accessible label', () => {
    const html = renderToStaticMarkup(
      <GameIconButton rel="tag" label="Account">
        A
      </GameIconButton>,
    );
    expect(html).toContain('<button');
    expect(html).toContain('rel="tag"');
    expect(html).toContain('aria-label="Account"');
    expect(html).not.toContain('<a ');
  });
  it('still protects actual new-window links without dropping their authored relationship', () => {
    const html = renderToStaticMarkup(
      <GameButton href="/account" target="_blank" rel="help">
        Account
      </GameButton>,
    );
    expect(html).toContain('<a ');
    expect(html).toContain('rel="help noopener noreferrer"');
    expect(html).not.toContain('<button');
  });
});
