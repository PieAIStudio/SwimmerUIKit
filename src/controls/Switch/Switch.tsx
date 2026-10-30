import type { InputHTMLAttributes, ReactNode } from 'react';

export interface SwitchProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'disabled' | 'name' | 'onChange' | 'required' | 'value'
> {
  label?: string;
  className?: string;
}

/** A compact switch with a real checkbox input beneath the painted track. */
export function Switch({ className, label, ...props }: SwitchProps): ReactNode {
  return (
    <label className={['game-ui-switch', className].filter(Boolean).join(' ')}>
      <input aria-label={label} className="game-ui-switch-input" type="checkbox" {...props} />
      <span aria-hidden="true" className="game-ui-switch-track">
        <span className="game-ui-switch-thumb" />
      </span>
      {label ? <span className="game-ui-switch-label">{label}</span> : null}
    </label>
  );
}
