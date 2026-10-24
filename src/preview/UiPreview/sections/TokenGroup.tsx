import { type ReactNode } from 'react';

import {
  assetSizeTokens,
  elevationTokens,
  layerTokens,
  liquidTokens,
  motionTokens,
  overlayTokens,
  radiusTokens,
  scrollbarTokens,
  semanticTokens,
  spaceTokens,
  targetTokens,
  typeTokens,
} from '../../../tokens/references';

export const tokenGroups = [
  { id: 'semantic', tokens: semanticTokens },
  { id: 'typography', tokens: typeTokens },
  { id: 'spacing', tokens: spaceTokens },
  { id: 'radius', tokens: radiusTokens },
  { id: 'scrollbars', tokens: scrollbarTokens },
  { id: 'elevation', tokens: elevationTokens },
  { id: 'motion', tokens: motionTokens },
  { id: 'overlayGlass', tokens: overlayTokens },
  { id: 'liquidGooey', tokens: liquidTokens },
  { id: 'layers', tokens: layerTokens },
  { id: 'targets', tokens: targetTokens },
  { id: 'assetSizing', tokens: assetSizeTokens },
] as const;

export function TokenGroup({
  id,
  label,
  tokens,
}: {
  id: string;
  label: string;
  tokens: Readonly<Record<string, string | number>>;
}): ReactNode {
  return (
    <article className="game-ui-token-card">
      <h3>{label}</h3>
      <div className="game-ui-token-grid">
        {Object.entries(tokens).map(([name, value]) => (
          <div className="game-ui-token-row" key={`${id}-${name}`}>
            <span>{name}</span>
            <code>{String(value)}</code>
          </div>
        ))}
      </div>
    </article>
  );
}
