import type { HTMLAttributes, ReactNode } from 'react';

export interface GameListRowProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'onSelect' | 'children'
> {
  title: string;
  description?: ReactNode;
  thumbnail?: ReactNode;
  current?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  /** Optional name for the row's selection control, independent of its actions. */
  selectLabel?: string;
  actions?: ReactNode;
}

/** A quiet list surface, with sibling controls rather than buttons inside a button. */
export function GameListRow({
  title,
  description,
  thumbnail,
  current = false,
  selected,
  disabled = false,
  onSelect,
  selectLabel,
  actions,
  className,
  ...props
}: GameListRowProps): ReactNode {
  const content = (
    <>
      {thumbnail ? <span className="game-ui-list-row-thumbnail">{thumbnail}</span> : null}
      <span className="game-ui-list-row-copy">
        <span className="game-ui-list-row-title">{title}</span>
        {description ? <span className="game-ui-list-row-description">{description}</span> : null}
      </span>
      {current ? <span className="game-ui-list-row-current" aria-hidden="true" /> : null}
    </>
  );
  return (
    <div
      {...props}
      className={['game-ui-list-row', className].filter(Boolean).join(' ')}
      data-selected={selected || undefined}
    >
      {onSelect ? (
        <button
          type="button"
          className="game-ui-list-row-main"
          onClick={onSelect}
          disabled={disabled}
          aria-label={selectLabel}
          aria-current={current ? 'true' : undefined}
          aria-pressed={selected}
        >
          {content}
        </button>
      ) : (
        <div className="game-ui-list-row-main" aria-current={current ? 'true' : undefined}>
          {content}
        </div>
      )}
      {actions ? <div className="game-ui-list-row-actions">{actions}</div> : null}
    </div>
  );
}
