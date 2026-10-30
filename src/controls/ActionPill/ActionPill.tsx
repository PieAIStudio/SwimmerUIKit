import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ActionPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/** The shared pink action used by manager-sheet footers in every world. */
export function ActionPill({ children, className, type = 'button', ...props }: ActionPillProps) {
  return (
    <button
      {...props}
      className={['game-ui-action-pill', className].filter(Boolean).join(' ')}
      data-tool-action-pill="true"
      type={type}
    >
      {children}
    </button>
  );
}
