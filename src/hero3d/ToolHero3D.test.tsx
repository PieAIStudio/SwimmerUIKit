import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ToolHero3D } from './ToolHero3D';

const model = {
  build: () => {
    throw new Error('The builder must stay client-side during SSR');
  },
  fallback: '/placeholder.png',
};

describe('ToolHero3D fallback contract', () => {
  it('renders a visible PNG fallback without touching Three.js during SSR', () => {
    const html = renderToStaticMarkup(<ToolHero3D model={model} />);
    expect(html).toContain('data-tool-hero-3d="true"');
    expect(html).toContain('data-hero-state="loading"');
    expect(html).toContain('src="/placeholder.png"');
    expect(html).toContain('game-ui-tool-hero3d-fallback');
  });
});
