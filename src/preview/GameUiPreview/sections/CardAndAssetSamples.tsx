import { type ReactNode } from 'react';

import { GameCardFan } from '../../../game/GameCardFan/GameCardFan';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';

import { CLAY_ASSETS } from '../../../icons/assets';
import { useCopy } from '../context';

export function CardAndAssetSamples(): ReactNode {
  const { cards } = useCopy();
  return (
    <div className="game-ui-preview-two-up">
      <GamePanel title={cards.fanTitle} tone="strong">
        <GameCardFan
          label={cards.fanLabel}
          cards={[
            { id: 'human', icon: 'home', kicker: cards.human, title: 'Mika' },
            { id: 'ai', icon: 'ai', kicker: cards.ai, title: 'River' },
            { id: 'sympathizer', icon: 'crown', kicker: cards.sympathizer, title: 'Noa' },
          ]}
        />
      </GamePanel>
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
