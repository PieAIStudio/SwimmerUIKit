import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type GameUiHue } from '../../tokens/hue';

export interface GameToggleProps extends Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'onClick'
> {
  checked: boolean;
  label: string;
  hue?: GameUiHue;
}
export function GameToggle({ checked, disabled, label, onClick, hue }: GameToggleProps): ReactNode {
  return (
    <button
      type="button"
      className="game-ui-toggle"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      data-game-ui-paint=""
      style={controlHue(hue)}
    >
      <DropletSurface />
      <span>{label}</span>
      <SelectionMark />
      <span className="game-ui-toggle-track" aria-hidden="true">
        <span className="game-ui-toggle-thumb" />
      </span>
    </button>
  );
}
