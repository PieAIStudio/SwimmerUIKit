import { type ReactNode } from 'react';

import { GameIcon } from '../../icons/GameIcon/GameIcon';

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
      <GameIcon icon={tone === 'error' ? 'alert' : 'timer'} size="lg" />
      <span>{label}</span>
    </div>
  );
}
