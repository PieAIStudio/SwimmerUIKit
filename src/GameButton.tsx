import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';

import { playGameInteractionSound, type GameInteractionSoundOptions } from './interactionSound';

export type GameButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

export interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  sound?: GameInteractionSoundOptions | false;
  variant?: GameButtonVariant;
}

export function GameButton({
  children,
  className,
  onClick,
  sound = false,
  type = 'button',
  variant = 'secondary',
  ...props
}: GameButtonProps): ReactNode {
  const classes = ['game-ui-button', `game-ui-button--${variant}`, className]
    .filter(Boolean)
    .join(' ');
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (sound) playGameInteractionSound(sound);
    onClick?.(event);
  };

  return (
    <button className={classes} onClick={handleClick} type={type} {...props}>
      {children}
    </button>
  );
}
