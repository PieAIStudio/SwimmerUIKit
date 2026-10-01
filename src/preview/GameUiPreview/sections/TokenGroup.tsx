import { type ReactNode } from 'react';

import {
  CLAY_ASSET_SIZE_TOKENS,
  CLAY_COLOR_TOKENS,
  CLAY_ELEVATION_TOKENS,
  CLAY_LAYER_TOKENS,
  CLAY_LIQUID_GOOEY_TOKENS,
  CLAY_LIQUID_METAL_TOKENS,
  CLAY_MOTION_TOKENS,
  CLAY_OVERLAY_GLASS_TOKENS,
  CLAY_RADIUS_TOKENS,
  CLAY_SCROLLBAR_TOKENS,
  CLAY_SEMANTIC_TOKENS,
  CLAY_SPACE_TOKENS,
  CLAY_TARGET_TOKENS,
  CLAY_TYPE_TOKENS,
} from '../../../tokens/legacy';

export const tokenGroups = [
  { id: 'colors', tokens: CLAY_COLOR_TOKENS },
  { id: 'semantic', tokens: CLAY_SEMANTIC_TOKENS },
  { id: 'typography', tokens: CLAY_TYPE_TOKENS },
  { id: 'spacing', tokens: CLAY_SPACE_TOKENS },
  { id: 'radius', tokens: CLAY_RADIUS_TOKENS },
  { id: 'scrollbars', tokens: CLAY_SCROLLBAR_TOKENS },
  { id: 'elevation', tokens: CLAY_ELEVATION_TOKENS },
  { id: 'motion', tokens: CLAY_MOTION_TOKENS },
  { id: 'overlayGlass', tokens: CLAY_OVERLAY_GLASS_TOKENS },
  { id: 'liquidMetal', tokens: CLAY_LIQUID_METAL_TOKENS },
  { id: 'liquidGooey', tokens: CLAY_LIQUID_GOOEY_TOKENS },
  { id: 'layers', tokens: CLAY_LAYER_TOKENS },
  { id: 'targets', tokens: CLAY_TARGET_TOKENS },
  { id: 'assetSizing', tokens: CLAY_ASSET_SIZE_TOKENS },
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
