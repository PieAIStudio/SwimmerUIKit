import { type InputHTMLAttributes, type ReactNode } from 'react';

export interface GameCheckboxProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'disabled' | 'name' | 'onChange' | 'required' | 'value'
> {
  label: string;
  className?: string;
}

export function GameCheckbox({ className, label, ...props }: GameCheckboxProps): ReactNode {
  const classes = ['game-ui-checkbox', className].filter(Boolean).join(' ');
  return (
    <label className={classes}>
      <input className="game-ui-checkbox-input" type="checkbox" {...props} />
      <span aria-hidden="true" className="game-ui-checkbox-box" />
      <span className="game-ui-checkbox-label">{label}</span>
    </label>
  );
}
