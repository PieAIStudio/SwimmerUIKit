import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge } from '../../feedback/GameBadge/GameBadge';

import { GameButton, type GameButtonVariant } from '../GameButton/GameButton';

import { GameHudActions } from '../../containers/GameHudActions/GameHudActions';

import { GameIconButton } from '../GameIconButton/GameIconButton';

import type { ClayIconName } from '../../icons/assets';
import { type GameSurfaceDensity } from '../../containers/shared/surfaceTypes';

export type GameActionStyle = 'button' | 'icon';

export interface GameUiAction {
  /** Accessible label override when the visible label is intentionally compact. */
  ariaLabel?: string;
  badge?: string;
  /** Short visual caption for dense/icon tool strips. Falls back to `label`. */
  compactLabel?: string;
  disabled?: boolean;
  icon?: ClayIconName;
  id: string;
  label: string;
  meta?: string;
  onAction?: (id: string) => void;
  selected?: boolean;
  shortcut?: string;
  tone?: GameButtonVariant;
}

export type GameActionIconLabelMode = 'hidden' | 'caption';

export interface GameActionGridProps {
  actions: readonly GameUiAction[];
  className?: string;
  density?: GameSurfaceDensity;
  iconLabelMode?: GameActionIconLabelMode;
  label: string;
  style?: GameActionStyle;
}

export function GameActionGrid({
  actions,
  className,
  density = 'comfortable',
  iconLabelMode = 'hidden',
  label,
  style = 'button',
}: GameActionGridProps): ReactNode {
  const classes = ['game-ui-action-grid', className].filter(Boolean).join(' ');
  return (
    <GameHudActions
      className={classes}
      data-icon-label-mode={style === 'icon' ? iconLabelMode : undefined}
      label={label}
    >
      <span className="game-ui-sr-only">{label}</span>
      {actions.map((action) => {
        const caption = action.compactLabel ?? action.label;
        const content = (
          <>
            {action.icon ? (
              <GameAssetIcon
                icon={action.icon}
                size={density === 'dense' ? 'sm' : 'md'}
                {...(style === 'icon' ? { style: 'line' as const } : {})}
              />
            ) : null}
            {style === 'button' ? <span>{action.label}</span> : null}
            {style === 'icon' && iconLabelMode === 'caption' ? (
              <span className="game-ui-action-grid-caption">{caption}</span>
            ) : null}
            {action.badge ? (
              <GameBadge tone={action.selected ? 'success' : 'neutral'}>{action.badge}</GameBadge>
            ) : null}
            {action.shortcut ? <kbd>{action.shortcut}</kbd> : null}
          </>
        );
        const runAction = (): void => action.onAction?.(action.id);

        if (style === 'icon') {
          return (
            <GameIconButton
              aria-pressed={action.selected}
              className="game-ui-action-grid-button"
              disabled={action.disabled}
              key={action.id}
              label={action.ariaLabel ?? action.label}
              onClick={runAction}
            >
              {content}
            </GameIconButton>
          );
        }

        return (
          <GameButton
            aria-pressed={action.selected}
            className="game-ui-action-grid-button"
            disabled={action.disabled}
            key={action.id}
            onClick={runAction}
            variant={action.tone ?? 'secondary'}
          >
            {content}
          </GameButton>
        );
      })}
    </GameHudActions>
  );
}
