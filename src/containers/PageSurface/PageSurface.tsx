import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { joinClasses } from '../shared/classes';

export type PageSurfaceLayout = 'default' | 'centered' | 'split';

export interface PageSurfaceProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /** Optional secondary column, such as review categories or settings context. */
  aside?: ReactNode;
  children: ReactNode;
  /** Supporting copy below the page title. */
  description?: ReactNode;
  /** Small context label above the page title. */
  eyebrow?: ReactNode;
  /** Actions or host-owned controls beside the title. */
  header?: ReactNode;
  /** Actions that belong to the page's primary next step. */
  primaryAction?: ReactNode;
  /** Bottom action/status slot. */
  footer?: ReactNode;
  className?: string;
  layout?: PageSurfaceLayout;
  /** Visible and accessible page heading. */
  title: string;
}

/**
 * A data-free page frame for tool surfaces.
 *
 * It owns the title hierarchy and predictable slots; the host owns routing,
 * copy, data, loading state and business actions.
 */
export function PageSurface({
  aside,
  children,
  className,
  description,
  eyebrow,
  footer,
  header,
  layout = 'default',
  primaryAction,
  title,
  ...props
}: PageSurfaceProps): ReactNode {
  const titleId = `game-ui-page-surface-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const classes = joinClasses('game-ui-page-surface', className);

  return (
    <section {...props} aria-labelledby={titleId} className={classes} data-layout={layout}>
      <header className="game-ui-page-surface-header">
        <div className="game-ui-page-surface-heading">
          {eyebrow ? <span className="game-ui-page-surface-eyebrow">{eyebrow}</span> : null}
          <h1 id={titleId}>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {header ? <div className="game-ui-page-surface-header-slot">{header}</div> : null}
        {primaryAction ? <div className="game-ui-page-surface-primary">{primaryAction}</div> : null}
      </header>
      <div className="game-ui-page-surface-content">
        {aside ? <aside className="game-ui-page-surface-aside">{aside}</aside> : null}
        <div className="game-ui-page-surface-body">{children}</div>
      </div>
      {footer ? <footer className="game-ui-page-surface-footer">{footer}</footer> : null}
    </section>
  );
}
