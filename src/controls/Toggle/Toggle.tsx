import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type UiHue } from '../../tokens/hue';

export interface ToggleProps extends Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'onClick'
> {
  checked: boolean;
  label: string;
  hue?: UiHue;
}
export function Toggle({ checked, disabled, label, onClick, hue }: ToggleProps): ReactNode {
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
