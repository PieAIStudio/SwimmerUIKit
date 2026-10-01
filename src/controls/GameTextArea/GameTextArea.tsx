import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';

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
        aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
      />
    );
  },
);
