import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { GameMaterialSwatches } from './GameMaterialSwatches';

const materials = [
  { id: 'a', label: 'Warm', color: '#f4876b', meta: 'First palette' },
  { id: 'b', label: 'Cool', color: '#6bb3ea', disabled: true },
];

describe('shared material swatches, independent of terrain tools', () => {
  it('keeps the labelled selection and selected state', () => {
    const html = renderToStaticMarkup(
      <GameMaterialSwatches label="Palette" materials={materials} activeMaterialId="a" />,
    );
    expect(html).toContain('role="listbox"');
    expect(html).toContain('aria-label="Palette"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-describedby="a-material-meta"');
    expect(html).toContain('id="a-material-meta"');
  });
  it('keeps per-palette colour channels and disabled choices', () => {
    const html = renderToStaticMarkup(
      <GameMaterialSwatches label="Palette" materials={materials} />,
    );
    expect(html).toContain('--swatch-color:#f4876b');
    expect(html).toContain('--swatch-secondary-color:#f4876b');
    expect(html).toContain('disabled=""');
    expect(html).toContain('data-swatch-pattern="solid"');
  });
});
