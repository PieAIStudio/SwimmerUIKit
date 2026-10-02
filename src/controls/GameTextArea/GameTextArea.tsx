import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { controlHue, type GameUiHue } from '../../tokens/hue';

export interface GameTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hue?: GameUiHue;
  invalid?: boolean;
}

export const GameTextArea = forwardRef<HTMLTextAreaElement, GameTextAreaProps>(
  function GameTextArea({ className, invalid, hue, rows = 3, ...props }, ref): ReactNode {
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
  },
);
