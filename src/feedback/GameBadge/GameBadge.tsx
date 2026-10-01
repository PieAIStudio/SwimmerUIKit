import { type ReactNode } from 'react';

export type GameBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'ai';

export interface GameBadgeProps {
  children: ReactNode;
  className?: string;
  tone?: GameBadgeTone;
}

export function GameBadge({ children, className, tone = 'neutral' }: GameBadgeProps): ReactNode {
  const classes = ['game-ui-badge', className].filter(Boolean).join(' ');
  return (
    <span className={classes} data-badge-tone={tone}>
      {children}
    </span>
  );
}
