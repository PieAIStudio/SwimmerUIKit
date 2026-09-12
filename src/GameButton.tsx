import { type ButtonHTMLAttributes, type MouseEventHandler, type ReactNode } from 'react';

import { playGameInteractionSound, type GameInteractionSoundOptions } from './interactionSound';
import { LiquidPressSurface } from './LiquidPressSurface';
import type { LiquidFinish } from './liquidGooeyFinish';

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
  /** Fill the available row, including the liquid silhouette and hit target. */
  fullWidth?: boolean;
  /** Named liquid material. Only used with surface="liquid"; omitted keeps the current look. */
  liquidFinish?: LiquidFinish;
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
  fullWidth = false,
  liquidFinish,
  onClick,
  sound = false,
  static: isStatic = false,
  surface = 'flat',
  type = 'button',
  variant = 'secondary',
  ...props
}: GameButtonProps): ReactNode {
  const classes = [
    'game-ui-button',
    `game-ui-button--${variant}`,
    fullWidth && 'game-ui-button--full-width',
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
  /*
   * A disabled control does not get the liquid surface at all.
   *
   * The first attempt muted the body's fill to the disabled token, which
   * produced the worst of both: a pale grey blob, large and glossy enough to
   * draw the eye, carrying text at roughly 1.2:1 against it. But the real
   * problem was upstream of the colour. Liquid is the brand's way of saying
   * 「press me」 — a wet, deformable surface is an invitation — and putting
   * that invitation on a control that cannot be pressed is a lie told loudly.
   * Falling back to the flat button says the true thing quietly.
   */
  if (surface !== 'liquid' || props.disabled === true) return button;

  /*
   * The shared press assembly listens to the native control's events, never
   * the pointer-transparent silhouette. Icon buttons reuse that boundary.
   */
  return (
    <LiquidPressSurface
      {...(liquidFinish === undefined ? {} : { liquidFinish })}
      static={isStatic}
      className={[
        'game-ui-button-liquid',
        `game-ui-button-liquid--${variant}`,
        fullWidth && 'game-ui-button-liquid--full-width',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {button}
    </LiquidPressSurface>
  );
}
