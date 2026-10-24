import type { HTMLAttributes, ReactNode } from 'react';

export interface HudActionsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: ReactNode;
  className?: string;
  label: string;
}

export function HudActions({ children, className, label, ...props }: HudActionsProps): ReactNode {
  const classes = ['game-ui-hud-actions', className].filter(Boolean).join(' ');
  return (
    <nav aria-label={label} className={classes} data-safe-area="hud-actions" {...props}>
      {children}
    </nav>
  );
}
