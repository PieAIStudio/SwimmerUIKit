import { useId, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { type V12Theme } from '../v12Theme';

export interface OrbTab {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}

export type OrbTabSlots = readonly [OrbTab, OrbTab, OrbTab, OrbTab];

export interface OrbTabBarProps {
  tabs: OrbTabSlots;
  activeId: string;
  orb: ReactNode;
  orbLabel: string;
  label?: string;
  onOrbClick?: () => void;
  onSelect?: (id: string) => void;
  theme?: V12Theme;
  orbSpeed?: number;
  className?: string;
}

type V12Style = CSSProperties & { '--swimmer-v12-orb-duration'?: string };

function animationDuration(speed: number | undefined): string {
  const safeSpeed = Number.isFinite(speed) && (speed ?? 0) > 0 ? (speed as number) : 2.4;
  return Math.round(1200 / Math.min(Math.max(safeSpeed, 0.5), 6)) + 'ms';
}

export function OrbTabBar({
  activeId,
  className,
  label = 'Orb tabs',
  onOrbClick,
  onSelect,
  orb,
  orbLabel,
  orbSpeed = 2.4,
  tabs,
  theme = 'lagoon',
}: OrbTabBarProps): ReactNode {
  const baseId = useId();
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeId),
  );
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    let nextIndex = activeIndex;
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex + tabs.length - 1) % tabs.length;
    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (
      nextIndex === activeIndex ||
      !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
    )
      return;
    event.preventDefault();
    const next = tabs[nextIndex];
    if (next && !next.disabled) onSelect(next.id);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  };
  const style = { '--swimmer-v12-orb-duration': animationDuration(orbSpeed) } as V12Style;

  const renderTab = (tab: OrbTab, index: number) => (
    <button
      key={tab.id}
      aria-current={tab.id === activeId ? 'page' : undefined}
      aria-selected={tab.id === activeId}
      className="game-ui-v12-orb-tab-bar__tab"
      disabled={tab.disabled}
      id={`${baseId}-${tab.id}`}
      onClick={() => onSelect?.(tab.id)}
      role="tab"
      tabIndex={tab.id === activeId ? 0 : -1}
      type="button"
    >
      <span className="game-ui-v12-orb-tab-bar__icon" aria-hidden="true">
        {tab.icon}
      </span>
      <span className="game-ui-v12-orb-tab-bar__label">{tab.label}</span>
      <span className="game-ui-v12-orb-tab-bar__slot" aria-hidden="true">
        {index + 1}
      </span>
    </button>
  );

  return (
    <nav
      aria-label={label}
      className={['game-ui-v12-orb-tab-bar', className].filter(Boolean).join(' ')}
      data-v12-theme={theme}
      style={style}
    >
      <div className="game-ui-v12-orb-tab-bar__bar">
        <div className="game-ui-v12-orb-tab-bar__tablist" role="tablist" onKeyDown={onKeyDown}>
          {renderTab(tabs[0], 0)}
          {renderTab(tabs[1], 1)}
          {renderTab(tabs[2], 2)}
          {renderTab(tabs[3], 3)}
        </div>
        <button
          aria-label={orbLabel}
          className="game-ui-v12-orb-tab-bar__orb"
          onClick={onOrbClick}
          type="button"
        >
          {orb}
        </button>
      </div>
    </nav>
  );
}
