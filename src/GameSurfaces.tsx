import {
  cloneElement,
  isValidElement,
  useId,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

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
  /** A single focusable trigger element (e.g. GameIconButton). */
  children: ReactNode;
  label: string;
}

export function GameTooltip({ children, label }: GameTooltipProps): ReactNode {
  const tooltipId = useId();
  // Only a single real element can receive aria-describedby; anything else
  // (text, fragments, arrays) renders unchanged rather than throwing.
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], tooltipId].filter(Boolean).join(' '),
      })
    : children;
  return (
    <span className="game-ui-tooltip">
      {trigger}
      <span id={tooltipId} role="tooltip">{label}</span>
    </span>
  );
}

export interface GameTabItem {
  id: string;
  label: string;
  /** id of the tabpanel this tab controls; wires aria-controls when set. */
  panelId?: string;
}

export interface GameTabsProps {
  activeId: string;
  /**
   * Base id for this tabs instance (defaults to a generated one). Each tab
   * button's DOM id is `${id}-${tab.id}` — pass an explicit id so your own
   * `role="tabpanel"` elements can reference it via aria-labelledby (and set
   * GameTabItem.panelId so the tab points back via aria-controls).
   */
  id?: string;
  onSelect?: (id: string) => void;
  tabs: readonly GameTabItem[];
}

export function GameTabs({ activeId, id, onSelect, tabs }: GameTabsProps): ReactNode {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  // Roving tabindex per the ARIA tabs pattern: the active tab is the only
  // tab stop; arrow keys move selection and focus.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect || tabs.length === 0) return;
    const currentIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeId));
    let nextIndex: number;
    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const next = tabs[nextIndex];
    if (!next) return;
    if (next.id !== activeId) onSelect(next.id);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[nextIndex]?.focus();
  };

  return (
    <div className="game-ui-tabs" onKeyDown={handleKeyDown} role="tablist">
      {tabs.map((tab) => (
        <button
          aria-controls={tab.panelId}
          aria-selected={tab.id === activeId}
          className="game-ui-tab"
          id={`${baseId}-${tab.id}`}
          key={tab.id}
          onClick={onSelect ? () => onSelect(tab.id) : undefined}
          role="tab"
          tabIndex={tab.id === activeId ? 0 : -1}
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
  onSelect?: (id: string) => void;
}

// A plain focusable button group arranged in a circle (clock positions via
// rotate/translate/counter-rotate). role="group" rather than the ARIA menu
// pattern: we don't implement roving tabindex, arrow-key traversal, or
// Escape-to-close, so claiming role="menu" would promise keyboard behavior
// that isn't there.
export function GameRadialMenu({ items, label, onSelect }: GameRadialMenuProps): ReactNode {
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
        >
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
