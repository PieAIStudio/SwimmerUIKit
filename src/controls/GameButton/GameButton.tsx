import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import {
  playGameInteractionSound,
  type GameInteractionSoundOptions,
} from '../../feedback/sound/interactionSound';
import { LiquidPressSurface } from '../../liquid/LiquidPressSurface/LiquidPressSurface';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type GameUiHue } from '../../tokens/hue';

export type GameButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  hue?: GameUiHue;
  sound?: GameInteractionSoundOptions | false;
  /** Opt out of press deformation without changing native semantics. */
  static?: boolean;
  /** Primary is the one liquid CTA; every other action is a flat droplet. */
  variant?: GameButtonVariant;
}

export const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(function GameButton(
  {
    children,
    className,
    fullWidth = false,
    hue,
    onClick,
    sound = false,
    static: isStatic = false,
    type = 'button',
    variant = 'secondary',
    style,
    ...props
  },
  ref,
): ReactNode {
  const control = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => control.current!);
  // Nerve owns the contained body's paint; adding another silhouette behind it
  // would render two liquid bodies and spend two independent filter budgets.
  const delegated =
    (props as Record<string, unknown>)['data-game-ui-control'] === 'liquid-presence';
  const cta = variant === 'primary' && !props.disabled && !delegated;
  const meaningful = variant === 'danger' || variant === 'success';
  const classes = [
    'game-ui-button',
    `game-ui-button--${variant}`,
    fullWidth && 'game-ui-button--full-width',
    isStatic && 'game-ui-button--static',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const click: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (sound) playGameInteractionSound(sound);
    onClick?.(event);
  };
  return (
    <LiquidPressSurface control={control} enabled={cta} static={isStatic} fullWidth={fullWidth}>
      <button
        {...props}
        key="control"
        ref={control}
        className={classes}
        type={type}
        onClick={click}
        data-game-ui-paint=""
        data-game-ui-cta={cta ? 'true' : undefined}
        data-game-ui-meaning={meaningful ? 'true' : undefined}
        data-game-ui-danger={variant === 'danger' ? 'true' : undefined}
        style={{
          ...controlHue(hue ?? (variant === 'success' ? 'leaf' : 'sky')),
          ...style,
        }}
      >
        {!cta && !delegated ? <DropletSurface static={isStatic} /> : null}
        {children}
        {props['aria-pressed'] !== undefined ? <SelectionMark /> : null}
      </button>
    </LiquidPressSurface>
  );
});
