import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { joinClasses } from '../shared/classes';

/* ------------------------------------------------------------------ */
/* GameCollapsiblePanel                                                */
/* ------------------------------------------------------------------ */

export interface GameCollapsiblePanelLabels {
  collapse: string;
  expand: string;
}

const COLLAPSIBLE_DEFAULT_LABELS: GameCollapsiblePanelLabels = {
  collapse: 'Collapse',
  expand: 'Expand',
};

export interface GameCollapsiblePanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  children: ReactNode;
  className?: string;
  /** Controlled open state. Leave undefined for uncontrolled usage. */
  open?: boolean;
  /** Uncontrolled initial state. Defaults to true (expanded). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Extra header actions rendered next to the toggle (e.g. icon buttons). */
  actions?: ReactNode;
  labels?: Partial<GameCollapsiblePanelLabels>;
  title: string;
  tone?: 'default' | 'strong';
}

export function GameCollapsiblePanel({
  actions,
  children,
  className,
  defaultOpen = true,
  labels,
  onOpenChange,
  open,
  title,
  tone = 'default',
  ...props
}: GameCollapsiblePanelProps): ReactNode {
  const regionId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const text = { ...COLLAPSIBLE_DEFAULT_LABELS, ...labels };

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <section
      {...props}
      className={joinClasses('game-ui-collapsible', className)}
      data-open={isOpen}
      data-panel-tone={tone}
    >
      <header className="game-ui-collapsible-header">
        <h3 className="game-ui-collapsible-heading">
          <button
            aria-controls={regionId}
            aria-expanded={isOpen}
            className="game-ui-collapsible-toggle"
            onClick={toggle}
            title={isOpen ? text.collapse : text.expand}
            type="button"
            data-game-ui-paint=""
          >
            <DropletSurface />
            <span aria-hidden="true" className="game-ui-collapsible-chevron" />
            <span className="game-ui-collapsible-title">{title}</span>
          </button>
        </h3>
        {actions ? <span className="game-ui-collapsible-actions">{actions}</span> : null}
      </header>
      <div className="game-ui-collapsible-region" id={regionId}>
        <div className="game-ui-collapsible-clip">
          <div className="game-ui-collapsible-content">{children}</div>
        </div>
      </div>
    </section>
  );
}
