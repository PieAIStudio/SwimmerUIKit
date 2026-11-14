import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface AppBarItem {
  id: string;
  label: string;
  /** Primary items stay inline on wide screens; the rest live in the menu. */
  primary?: boolean;
}

export interface AppBarProps {
  /** Short wordmark, e.g. the product name. */
  brand: ReactNode;
  items: readonly AppBarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Accessible name of the page navigation. */
  navLabel: string;
  /** Menu trigger text while no menu item is active. */
  moreLabel: string;
  /** Right-side controls, usually AppBarAction buttons. */
  actions?: ReactNode;
  className?: string;
}

/**
 * One-row application bar: wordmark, page links, one overflow menu and actions.
 * Narrow screens fold every page into the menu, whose trigger names the current page.
 */
export function AppBar({
  actions,
  activeId,
  brand,
  className,
  items,
  moreLabel,
  navLabel,
  onSelect,
}: AppBarProps): ReactNode {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = items.find((item) => item.id === activeId);
  const overflowActive = active !== undefined && !active.primary;
  const menuItems = appBarMenuOrder(items);

  useEffect(() => {
    if (!open) return;
    const current = menuRef.current?.querySelector<HTMLElement>(
      '[aria-checked="true"]:not([hidden])',
    );
    const visible = current && current.offsetParent !== null ? current : null;
    (visible ?? firstVisible(menuRef.current))?.focus();
  }, [open]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    const entries = visibleEntries(menuRef.current);
    if (entries.length === 0) return;
    const index = entries.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (event.key === 'ArrowDown') next = (index + 1) % entries.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + entries.length) % entries.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = entries.length - 1;
    if (next < 0) return;
    event.preventDefault();
    entries[next]?.focus();
  };

  return (
    <header
      className={className ? `game-ui-app-bar ${className}` : 'game-ui-app-bar'}
      data-open={open}
    >
      <span className="game-ui-app-bar-brand">{brand}</span>
      <nav className="game-ui-app-bar-nav" aria-label={navLabel}>
        {items
          .filter((item) => item.primary)
          .map((item) => (
            <button
              type="button"
              key={item.id}
              className="game-ui-app-bar-link"
              aria-current={item.id === activeId ? 'page' : undefined}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        <div className="game-ui-app-bar-menu">
          <button
            ref={triggerRef}
            type="button"
            className="game-ui-app-bar-link game-ui-app-bar-trigger"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            data-overflow-active={overflowActive}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="game-ui-app-bar-trigger-wide">
              {overflowActive ? active.label : moreLabel}
            </span>
            <span className="game-ui-app-bar-trigger-narrow">{active?.label ?? moreLabel}</span>
            <span className="game-ui-app-bar-chevron" aria-hidden="true" />
          </button>
          {open ? (
            <>
              <div
                className="game-ui-app-bar-backdrop"
                aria-hidden="true"
                onClick={() => close(false)}
              />
              <div
                ref={menuRef}
                id={menuId}
                role="menu"
                aria-label={moreLabel}
                className="game-ui-app-bar-list"
                onKeyDown={onMenuKeyDown}
              >
                {menuItems.map((item) => (
                  <button
                    type="button"
                    role="menuitemradio"
                    key={item.id}
                    tabIndex={-1}
                    aria-checked={item.id === activeId}
                    data-primary={item.primary ? 'true' : undefined}
                    className="game-ui-app-bar-entry"
                    onClick={() => {
                      close(true);
                      onSelect(item.id);
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="game-ui-app-bar-check" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </nav>
      {actions ? <div className="game-ui-app-bar-actions">{actions}</div> : null}
    </header>
  );
}

/** Menu order: primary pages first, so a narrow screen keeps the wide screen's order. */
export function appBarMenuOrder(items: readonly AppBarItem[]): AppBarItem[] {
  return [...items.filter((item) => item.primary), ...items.filter((item) => !item.primary)];
}

function visibleEntries(menu: HTMLElement | null): HTMLElement[] {
  if (!menu) return [];
  return [...menu.querySelectorAll<HTMLElement>('[role="menuitemradio"]')].filter(
    (entry) => entry.offsetParent !== null,
  );
}

function firstVisible(menu: HTMLElement | null): HTMLElement | undefined {
  return visibleEntries(menu)[0];
}

export interface AppBarActionProps {
  children: ReactNode;
  /** Accessible name when the visible text is short or an icon. */
  label?: string;
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
  onClick?: () => void;
  className?: string;
}

/** Quiet outlined control for the right side of an AppBar. */
export function AppBarAction({
  children,
  className,
  controls,
  expanded,
  label,
  onClick,
  pressed,
}: AppBarActionProps): ReactNode {
  return (
    <button
      type="button"
      className={className ? `game-ui-app-bar-action ${className}` : 'game-ui-app-bar-action'}
      aria-label={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
