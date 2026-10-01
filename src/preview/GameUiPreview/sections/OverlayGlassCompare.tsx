import { type ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';

import { GameHud } from '../../../game/GameHud/GameHud';

import { GameProgress } from '../../../feedback/GameProgress/GameProgress';

import { GameButton } from '../../../controls/GameButton/GameButton';

import { GameHudActions } from '../../../containers/GameHudActions/GameHudActions';

import { GameIconButton } from '../../../controls/GameIconButton/GameIconButton';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';

import { GAME_UI_OVERLAY } from '../../../tokens/index';
import { useCopy } from '../context';

/** Same HUD cluster in default clay vs official overlay glass, on a busy stage. */
export function OverlayGlassCompare(): ReactNode {
  const { hud, buttons: b } = useCopy();
  const cluster = (scope: 'clay' | 'glass'): ReactNode => {
    const glass = scope === 'glass';
    return (
      <div
        aria-label={glass ? 'Overlay glass HUD' : 'Default clay HUD'}
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
        <GamePanel title={b.panelTitle}>
          <div className="game-ui-hud-cluster">
            <GameBadge tone="ai">{b.aiBadge}</GameBadge>
            <GameBadge tone="success">{b.readyBadge}</GameBadge>
            <GameProgress label={hud.reveal} value={68} />
          </div>
          <div className="game-ui-input-strip">
            <GameButton variant="secondary">{hud.emote}</GameButton>
            <GameButton variant="primary">{hud.sendRead}</GameButton>
            <GameButton variant="ghost">{b.leaveTable}</GameButton>
          </div>
        </GamePanel>
      </div>
    );
  };

  return (
    <div className="game-ui-overlay-glass-compare">
      <article className="game-ui-overlay-glass-column">
        <header>
          <strong>Default clay</strong>
          <span className="game-ui-small-copy">parchment surfaces · 44px floor</span>
        </header>
        {cluster('clay')}
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
