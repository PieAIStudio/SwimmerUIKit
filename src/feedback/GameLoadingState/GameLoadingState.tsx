import { type ReactNode } from 'react';

import { getClayIconPath } from '../../icons/assets';

export interface GameLoadingStateProps {
  label: string;
  tone?: 'loading' | 'error';
}

export function GameLoadingState({ label, tone = 'loading' }: GameLoadingStateProps): ReactNode {
  return (
    <div
      className="game-ui-loading-state"
      data-loading-tone={tone}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <img alt="" src={tone === 'error' ? getClayIconPath('alert') : getClayIconPath('timer')} />
      <span>{label}</span>
    </div>
  );
}
