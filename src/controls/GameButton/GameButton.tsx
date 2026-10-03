import { forwardRef, useRef, type ReactNode } from 'react';
import {
  playGameInteractionSound,
  type GameInteractionSoundOptions,
} from '../../feedback/sound/interactionSound';
import { LiquidPressSurface } from '../../liquid/LiquidPressSurface/LiquidPressSurface';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type GameUiHue } from '../../tokens/hue';
import {
  NativeAction,
  useActionRef,
  type ActionElement,
  type ActionProps,
} from '../NativeAction/NativeAction';

export type GameButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type GameButtonProps = ActionProps & {
  children: ReactNode;
  fullWidth?: boolean;
  hue?: GameUiHue;
  sound?: GameInteractionSoundOptions | false;
  static?: boolean;
  variant?: GameButtonVariant;
  size?: 'md' | 'sm';
};

export const GameButton = forwardRef<ActionElement, GameButtonProps>(function GameButton(
  {
    children,
    className,
    fullWidth = false,
    hue,
    sound = false,
    static: isStatic = false,
    variant = 'secondary',
    size = 'md',
    style,
    ...props
  },
  ref,
) {
  const control = useRef<ActionElement | null>(null);
  const nativeRef = useActionRef(ref, control);
  const delegated =
    (props as Record<string, unknown>)['data-game-ui-control'] === 'liquid-presence';
  const cta = variant === 'primary' && !props.disabled && !delegated;
  const classes = [
    'game-ui-button',
    `game-ui-button--${variant}`,
    fullWidth && 'game-ui-button--full-width',
    isStatic && 'game-ui-button--static',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const identity = props.href === undefined ? 'button' : (props.linkComponent ?? 'a');
  return (
    <LiquidPressSurface
      control={control}
      controlIdentity={identity}
      enabled={cta}
      static={isStatic}
      fullWidth={fullWidth}
    >
      <NativeAction
        {...props}
        key="control"
        ref={nativeRef}
        className={classes}
        onActivate={() => {
          if (sound) playGameInteractionSound(sound);
        }}
        data-game-ui-size={size}
        data-game-ui-paint=""
        data-game-ui-cta={cta ? 'true' : undefined}
        data-game-ui-meaning={variant === 'danger' || variant === 'success' ? 'true' : undefined}
        data-game-ui-danger={variant === 'danger' ? 'true' : undefined}
        style={{ ...controlHue(hue ?? (variant === 'success' ? 'leaf' : 'sky')), ...style }}
      >
        {!cta && !delegated ? <DropletSurface static={isStatic} /> : null}
        {children}
        {props['aria-pressed'] !== undefined ? <SelectionMark /> : null}
      </NativeAction>
    </LiquidPressSurface>
  );
});
