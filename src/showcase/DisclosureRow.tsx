import { useId, type ReactNode } from 'react';

export type DisclosureRowTone = 'neutral' | 'attention' | 'danger';

export interface DisclosureRowProps {
  title: ReactNode;
  /** One short line that says what is happening now. */
  summary?: ReactNode;
  /** Compact facts, usually Badge elements. */
  meta?: ReactNode;
  /** `attention` and `danger` show a lead dot before the title. */
  tone?: DisclosureRowTone;
  /** Marks the one row that leads the list. */
  emphasis?: boolean;
  open: boolean;
  onToggle: () => void;
  id?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Dense list row that opens in place. Title, summary and facts keep fixed columns,
 * and the chevron always has its own right column, at every width.
 */
export function DisclosureRow({
  ariaLabel,
  children,
  className,
  emphasis = false,
  id,
  meta,
  onToggle,
  open,
  summary,
  title,
  tone = 'neutral',
}: DisclosureRowProps): ReactNode {
  const bodyId = useId();
  return (
    <section
      id={id}
      className={className ? `game-ui-disclosure-row ${className}` : 'game-ui-disclosure-row'}
      data-open={open}
      data-tone={tone}
      data-emphasis={emphasis}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="game-ui-disclosure-row-toggle"
        aria-expanded={open}
        aria-controls={open ? bodyId : undefined}
        onClick={onToggle}
      >
        <span className="game-ui-disclosure-row-main">
          <span className="game-ui-disclosure-row-title">
            <span className="game-ui-disclosure-row-dot" aria-hidden="true" />
            <strong>{title}</strong>
          </span>
          {summary ? <span className="game-ui-disclosure-row-summary">{summary}</span> : null}
          {meta ? <span className="game-ui-disclosure-row-meta">{meta}</span> : null}
        </span>
        <span className="game-ui-disclosure-row-chevron" aria-hidden="true" />
      </button>
      {open ? (
        <div className="game-ui-disclosure-row-body" id={bodyId}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
