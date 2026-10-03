import type { ReactNode } from 'react';

import { GameIcon } from '../../icons/GameIcon/GameIcon';

import type { GameIconName } from '../../icons/registry';

export interface GameEmptyStateProps {
  /** Optional flat icon shown above the title. */
  icon?: GameIconName;
  title: string;
  description?: string;
  /** Optional call-to-action node (e.g. a GameButton). */
  action?: ReactNode;
  className?: string;
}

export function GameEmptyState({
  action,
  className,
  description,
  icon,
  title,
}: GameEmptyStateProps): ReactNode {
  const classes = ['game-ui-empty-state', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {icon ? <GameIcon icon={icon} size="lg" /> : null}
      <strong className="game-ui-empty-state-title">{title}</strong>
      {description ? <p className="game-ui-empty-state-body">{description}</p> : null}
      {action ? <div className="game-ui-empty-state-action">{action}</div> : null}
    </div>
  );
}
