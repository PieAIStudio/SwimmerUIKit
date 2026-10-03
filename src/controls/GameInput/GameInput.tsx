import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { controlHue, type GameUiHue } from '../../tokens/hue';

/**
 * Flat form primitives. These are intentionally thin wrappers over the native
 * <input>/<textarea>/checkbox so they stay fully accessible and uncontrolled-
 * or controlled-friendly; the flat look lives entirely in CSS. Text fields use
 * forwardRef so hosts can focus them (e.g. refocus a chat composer after send).
 */

export interface GameInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hue?: GameUiHue;
  /** Paints the field in the danger tone for invalid values. */
  invalid?: boolean;
}

export const GameInput = forwardRef<HTMLInputElement, GameInputProps>(function GameInput(
  { className, invalid, hue, type = 'text', ...props },
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
      style={{ ...controlHue(hue), ...props.style }}
      aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
      data-game-ui-paint=""
    />
  );
});
