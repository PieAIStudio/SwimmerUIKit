import type { ReactNode } from 'react';

export interface PageHeaderProps {
  /** Small line above the title that says where the reader is. */
  kicker?: ReactNode;
  title: ReactNode;
  /** One or two sentences under the title. */
  lead?: ReactNode;
  /** Controls that belong to the whole page; they sit beside the title on wide screens. */
  actions?: ReactNode;
  titleId?: string;
  className?: string;
}

/** Page title block with the same kicker, display title and lead as a Kit showcase page. */
export function PageHeader({
  actions,
  className,
  kicker,
  lead,
  title,
  titleId,
}: PageHeaderProps): ReactNode {
  return (
    <header className={className ? `game-ui-page-header ${className}` : 'game-ui-page-header'}>
      <div className="game-ui-page-header-copy">
        {kicker ? <p className="game-ui-page-header-kicker">{kicker}</p> : null}
        <h1 id={titleId}>{title}</h1>
        {lead ? <p className="game-ui-page-header-lead">{lead}</p> : null}
      </div>
      {actions ? <div className="game-ui-page-header-actions">{actions}</div> : null}
    </header>
  );
}
