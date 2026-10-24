import type { InputHTMLAttributes, ReactNode } from 'react';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type UiHue } from '../../tokens/hue';

export interface CheckboxProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'disabled' | 'name' | 'onChange' | 'required' | 'value'
> {
  label: string;
  className?: string;
  hue?: UiHue;
}
export function Checkbox({ className, label, hue, ...props }: CheckboxProps): ReactNode {
  return (
    <label
      className={['game-ui-checkbox', className].filter(Boolean).join(' ')}
      data-game-ui-paint=""
      style={controlHue(hue)}
    >
      <DropletSurface />
      <input className="game-ui-checkbox-input" type="checkbox" {...props} />
      <SelectionMark />
      <span className="game-ui-checkbox-label">{label}</span>
    </label>
  );
}
