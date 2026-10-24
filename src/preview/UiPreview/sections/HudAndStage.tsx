import { type ReactNode } from 'react';
import { HudActions } from '../../../containers/HudActions/HudActions';

import { Icon } from '../../../icons/Icon/Icon';

import { StageTile } from '../../../game/StageTile/StageTile';

import { Button } from '../../../controls/Button/Button';

import { IconButton } from '../../../controls/IconButton/IconButton';
import { useCopy } from '../context';

export function HudAndStage(): ReactNode {
  const { hud, tiles } = useCopy();
  return (
    <div className="game-ui-stage-demo">
      <div aria-label="Flat world HUD preview" className="game-ui-stage-world">
        <HudActions label={hud.tools}>
          <IconButton label={hud.history}>
            <Icon icon="scroll" size="sm" />
          </IconButton>
          <IconButton label={hud.settings}>
            <Icon icon="settings" size="sm" />
          </IconButton>
        </HudActions>
        <div aria-hidden="true" className="game-ui-table-prop">
          <span className="game-ui-seat is-host" />
          <span className="game-ui-seat is-guest-a" />
          <span className="game-ui-seat is-guest-b" />
          <span className="game-ui-seat-callout is-a">{hud.calloutA}</span>
          <span className="game-ui-seat-callout is-b">{hud.calloutB}</span>
        </div>
        <div className="game-ui-input-strip">
          <Button variant="secondary">{hud.emote}</Button>
          <Button variant="primary">{hud.sendRead}</Button>
        </div>
      </div>
      <div className="game-ui-stage-sidecar">
        <StageTile
          badge={tiles.daily.badge}
          icon="scroll"
          kicker={tiles.daily.kicker}
          selected
          summary={tiles.daily.summary}
          title={tiles.daily.title}
          tone="daily"
        />
        <StageTile
          badge={tiles.portal.badge}
          icon="portal"
          kicker={tiles.portal.kicker}
          summary={tiles.portal.summary}
          title={tiles.portal.title}
          tone="portal"
        />
        <StageTile
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
