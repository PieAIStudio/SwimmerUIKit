import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { LiquidGroup } from '../../liquid/LiquidGroup/LiquidGroup';

import type { GameButtonSurface } from '../GameButton/GameButton';

import type { LiquidFinish } from '../../liquid/finish';

export interface GameToggleProps extends Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'onClick'
> {
  checked: boolean;
  label: string;
  surface?: Exclude<GameButtonSurface, 'plaque'>;
  liquidFinish?: LiquidFinish;
}

export function GameToggle({
  checked,
  disabled,
  label,
  onClick,
  surface = 'flat',
  liquidFinish,
}: GameToggleProps): ReactNode {
  return (
    <button
      aria-checked={checked}
      className="game-ui-toggle"
      disabled={disabled}
      onClick={onClick}
      role="switch"
      type="button"
      data-toggle-surface={surface === 'liquid' && !disabled ? 'liquid' : undefined}
    >
      <span>{label}</span>
      {surface === 'liquid' && !disabled ? (
        <span aria-hidden="true" className="game-ui-toggle-liquid-track">
          <LiquidGroup
            className="game-ui-toggle-liquid-body"
            blur={3}
            contrast={18}
            liquidFinish={liquidFinish ?? 'glossy'}
            fill="var(--game-ui-text)"
            filterPadding={10}
          >
            <LiquidGroup.Item
              className="game-ui-toggle-liquid-thumb"
              radius={999}
              x={checked ? 24 : 0}
              transition="wobbly"
            >
              <span />
            </LiquidGroup.Item>
          </LiquidGroup>
        </span>
      ) : (
        <span aria-hidden="true" className="game-ui-toggle-track" />
      )}
    </button>
  );
}
