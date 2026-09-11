import { useState, type ButtonHTMLAttributes, type MouseEventHandler, type ReactNode } from 'react';

import { playGameInteractionSound, type GameInteractionSoundOptions } from './interactionSound';
import { LiquidSurface } from './LiquidSurface';

export type GameButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

/*
 * How the button is drawn, kept separate from `variant` on purpose.
 *
 * `variant` is a tone — what the button means. Folding 'liquid' into that union
 * would have made the brand's signature surface mutually exclusive with saying
 * 「this one is dangerous」, and there is no reason a destructive action cannot
 * be liquid. Two axes cost one extra prop and keep every combination sayable.
 */
export type GameButtonSurface = 'flat' | 'liquid';

export interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  sound?: GameInteractionSoundOptions | false;
  /** Disable the scale-on-press feedback where the motion would distract. */
  static?: boolean;
  /**
   * Draw the button on a liquid body. The button itself is unchanged — same
   * element, same classes, same hit target; a silhouette behind it does the
   * deforming, so text stays crisp and the tap target never shrinks.
   */
  surface?: GameButtonSurface;
  variant?: GameButtonVariant;
}

export function GameButton({
  children,
  className,
  onClick,
  sound = false,
  static: isStatic = false,
  surface = 'flat',
  type = 'button',
  variant = 'secondary',
  ...props
}: GameButtonProps): ReactNode {
  const [pressed, setPressed] = useState(false);
  const classes = [
    'game-ui-button',
    `game-ui-button--${variant}`,
    isStatic && 'game-ui-button--static',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (sound) playGameInteractionSound(sound);
    onClick?.(event);
  };

  const button = (
    <button className={classes} onClick={handleClick} type={type} {...props}>
      {children}
    </button>
  );
  if (surface !== 'liquid') return button;

  /*
   * The press state lives here rather than on the silhouette because only the
   * button receives the events; the body below it is `pointer-events: none` by
   * design, which is what keeps the real control clickable.
   */
  return (
    <LiquidSurface
      active={pressed && props.disabled !== true}
      className="game-ui-button-liquid"
      form="press"
    >
      <span
        onBlur={() => setPressed(false)}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') setPressed(true);
        }}
        onKeyUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onPointerDown={() => setPressed(true)}
        onPointerLeave={() => setPressed(false)}
        onPointerUp={() => setPressed(false)}
      >
        {button}
      </span>
    </LiquidSurface>
  );
}
