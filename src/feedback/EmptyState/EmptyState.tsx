import type { ReactNode } from 'react';

import { Icon } from '../../icons/Icon/Icon';

import type { IconName } from '../../icons/registry';

export interface EmptyStateProps {
  /** Optional flat icon shown above the title. */
  icon?: IconName;
  title: string;
  description?: string;
  /** Optional call-to-action node (e.g. a Button). */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
}: EmptyStateProps): ReactNode {
  const classes = ['game-ui-empty-state', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {icon ? <Icon icon={icon} size="lg" /> : null}
      <strong className="game-ui-empty-state-title">{title}</strong>
      {description ? <p className="game-ui-empty-state-body">{description}</p> : null}
      {action ? <div className="game-ui-empty-state-action">{action}</div> : null}
    </div>
  );
}
