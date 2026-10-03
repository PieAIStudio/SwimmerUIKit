import { type ReactNode } from 'react';

import { FirstSessionOnboarding } from '../../../game/FirstSessionOnboarding/FirstSessionOnboarding';
import { useCopy } from '../context';

export function FirstSessionSamples(): ReactNode {
  const { firstSession: fs } = useCopy();
  return (
    <div className="game-ui-first-session-preview">
      <div className="game-ui-first-session-world"></div>
      <div className="game-ui-first-session-modal-slot">
        <FirstSessionOnboarding
          open
          onDismiss={() => undefined}
          labels={{
            badge: fs.obBadge,
            body: fs.obBody,
            skip: fs.obSkip,
            start: fs.obStart,
            title: fs.obTitle,
            steps: [
              { title: fs.obMoveT, body: fs.obMoveB },
              { title: fs.obReadT, body: fs.obReadB },
              { title: fs.obVoteT, body: fs.obVoteB },
            ],
          }}
        />
      </div>
    </div>
  );
}
