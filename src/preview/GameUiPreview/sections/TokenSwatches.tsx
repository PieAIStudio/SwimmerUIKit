import { type ReactNode } from 'react';

import { CLAY_COLOR_TOKENS } from '../../../tokens/legacy';

export function TokenSwatches(): ReactNode {
  return (
    <div aria-label="Clay color swatches" className="game-ui-swatch-grid">
      {Object.entries(CLAY_COLOR_TOKENS).map(([name, value]) => (
        <figure className="game-ui-swatch" key={name}>
          <span style={{ background: value }} />
          <figcaption>
            <strong>{name}</strong>
            <code>{value}</code>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
