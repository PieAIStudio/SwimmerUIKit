import { type ReactNode } from 'react';

import { Icon } from '../../icons/Icon/Icon';

export interface LoadingStateProps {
  label: string;
  tone?: 'loading' | 'error';
}

export function LoadingState({ label, tone = 'loading' }: LoadingStateProps): ReactNode {
  return (
    <div
      className="game-ui-loading-state"
      data-loading-tone={tone}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon icon={tone === 'error' ? 'alert' : 'timer'} size="lg" />
      <span>{label}</span>
    </div>
  );
}
