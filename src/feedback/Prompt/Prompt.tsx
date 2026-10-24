import { type ReactNode } from 'react';

import { Button } from '../../controls/Button/Button';

export interface PromptProps {
  actionLabel?: string;
  children: ReactNode;
  title: string;
}

export function Prompt({ actionLabel, children, title }: PromptProps): ReactNode {
  return (
    <section aria-label={title} className="game-ui-prompt">
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
      {actionLabel ? <Button variant="primary">{actionLabel}</Button> : null}
    </section>
  );
}
