import { type ReactNode } from 'react';

import { FirstSessionHud } from '../../../game/FirstSessionHud/FirstSessionHud';

import { FirstSessionOnboarding } from '../../../game/FirstSessionOnboarding/FirstSessionOnboarding';
import { useCopy } from '../context';

export function FirstSessionSamples(): ReactNode {
  const { firstSession: fs } = useCopy();
  const labels = {
    controls: fs.controls,
    emote: fs.emote,
    goalLabel: fs.goalLabel,
    goalValue: fs.goalValue,
    streak: fs.streak,
    guest: fs.guest,
    history: fs.history,
    hud: fs.hud,
    input: fs.input,
    moveBadge: fs.moveBadge,
    move: fs.move,
    roomLabel: fs.roomLabel,
    roomValue: fs.roomValue,
    roleLabel: fs.roleLabel,
    roleValue: fs.roleValue,
    settings: fs.settings,
    shell: fs.shell,
    timerLabel: fs.timerLabel,
    timerValue: '02:46',
    tools: fs.tools,
    wardrobe: fs.wardrobe,
  };
  return (
    <div className="game-ui-first-session-preview">
      <div className="game-ui-first-session-world">
        <FirstSessionHud
          authenticated
          batteryCount={5}
          dailyStreak={3}
          labels={labels}
          onHistory={() => undefined}
          onSettings={() => undefined}
          onWardrobe={() => undefined}
          playerName={fs.playerName}
        />
      </div>
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
