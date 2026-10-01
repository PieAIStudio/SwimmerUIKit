import { type ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameHud } from '../../../game/GameHud/GameHud';

import { GameStageTile } from '../../../game/GameStageTile/GameStageTile';

import { GameButton } from '../../../controls/GameButton/GameButton';

import { GameHudActions } from '../../../containers/GameHudActions/GameHudActions';

import { GameIconButton } from '../../../controls/GameIconButton/GameIconButton';
import { useCopy } from '../context';

export function HudAndStage(): ReactNode {
  const { hud, tiles } = useCopy();
  return (
    <div className="game-ui-stage-demo">
      <div aria-label="Clay world HUD preview" className="game-ui-stage-world">
        <GameHud
          label={hud.label}
          items={[
            {
              id: 'role',
              icon: 'lock',
              label: hud.youAre,
              value: hud.roleValue,
              meta: hud.rolePrivate,
            },
            { id: 'room', icon: 'copy', label: hud.room, value: '74X8VB' },
            { id: 'timer', icon: 'timer', label: hud.reveal, value: '02:46' },
          ]}
          actions={
            <GameHudActions label={hud.tools}>
              <GameIconButton label={hud.history}>
                <GameAssetIcon icon="scroll" size="sm" />
              </GameIconButton>
              <GameIconButton label={hud.settings}>
                <GameAssetIcon icon="settings" size="sm" />
              </GameIconButton>
            </GameHudActions>
          }
        />
        <div aria-hidden="true" className="game-ui-table-prop">
          <span className="game-ui-seat is-host" />
          <span className="game-ui-seat is-guest-a" />
          <span className="game-ui-seat is-guest-b" />
          <span className="game-ui-seat-callout is-a">{hud.calloutA}</span>
          <span className="game-ui-seat-callout is-b">{hud.calloutB}</span>
        </div>
        <div className="game-ui-input-strip">
          <GameButton variant="secondary">{hud.emote}</GameButton>
          <GameButton variant="primary">{hud.sendRead}</GameButton>
        </div>
      </div>
      <div className="game-ui-stage-sidecar">
        <GameStageTile
          badge={tiles.daily.badge}
          icon="scroll"
          kicker={tiles.daily.kicker}
          selected
          summary={tiles.daily.summary}
          title={tiles.daily.title}
          tone="daily"
        />
        <GameStageTile
          badge={tiles.portal.badge}
          icon="portal"
          kicker={tiles.portal.kicker}
          summary={tiles.portal.summary}
          title={tiles.portal.title}
          tone="portal"
        />
        <GameStageTile
          icon="energy"
          kicker={tiles.host.kicker}
          summary={tiles.host.summary}
          title={tiles.host.title}
          tone="host"
        />
      </div>
    </div>
  );
}
