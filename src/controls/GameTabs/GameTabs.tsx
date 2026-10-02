import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { useId, type KeyboardEvent, type ReactNode } from 'react';
import { controlHue, type GameUiHue } from '../../tokens/hue';

export interface GameTabItem {
  id: string;
  label: string;
  /** id of the tabpanel this tab controls; wires aria-controls when set. */
  panelId?: string;
  hue?: GameUiHue;
}

export interface GameTabsProps {
  hue?: GameUiHue;
  orientation?: 'horizontal' | 'vertical';
  'aria-label'?: string;
  'aria-labelledby'?: string;

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

export function GameTabs({
  activeId,
  id,
  onSelect,
  tabs,
  hue,
  orientation = 'horizontal',
  'aria-label': label,
  'aria-labelledby': labelledBy,
}: GameTabsProps): ReactNode {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  // Roving tabindex per the ARIA tabs pattern: the active tab is the only
  // tab stop; arrow keys move selection and focus.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect || tabs.length === 0) return;
    const currentIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === activeId),
    );
    let nextIndex: number;
    const verticalKeys: Record<string, string> = {
      ArrowUp: 'ArrowLeft',
      ArrowDown: 'ArrowRight',
      ArrowLeft: '',
      ArrowRight: '',
    };
    const key = orientation === 'vertical' ? (verticalKeys[event.key] ?? event.key) : event.key;
    switch (key) {
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
    <div
      className="game-ui-tabs"
      onKeyDown={handleKeyDown}
      role="tablist"
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {tabs.map((tab) => (
        <button
          aria-controls={tab.panelId}
          aria-selected={tab.id === activeId}
          className="game-ui-tab"
          style={controlHue(tab.hue ?? hue)}
          id={`${baseId}-${tab.id}`}
          key={tab.id}
          onClick={onSelect ? () => onSelect(tab.id) : undefined}
          role="tab"
          tabIndex={tab.id === activeId ? 0 : -1}
          type="button"
          data-game-ui-paint=""
        >
          <DropletSurface />
          {tab.label}
          <SelectionMark />
        </button>
      ))}
    </div>
  );
}
