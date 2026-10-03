import { type ReactNode } from 'react';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';

import { CLAY_ASSETS } from '../../../icons/assets';
import { useCopy } from '../context';

export function CardAndAssetSamples(): ReactNode {
  const { cards } = useCopy();
  return (
    <div className="game-ui-preview-two-up">
      <GamePanel title={cards.assetTitle} tone="strong">
        <p className="game-ui-small-copy">{cards.assetNote}</p>
        <div className="game-ui-asset-path-grid">
          <code>{CLAY_ASSETS.catalog.manifest}</code>
          <code>{CLAY_ASSETS.catalog.sourceCatalog}</code>
          <code>{CLAY_ASSETS.buttons.primary}</code>
          <code>{CLAY_ASSETS.icons.trophy}</code>
        </div>
      </GamePanel>
    </div>
  );
}
