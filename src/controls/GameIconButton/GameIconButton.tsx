import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type GameUiHue } from '../../tokens/hue';

export interface GameIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  hue?: GameUiHue;
}
export const GameIconButton = forwardRef<HTMLButtonElement, GameIconButtonProps>(
  function GameIconButton(
    { children, className, label, hue, type = 'button', style, ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        aria-label={label}
        className={['game-ui-icon-button', className].filter(Boolean).join(' ')}
        type={type}
        data-game-ui-paint=""
        style={{ ...controlHue(hue), ...style }}
      >
        <DropletSurface />
        {children}
        {props['aria-pressed'] !== undefined ? <SelectionMark /> : null}
      </button>
    );
  },
);
