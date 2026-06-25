import type { ReactNode } from 'react';

export interface GameHudActionsProps {
  children: ReactNode;
  className?: string;
  label: string;
}

export function GameHudActions({ children, className, label }: GameHudActionsProps): ReactNode {
  const classes = ['game-ui-hud-actions', className].filter(Boolean).join(' ');
  return (
    <nav aria-label={label} className={classes} data-safe-area="hud-actions">
      {children}
    </nav>
  );
}
