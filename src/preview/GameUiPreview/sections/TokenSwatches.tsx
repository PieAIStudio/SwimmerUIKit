import { type ReactNode } from 'react';

import { semanticTokens } from '../../../tokens/references';

export function TokenSwatches(): ReactNode {
  return (
    <div aria-label="Flat color swatches" className="game-ui-swatch-grid">
      {Object.entries(semanticTokens).map(([name, value]) => (
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
