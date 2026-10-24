import type { KeyboardEvent, ReactNode } from 'react';

import { Icon } from '../../icons/Icon/Icon';

import { IconButton } from '../../controls/IconButton/IconButton';

import type { IconName } from '../../icons/registry';
import { type SurfaceDensity } from '../../containers/shared/surfaceTypes';

export type MovementDirection = 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down' | 'reset';

export interface MovementAction {
  direction: MovementDirection;
  disabled?: boolean;
  icon?: IconName;
  label: string;
  shortcut?: string;
  symbol?: string;
}

export interface MovementPadProps {
  actions?: readonly MovementAction[];
  className?: string;
  density?: SurfaceDensity;
  disabled?: boolean;
  helpText?: string;
  label: string;
  layout?: 'dpad' | 'row';
  onMove?: (direction: MovementDirection) => void;
}

const DEFAULT_MOVEMENT_ACTIONS: readonly MovementAction[] = [
  { direction: 'forward', label: 'Move forward', shortcut: 'W / ↑', symbol: '↑' },
  { direction: 'left', label: 'Move left', shortcut: 'A / ←', symbol: '←' },
  { direction: 'right', label: 'Move right', shortcut: 'D / →', symbol: '→' },
  { direction: 'backward', label: 'Move backward', shortcut: 'S / ↓', symbol: '↓' },
];

const MOVEMENT_KEY_MAP: Readonly<Record<string, MovementDirection>> = {
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

export function MovementPad({
  actions = DEFAULT_MOVEMENT_ACTIONS,
  className,
  density = 'comfortable',
  disabled = false,
  helpText,
  label,
  layout = 'dpad',
  onMove,
}: MovementPadProps): ReactNode {
  const classes = ['game-ui-movement-pad', className].filter(Boolean).join(' ');
  const triggerMove = (direction: MovementDirection): void => {
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
          <IconButton
            className="game-ui-movement-button"
            data-direction={action.direction}
            disabled={disabled || action.disabled}
            key={action.direction}
            label={action.label}
            onClick={() => triggerMove(action.direction)}
          >
            {action.icon ? (
              <Icon icon={action.icon} size={density === 'dense' ? 'sm' : 'md'} />
            ) : (
              <span aria-hidden="true">{action.symbol ?? action.label}</span>
            )}
            {action.shortcut ? <kbd>{action.shortcut}</kbd> : null}
          </IconButton>
        ))}
      </div>
      {helpText ? <p>{helpText}</p> : null}
    </section>
  );
}
