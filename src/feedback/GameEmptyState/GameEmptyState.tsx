import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../icons/GameAssetIcon/GameAssetIcon';

import type { ClayIconName } from '../../icons/assets';

export interface GameEmptyStateProps {
  /** Optional clay icon shown above the title. */
  icon?: ClayIconName;
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
      {icon ? <GameAssetIcon icon={icon} size="xl" /> : null}
      <strong className="game-ui-empty-state-title">{title}</strong>
      {description ? <p className="game-ui-empty-state-body">{description}</p> : null}
      {action ? <div className="game-ui-empty-state-action">{action}</div> : null}
    </div>
  );
}
