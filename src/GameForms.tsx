import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

/**
 * Clay form primitives. These are intentionally thin wrappers over the native
 * <input>/<textarea>/checkbox so they stay fully accessible and uncontrolled-
 * or controlled-friendly; the clay look lives entirely in CSS. Text fields use
 * forwardRef so hosts can focus them (e.g. refocus a chat composer after send).
 */

export interface GameInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Paints the field in the danger tone for invalid values. */
  invalid?: boolean;
}

export const GameInput = forwardRef<HTMLInputElement, GameInputProps>(function GameInput(
  { className, invalid, type = 'text', ...props },
  ref,
): ReactNode {
  const classes = ['game-ui-input', className].filter(Boolean).join(' ');
  return (
    <input
      className={classes}
      data-invalid={invalid ? 'true' : undefined}
      ref={ref}
      type={type}
      {...props}
    />
  );
});

export interface GameTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const GameTextArea = forwardRef<HTMLTextAreaElement, GameTextAreaProps>(
  function GameTextArea({ className, invalid, rows = 3, ...props }, ref): ReactNode {
    const classes = ['game-ui-input', 'game-ui-textarea', className].filter(Boolean).join(' ');
    return (
      <textarea
        className={classes}
        data-invalid={invalid ? 'true' : undefined}
        ref={ref}
        rows={rows}
        {...props}
      />
    );
  },
);

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
