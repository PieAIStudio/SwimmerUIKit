import { useId, type ReactNode } from 'react';

export interface DialogProps {
  children: ReactNode;
  className?: string;
  title: string;
}

export function Dialog({ children, className, title }: DialogProps): ReactNode {
  const titleId = useId();
  const classes = ['game-ui-dialog', className].filter(Boolean).join(' ');
  return (
    <section aria-labelledby={titleId} aria-modal="true" className={classes} role="dialog">
      <h2 id={titleId}>{title}</h2>
      <div className="game-ui-dialog-body">{children}</div>
    </section>
  );
}
