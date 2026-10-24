import { type HTMLAttributes, type ReactNode } from 'react';

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: 'default' | 'strong';
}

export function Panel({
  children,
  className,
  title,
  tone = 'default',
  ...props
}: PanelProps): ReactNode {
  const classes = ['game-ui-panel', className].filter(Boolean).join(' ');
  return (
    <section {...props} className={classes} data-panel-tone={tone}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}
