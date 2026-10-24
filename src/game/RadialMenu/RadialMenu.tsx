import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { type CSSProperties, type ReactNode } from 'react';

export interface RadialMenuItem {
  id: string;
  label: string;
}

export interface RadialMenuProps {
  items: readonly RadialMenuItem[];
  label: string;
  onSelect?: (id: string) => void;
}

// A plain focusable button group arranged in a circle (clock positions via
// rotate/translate/counter-rotate). role="group" rather than the ARIA menu
// pattern: we don't implement roving tabindex, arrow-key traversal, or
// Escape-to-close, so claiming role="menu" would promise keyboard behavior
// that isn't there.
export function RadialMenu({ items, label, onSelect }: RadialMenuProps): ReactNode {
  return (
    <div
      aria-label={label}
      className="game-ui-radial-menu"
      role="group"
      style={{ '--radial-count': items.length } as CSSProperties}
    >
      {items.map((item, index) => (
        <button
          className="game-ui-radial-item"
          key={item.id}
          onClick={onSelect ? () => onSelect(item.id) : undefined}
          style={{ '--radial-index': index } as CSSProperties}
          type="button"
          data-game-ui-paint=""
        >
          <DropletSurface />
          {item.label}
        </button>
      ))}
    </div>
  );
}
