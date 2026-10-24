import { type ReactNode } from 'react';

import { Badge } from '../../../feedback/Badge/Badge';
import { useCopy } from '../context';
import { HudAndStage } from './HudAndStage';

export function ResponsiveProofFrames(): ReactNode {
  const { responsive } = useCopy();
  return (
    <div className="game-ui-proof-frames">
      <article className="game-ui-proof-frame is-desktop">
        <header>
          <Badge>{responsive.desktop}</Badge>
          <strong>1440×900</strong>
        </header>
        <HudAndStage />
      </article>
      <article className="game-ui-proof-frame is-mobile-landscape">
        <header>
          <Badge>{responsive.mobileLandscape}</Badge>
          <strong>844×390</strong>
        </header>
        <HudAndStage />
      </article>
    </div>
  );
}
