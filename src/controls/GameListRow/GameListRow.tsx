import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type GameUiHue } from '../../tokens/hue';

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
  hue?: GameUiHue;
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
  hue,
  ...props
}: GameListRowProps): ReactNode {
  const selection = useRef<HTMLButtonElement>(null);
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
      data-game-ui-disabled={disabled || undefined}
      data-game-ui-paint=""
      style={{ ...controlHue(hue), ...props.style }}
    >
      <DropletSurface static={!onSelect} pressTarget={selection} />
      {onSelect ? (
        <button
          type="button"
          className="game-ui-list-row-main"
          ref={selection}
          onClick={onSelect}
          disabled={disabled}
          aria-label={selectLabel}
          aria-current={current ? 'true' : undefined}
          aria-pressed={selected}
        >
          {content}
          <SelectionMark />
        </button>
      ) : (
        <div className="game-ui-list-row-main" aria-current={current ? 'true' : undefined}>
          {content}
          <SelectionMark />
        </div>
      )}
      {actions ? <div className="game-ui-list-row-actions">{actions}</div> : null}
    </div>
  );
}
