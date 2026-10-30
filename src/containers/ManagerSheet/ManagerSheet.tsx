import type { ChangeEvent, ReactNode } from 'react';
import { Checkbox } from '../../controls/Checkbox/Checkbox';
import { ActionPill } from '../../controls/ActionPill/ActionPill';
import { Gem } from '../../controls/Gem/Gem';
import { ToolIcon } from '../../icons/ToolIcon/ToolIcon';
import { joinClasses } from '../shared/classes';

export interface ManagerSheetGroup {
  badge?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  id: string;
  label: ReactNode;
  meta?: ReactNode;
  selected?: boolean;
}

export interface ManagerSheetRow {
  checked?: boolean;
  date?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  id: string;
  meta?: ReactNode;
  name: ReactNode;
  size?: ReactNode;
  tag?: ReactNode;
}

export interface ManagerSheetProps {
  actionLabel: ReactNode;
  className?: string;
  footerNote?: ReactNode;
  groups: readonly ManagerSheetGroup[];
  onAction?: () => void;
  onBack?: () => void;
  onGroupSelect?: (id: string) => void;
  onRowCheck?: (id: string, checked: boolean) => void;
  onSearch?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSort?: () => void;
  rows: readonly ManagerSheetRow[];
  selectedCount?: ReactNode;
  selectedSize?: ReactNode;
  sortLabel?: ReactNode;
  subtitle?: ReactNode;
  theme?: 'light' | 'dark';
  title: ReactNode;
}

/** A long-list manager sheet with a light or dark surface and pink action footer. */
export function ManagerSheet({
  actionLabel,
  className,
  footerNote,
  groups,
  onAction,
  onBack,
  onGroupSelect,
  onRowCheck,
  onSearch,
  onSort,
  rows,
  selectedCount,
  selectedSize,
  sortLabel,
  subtitle,
  theme = 'light',
  title,
}: ManagerSheetProps): ReactNode {
  return (
    <div
      className={joinClasses('game-ui-manager-sheet', className)}
      data-sheet-theme={theme}
      data-tool-sheet="true"
    >
      <header className="game-ui-manager-sheet-bar">
        <button className="game-ui-manager-sheet-back" onClick={onBack} type="button">
          <ToolIcon name="back" />
          <span>{theme === 'dark' ? '返回' : 'Back'}</span>
        </button>
        <h1>{title}</h1>
        <div className="game-ui-manager-sheet-tools">
          <label className="game-ui-manager-sheet-search">
            <ToolIcon name="search" />
            <input aria-label="Search" onChange={onSearch} type="search" />
          </label>
          <button className="game-ui-manager-sheet-sort" onClick={onSort} type="button">
            <span>{theme === 'dark' ? '排序：' : 'Sort by: '}</span>
            <strong>{sortLabel}</strong>
            <ToolIcon name="down" />
          </button>
        </div>
      </header>
      <div className="game-ui-manager-sheet-body">
        <aside className="game-ui-manager-sheet-groups">
          {groups.map((group) => (
            <button
              aria-current={group.selected ? 'page' : undefined}
              className="game-ui-manager-sheet-group"
              data-selected={group.selected ? 'true' : undefined}
              key={group.id}
              onClick={() => onGroupSelect?.(group.id)}
              type="button"
            >
              <Gem size="lg">{group.icon}</Gem>
              <span>
                <strong>{group.label}</strong>
                {group.meta ? <small>{group.meta}</small> : null}
              </span>
              {group.badge !== undefined ? <b>{group.badge}</b> : null}
            </button>
          ))}
        </aside>
        <div className="game-ui-manager-sheet-list">
          {subtitle ? <p className="game-ui-manager-sheet-subtitle">{subtitle}</p> : null}
          {rows.map((row) => (
            <div
              className="game-ui-manager-sheet-row"
              data-selected={row.checked ? 'true' : undefined}
              key={row.id}
            >
              <Checkbox
                aria-label={`Select ${String(row.name)}`}
                checked={row.checked}
                disabled={row.disabled}
                label=""
                onChange={(event) => onRowCheck?.(row.id, event.currentTarget.checked)}
                tool
              />
              <span className="game-ui-manager-sheet-row-icon">{row.icon}</span>
              <span className="game-ui-manager-sheet-row-copy">
                <strong>
                  {row.name}
                  {row.tag ? <em>{row.tag}</em> : null}
                </strong>
                {row.meta ? <small>{row.meta}</small> : null}
              </span>
              {row.date ? <span className="game-ui-manager-sheet-row-date">{row.date}</span> : null}
              {row.size ? <span className="game-ui-manager-sheet-row-size">{row.size}</span> : null}
              <button
                aria-label={`Open ${String(row.name)}`}
                className="game-ui-manager-sheet-row-open"
                type="button"
              >
                <ToolIcon name="chev" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <footer className="game-ui-manager-sheet-footer">
        <span className="game-ui-manager-sheet-footer-note">{footerNote}</span>
        <span className="game-ui-manager-sheet-selection">
          <strong>{selectedCount}</strong>
          <i aria-hidden="true">|</i>
          <span>{selectedSize}</span>
        </span>
        <ActionPill onClick={onAction}>{actionLabel}</ActionPill>
      </footer>
    </div>
  );
}
