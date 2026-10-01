import type { KeyboardEvent, ReactNode } from 'react';

import { GameAssetIcon } from '../../icons/GameAssetIcon/GameAssetIcon';

import { GameIconButton } from '../../controls/GameIconButton/GameIconButton';

import type { ClayIconName } from '../../icons/assets';
import { type GameSurfaceDensity } from '../../containers/shared/surfaceTypes';

export type GameMovementDirection =
  | 'forward'
  | 'backward'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'reset';

export interface GameMovementAction {
  direction: GameMovementDirection;
  disabled?: boolean;
  icon?: ClayIconName;
  label: string;
  shortcut?: string;
  symbol?: string;
}

export interface GameMovementPadProps {
  actions?: readonly GameMovementAction[];
  className?: string;
  density?: GameSurfaceDensity;
  disabled?: boolean;
  helpText?: string;
  label: string;
  layout?: 'dpad' | 'row';
  onMove?: (direction: GameMovementDirection) => void;
}

const DEFAULT_MOVEMENT_ACTIONS: readonly GameMovementAction[] = [
  { direction: 'forward', label: 'Move forward', shortcut: 'W / ↑', symbol: '↑' },
  { direction: 'left', label: 'Move left', shortcut: 'A / ←', symbol: '←' },
  { direction: 'right', label: 'Move right', shortcut: 'D / →', symbol: '→' },
  { direction: 'backward', label: 'Move backward', shortcut: 'S / ↓', symbol: '↓' },
];

const MOVEMENT_KEY_MAP: Readonly<Record<string, GameMovementDirection>> = {
  ArrowUp: 'forward',
  w: 'forward',
  W: 'forward',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  ArrowDown: 'backward',
  s: 'backward',
  S: 'backward',
  ' ': 'reset',
};

export function GameMovementPad({
  actions = DEFAULT_MOVEMENT_ACTIONS,
  className,
  density = 'comfortable',
  disabled = false,
  helpText,
  label,
  layout = 'dpad',
  onMove,
}: GameMovementPadProps): ReactNode {
  const classes = ['game-ui-movement-pad', className].filter(Boolean).join(' ');
  const triggerMove = (direction: GameMovementDirection): void => {
    if (!disabled) onMove?.(direction);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const direction = MOVEMENT_KEY_MAP[event.key];
    if (!direction) return;
    const action = actions.find((item) => item.direction === direction);
    if (!action || action.disabled || disabled) return;
    event.preventDefault();
    triggerMove(direction);
  };

  return (
    <section
      aria-label={label}
      className={classes}
      data-density={density}
      data-layout={layout}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="game-ui-movement-pad-grid">
        {actions.map((action) => (
          <GameIconButton
            className="game-ui-movement-button"
            data-direction={action.direction}
            disabled={disabled || action.disabled}
            key={action.direction}
            label={action.label}
            onClick={() => triggerMove(action.direction)}
          >
            {action.icon ? (
              <GameAssetIcon
                icon={action.icon}
                size={density === 'dense' ? 'sm' : 'md'}
                style="line"
              />
            ) : (
              <span aria-hidden="true">{action.symbol ?? action.label}</span>
            )}
            {action.shortcut ? <kbd>{action.shortcut}</kbd> : null}
          </GameIconButton>
        ))}
      </div>
      {helpText ? <p>{helpText}</p> : null}
    </section>
  );
}
