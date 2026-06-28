import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

import { GameButton } from './GameButton';

export interface GamePanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: 'default' | 'strong';
}

export function GamePanel({ children, className, title, tone = 'default', ...props }: GamePanelProps): ReactNode {
  const classes = ['game-ui-panel', className].filter(Boolean).join(' ');
  return (
    <section {...props} className={classes} data-panel-tone={tone}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}

export interface GameIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
}

export function GameIconButton({ children, className, label, type = 'button', ...props }: GameIconButtonProps): ReactNode {
  const classes = ['game-ui-icon-button', className].filter(Boolean).join(' ');
  return (
    <button aria-label={label} className={classes} type={type} {...props}>
      {children}
    </button>
  );
}

export interface GameTooltipProps {
  children: ReactNode;
  label: string;
}

export function GameTooltip({ children, label }: GameTooltipProps): ReactNode {
  return (
    <span className="game-ui-tooltip">
      {children}
      <span role="tooltip">{label}</span>
    </span>
  );
}

export interface GameTabItem {
  id: string;
  label: string;
}

export interface GameTabsProps {
  activeId: string;
  onSelect?: (id: string) => void;
  tabs: readonly GameTabItem[];
}

export function GameTabs({ activeId, onSelect, tabs }: GameTabsProps): ReactNode {
  return (
    <div className="game-ui-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          aria-selected={tab.id === activeId}
          className="game-ui-tab"
          key={tab.id}
          onClick={onSelect ? () => onSelect(tab.id) : undefined}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export interface GameSegmentedOption {
  id: string;
  label: string;
}

export interface GameSegmentedControlProps {
  activeId: string;
  label: string;
  onSelect?: (id: string) => void;
  options: readonly GameSegmentedOption[];
}

export function GameSegmentedControl({ activeId, label, onSelect, options }: GameSegmentedControlProps): ReactNode {
  return (
    <div aria-label={label} className="game-ui-segmented" role="group">
      {options.map((option) => (
        <button
          aria-pressed={option.id === activeId}
          className="game-ui-segmented-option"
          key={option.id}
          onClick={onSelect ? () => onSelect(option.id) : undefined}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export interface GameSliderProps extends Pick<InputHTMLAttributes<HTMLInputElement>, 'max' | 'min' | 'value'> {
  label: string;
  onChange?: (value: number) => void;
}

export function GameSlider({ label, max, min, onChange, value }: GameSliderProps): ReactNode {
  return (
    <label className="game-ui-slider">
      <span>{label}</span>
      <input
        aria-label={label}
        max={max}
        min={min}
        onChange={onChange ? (event) => onChange(Number(event.currentTarget.value)) : undefined}
        readOnly={!onChange}
        type="range"
        value={value}
      />
    </label>
  );
}

export interface GameToggleProps extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick'> {
  checked: boolean;
  label: string;
}

export function GameToggle({ checked, disabled, label, onClick }: GameToggleProps): ReactNode {
  return (
    <button aria-checked={checked} className="game-ui-toggle" disabled={disabled} onClick={onClick} role="switch" type="button">
      <span>{label}</span>
      <span aria-hidden="true" className="game-ui-toggle-track" />
    </button>
  );
}

export interface GameRadialMenuItem {
  id: string;
  label: string;
}

export interface GameRadialMenuProps {
  items: readonly GameRadialMenuItem[];
  label: string;
}

export function GameRadialMenu({ items, label }: GameRadialMenuProps): ReactNode {
  return (
    <div aria-label={label} className="game-ui-radial-menu" role="menu">
      {items.map((item) => (
        <button className="game-ui-radial-item" key={item.id} role="menuitem" type="button">
          {item.label}
        </button>
      ))}
    </div>
  );
}

export interface GameToastProps {
  children: ReactNode;
  tone?: 'info' | 'success' | 'danger';
}

export function GameToast({ children, tone = 'info' }: GameToastProps): ReactNode {
  return (
    <div className="game-ui-toast" data-toast-tone={tone} role={tone === 'danger' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export interface GamePromptProps {
  actionLabel?: string;
  children: ReactNode;
  title: string;
}

export function GamePrompt({ actionLabel, children, title }: GamePromptProps): ReactNode {
  return (
    <section aria-label={title} className="game-ui-prompt">
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
      {actionLabel ? <GameButton variant="primary">{actionLabel}</GameButton> : null}
    </section>
  );
}
