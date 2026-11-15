import type { ReactNode } from 'react';

export interface ChipNavItem {
  id: string;
  label: string;
  /** In-page anchor or route. Leave it out when the chips filter in place through `onSelect`. */
  href?: string;
  count?: number;
}

export interface ChipNavProps {
  items: readonly ChipNavItem[];
  /** The chip for the section in view, or the chosen filter. */
  activeId?: string;
  /**
   * Turns the chips into filter buttons: the active chip is pressed and a click reports its id.
   * Without it the chips are plain links.
   */
  onSelect?: (id: string) => void;
  label: string;
  className?: string;
}

/** One row of chips with optional counts; scrolls sideways when it runs out of room. */
export function ChipNav({ activeId, className, items, label, onSelect }: ChipNavProps): ReactNode {
  const count = (item: ChipNavItem) =>
    item.count === undefined ? null : <span className="game-ui-chip-nav-count">{item.count}</span>;
  if (onSelect) {
    return (
      <div
        role="group"
        className={className ? `game-ui-chip-nav ${className}` : 'game-ui-chip-nav'}
        aria-label={label}
      >
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className="game-ui-chip-nav-item"
            aria-pressed={item.id === activeId}
            onClick={() => onSelect(item.id)}
          >
            <span>{item.label}</span>
            {count(item)}
          </button>
        ))}
      </div>
    );
  }
  return (
    <nav
      className={className ? `game-ui-chip-nav ${className}` : 'game-ui-chip-nav'}
      aria-label={label}
    >
      {items.map((item) => (
        <a
          key={item.id}
          className="game-ui-chip-nav-item"
          href={item.href ?? `#${item.id}`}
          aria-current={item.id === activeId ? 'location' : undefined}
        >
          <span>{item.label}</span>
          {count(item)}
        </a>
      ))}
    </nav>
  );
}
