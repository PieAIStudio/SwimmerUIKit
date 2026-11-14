import type { ReactNode } from 'react';

export interface ChipNavItem {
  id: string;
  label: string;
  /** In-page anchor or route. The link keeps normal browser behaviour. */
  href: string;
  count?: number;
}

export interface ChipNavProps {
  items: readonly ChipNavItem[];
  /** The chip for the section in view, if the host tracks it. */
  activeId?: string;
  label: string;
  className?: string;
}

/** One row of anchor chips with optional counts; scrolls sideways when it runs out of room. */
export function ChipNav({ activeId, className, items, label }: ChipNavProps): ReactNode {
  return (
    <nav
      className={className ? `game-ui-chip-nav ${className}` : 'game-ui-chip-nav'}
      aria-label={label}
    >
      {items.map((item) => (
        <a
          key={item.id}
          className="game-ui-chip-nav-item"
          href={item.href}
          aria-current={item.id === activeId ? 'location' : undefined}
        >
          <span>{item.label}</span>
          {item.count === undefined ? null : (
            <span className="game-ui-chip-nav-count">{item.count}</span>
          )}
        </a>
      ))}
    </nav>
  );
}
