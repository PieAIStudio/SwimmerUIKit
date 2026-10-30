import type { InputHTMLAttributes, ReactNode } from 'react';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type UiHue } from '../../tokens/hue';

export interface CheckboxProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'aria-label'
  | 'checked'
  | 'defaultChecked'
  | 'disabled'
  | 'name'
  | 'onChange'
  | 'required'
  | 'value'
> {
  label: string;
  className?: string;
  hue?: UiHue;
  /** Use the compact square treatment inside Colour Worlds manager sheets. */
  tool?: boolean;
}
export function Checkbox({
  className,
  label,
  hue,
  tool = false,
  ...props
}: CheckboxProps): ReactNode {
  return (
    <label
      className={['game-ui-checkbox', tool && 'game-ui-checkbox--tool', className]
        .filter(Boolean)
        .join(' ')}
      data-game-ui-paint=""
      data-tool-checkbox={tool ? 'true' : undefined}
      style={controlHue(hue)}
    >
      {tool ? null : <DropletSurface />}
      <input className="game-ui-checkbox-input" type="checkbox" {...props} />
      <SelectionMark />
      <span className="game-ui-checkbox-label">{label}</span>
    </label>
  );
}
