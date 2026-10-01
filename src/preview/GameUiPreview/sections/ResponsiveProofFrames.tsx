import { type ReactNode } from 'react';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';
import { useCopy } from '../context';
import { HudAndStage } from './HudAndStage';

export function ResponsiveProofFrames(): ReactNode {
  const { responsive } = useCopy();
  return (
    <div className="game-ui-proof-frames">
      <article className="game-ui-proof-frame is-desktop">
        <header>
          <GameBadge>{responsive.desktop}</GameBadge>
          <strong>1440×900</strong>
        </header>
        <HudAndStage />
      </article>
      <article className="game-ui-proof-frame is-mobile-landscape">
        <header>
          <GameBadge>{responsive.mobileLandscape}</GameBadge>
          <strong>844×390</strong>
        </header>
        <HudAndStage />
      </article>
    </div>
  );
}
