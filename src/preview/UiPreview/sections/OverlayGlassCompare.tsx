import { type ReactNode } from 'react';
import { HudActions } from '../../../containers/HudActions/HudActions';

import { Icon } from '../../../icons/Icon/Icon';

import { Badge } from '../../../feedback/Badge/Badge';

import { Progress } from '../../../feedback/Progress/Progress';

import { Button } from '../../../controls/Button/Button';

import { IconButton } from '../../../controls/IconButton/IconButton';

import { Panel } from '../../../containers/Panel/Panel';

import { GAME_UI_OVERLAY } from '../../../tokens/index';
import { useCopy } from '../context';

/** Same HUD cluster in default flat vs official overlay glass, on a busy stage. */
export function OverlayGlassCompare(): ReactNode {
  const { hud, buttons: b } = useCopy();
  const cluster = (scope: 'flat' | 'glass'): ReactNode => {
    const glass = scope === 'glass';
    return (
      <div
        aria-label={glass ? 'Overlay glass HUD' : 'Default flat HUD'}
        className={[
          'game-ui-stage-world',
          'game-ui-overlay-glass-proof',
          glass ? GAME_UI_OVERLAY.scopeClass : undefined,
        ]
          .filter(Boolean)
          .join(' ')}
        {...(glass
          ? {
              [GAME_UI_OVERLAY.toneAttr]: GAME_UI_OVERLAY.toneGlass,
              [GAME_UI_OVERLAY.densityAttr]: GAME_UI_OVERLAY.densityCompact,
            }
          : {})}
      >
        <HudActions label={hud.tools}>
          <IconButton label={hud.history}>
            <Icon icon="scroll" size="sm" />
          </IconButton>
          <IconButton label={hud.settings}>
            <Icon icon="settings" size="sm" />
          </IconButton>
        </HudActions>
        <Panel title={b.panelTitle}>
          <div className="game-ui-preview-actions">
            <Badge tone="ai">{b.aiBadge}</Badge>
            <Badge tone="success">{b.readyBadge}</Badge>
            <Progress label={hud.reveal} value={68} />
          </div>
          <div className="game-ui-input-strip">
            <Button variant="secondary">{hud.emote}</Button>
            <Button variant="primary">{hud.sendRead}</Button>
            <Button variant="ghost">{b.leaveTable}</Button>
          </div>
        </Panel>
      </div>
    );
  };

  return (
    <div className="game-ui-overlay-glass-compare">
      <article className="game-ui-overlay-glass-column">
        <header>
          <strong>Default flat</strong>
          <span className="game-ui-small-copy">parchment surfaces · 44px floor</span>
        </header>
        {cluster('flat')}
      </article>
      <article className="game-ui-overlay-glass-column">
        <header>
          <strong>Overlay glass + compact</strong>
          <span className="game-ui-small-copy">
            {GAME_UI_OVERLAY.toneAttr}=&quot;{GAME_UI_OVERLAY.toneGlass}&quot; ·{' '}
            {GAME_UI_OVERLAY.densityAttr}=&quot;{GAME_UI_OVERLAY.densityCompact}&quot;
          </span>
        </header>
        {cluster('glass')}
      </article>
    </div>
  );
}
