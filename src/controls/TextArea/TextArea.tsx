import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { controlHue, type UiHue } from '../../tokens/hue';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hue?: UiHue;
  invalid?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, invalid, hue, rows = 3, ...props },
  ref,
): ReactNode {
  const classes = ['game-ui-input', 'game-ui-textarea', className].filter(Boolean).join(' ');
  return (
    <textarea
      className={classes}
      data-invalid={invalid ? 'true' : undefined}
      ref={ref}
      rows={rows}
      {...props}
      style={{ ...controlHue(hue), ...props.style }}
      aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
      data-game-ui-paint=""
    />
  );
});
