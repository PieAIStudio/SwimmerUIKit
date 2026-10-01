import { type ReactNode } from 'react';

import { GameButton } from '../../controls/GameButton/GameButton';

export interface GamePromptProps {
  actionLabel?: string;
  children: ReactNode;
  title: string;
}

export function GamePrompt({ actionLabel, children, title }: GamePromptProps): ReactNode {
  return (
    <section aria-label={title} className="game-ui-prompt">
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
      {actionLabel ? <GameButton variant="primary">{actionLabel}</GameButton> : null}
    </section>
  );
}
