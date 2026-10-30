import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Gem } from '../../controls/Gem/Gem';
import { joinClasses } from '../shared/classes';
import type { ToolSidebarMode } from '../toolWorlds';

export interface ToolSidebarItem {
  badge?: ReactNode;
  disabled?: boolean;
  href?: string;
  icon: ReactNode;
  id: string;
  label: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  selected?: boolean;
}

export interface ToolSidebarProps {
  appIcon?: ReactNode;
  appName?: ReactNode;
  className?: string;
  footer?: ReactNode;
  items?: readonly ToolSidebarItem[];
  mode?: ToolSidebarMode;
}

function itemProps(item: ToolSidebarItem) {
  return {
    'aria-current': item.selected ? ('page' as const) : undefined,
    'aria-label': item.label,
    'data-current': item.selected ? 'true' : undefined,
    'data-tool-sidebar-item': item.id,
    disabled: item.disabled,
    title: item.label,
  };
}

function Item({ item }: { item: ToolSidebarItem }): ReactNode {
  const icon = item.selected ? <Gem>{item.icon}</Gem> : item.icon;
  if (item.href) {
    const props: AnchorHTMLAttributes<HTMLAnchorElement> = {
      ...itemProps(item),
      href: item.href,
    };
    return (
      <a {...props} className="game-ui-tool-sidebar-item">
        <span className="game-ui-tool-sidebar-icon">{icon}</span>
        <span className="game-ui-tool-sidebar-label">{item.label}</span>
        {item.badge ? <span className="game-ui-tool-sidebar-badge">{item.badge}</span> : null}
      </a>
    );
  }
  return (
    <button
      {...itemProps(item)}
      className="game-ui-tool-sidebar-item"
      onClick={item.onClick}
      type="button"
    >
      <span className="game-ui-tool-sidebar-icon">{icon}</span>
      <span className="game-ui-tool-sidebar-label">{item.label}</span>
      {item.badge ? <span className="game-ui-tool-sidebar-badge">{item.badge}</span> : null}
    </button>
  );
}

/** Transparent navigation for a Colour Worlds window, with a compact rail mode. */
export function ToolSidebar({
  appIcon,
  appName,
  className,
  footer,
  items = [],
  mode = 'normal',
}: ToolSidebarProps): ReactNode {
  return (
    <div
      className={joinClasses('game-ui-tool-sidebar', className)}
      data-tool-sidebar-mode={mode}
      data-tool-sidebar="true"
    >
      {appName || appIcon ? (
        <div className="game-ui-tool-sidebar-app">
          {appIcon ? <span className="game-ui-tool-sidebar-app-icon">{appIcon}</span> : null}
          {appName ? <span className="game-ui-tool-sidebar-app-name">{appName}</span> : null}
        </div>
      ) : null}
      <nav aria-label="Tool navigation" className="game-ui-tool-sidebar-nav">
        {items.map((item) => (
          <Item item={item} key={item.id} />
        ))}
      </nav>
      {footer ? <div className="game-ui-tool-sidebar-footer">{footer}</div> : null}
    </div>
  );
}
