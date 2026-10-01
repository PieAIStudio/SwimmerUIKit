import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { LiquidPressSurface } from '../../liquid/LiquidPressSurface/LiquidPressSurface';

import type { GameButtonSurface } from '../GameButton/GameButton';

import type { LiquidFinish } from '../../liquid/finish';

export interface GameIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  surface?: GameButtonSurface;
  liquidFinish?: LiquidFinish;
}

export function GameIconButton({
  children,
  className,
  label,
  surface = 'flat',
  liquidFinish,
  type = 'button',
  ...props
}: GameIconButtonProps): ReactNode {
  const classes = ['game-ui-icon-button', className].filter(Boolean).join(' ');
  const button = (
    <button
      aria-label={label}
      className={classes}
      data-game-ui-surface={surface === 'plaque' ? 'plaque' : undefined}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
  if (surface !== 'liquid' || props.disabled) return button;
  return (
    <LiquidPressSurface
      className="game-ui-icon-button-liquid"
      {...(liquidFinish === undefined ? {} : { liquidFinish })}
    >
      {button}
    </LiquidPressSurface>
  );
}
