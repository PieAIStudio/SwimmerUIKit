import type { InputHTMLAttributes, ReactNode } from 'react';

export interface SwitchProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'disabled' | 'name' | 'onChange' | 'required' | 'value'
> {
  label?: string;
  className?: string;
}

/** A quiet switch backed by a real checkbox input. */
export function Switch(props: SwitchProps): ReactNode {
  return <input type="checkbox" {...props} />;
}
