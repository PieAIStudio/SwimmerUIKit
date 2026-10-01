import { type ReactNode } from 'react';

export interface GameFieldProps {
  /** The input/textarea this field labels. Rendered inside the <label>. */
  children: ReactNode;
  label: string;
  /** Helper text shown under the field when there is no error. */
  hint?: string;
  /** Error text; when set, the field switches to the danger tone and announces. */
  error?: string;
  required?: boolean;
  className?: string;
}

export function GameField({
  children,
  className,
  error,
  hint,
  label,
  required,
}: GameFieldProps): ReactNode {
  const classes = ['game-ui-field', className].filter(Boolean).join(' ');
  return (
    <label className={classes} data-invalid={error ? 'true' : undefined}>
      <span className="game-ui-field-label">
        {label}
        {required ? (
          <span aria-hidden="true" className="game-ui-field-required">
            {' '}
            *
          </span>
        ) : null}
      </span>
      {children}
      {hint && !error ? <span className="game-ui-field-hint">{hint}</span> : null}
      {error ? (
        <span className="game-ui-field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
