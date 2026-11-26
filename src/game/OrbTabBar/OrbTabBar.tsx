import { useId, type KeyboardEvent, type ReactNode } from 'react';
import { V12LiquidBody } from '../v12LiquidBody';
import { type V12Theme } from '../../tokens/v12Theme';

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
  const enabled = tabs
    .map((tab, index) => (tab.disabled ? -1 : index))
    .filter((index) => index >= 0);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect || !enabled.length) return;
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const current = buttons.findIndex((button) => button === document.activeElement);
    const currentPosition = Math.max(enabled.indexOf(current), 0);
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const nextPosition =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : event.key === 'ArrowLeft'
            ? (currentPosition + enabled.length - 1) % enabled.length
            : (currentPosition + 1) % enabled.length;
    const nextIndex = enabled[nextPosition];
    const nextTab = nextIndex === undefined ? undefined : tabs[nextIndex];
    if (nextIndex === undefined || !nextTab) return;
    event.preventDefault();
    onSelect(nextTab.id);
    buttons[nextIndex]?.focus();
  };

  const renderTab = (tab: OrbTab) => (
    <button
      key={tab.id}
      aria-selected={tab.id === activeId}
      aria-current={tab.id === activeId ? 'page' : undefined}
      className="game-ui-v12-orb-tab-bar__tab"
      disabled={tab.disabled}
      id={baseId + '-' + tab.id}
      onClick={() => onSelect?.(tab.id)}
      role="tab"
      tabIndex={tab.id === activeId ? 0 : -1}
      type="button"
    >
      <span className="game-ui-v12-orb-tab-bar__icon" aria-hidden="true">
        {tab.icon}
      </span>
      <span className="game-ui-v12-orb-tab-bar__label">{tab.label}</span>
    </button>
  );
  return (
    <nav
      aria-label={label}
      className={['game-ui-v12-orb-tab-bar', className].filter(Boolean).join(' ')}
      data-orb-speed={orbSpeed}
      data-v12-theme={theme}
    >
      <div className="game-ui-v12-orb-tab-bar__bar">
        <div className="game-ui-v12-orb-tab-bar__tablist" role="tablist" onKeyDown={onKeyDown}>
          {renderTab(tabs[0])}
          {renderTab(tabs[1])}
          {renderTab(tabs[2])}
          {renderTab(tabs[3])}
        </div>
        <button
          aria-label={orbLabel}
          className="game-ui-v12-orb-tab-bar__orb"
          onClick={onOrbClick}
          type="button"
        >
          <V12LiquidBody size={68}>{orb}</V12LiquidBody>
        </button>
      </div>
    </nav>
  );
}
