import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { useId, useState, type ReactNode } from 'react';
import { GameIcon } from '../../icons/GameIcon/GameIcon';

export interface GameLanguageMenuProps {
  className?: string;
  /** Optional override for the trigger label. Defaults to the selected option's label. */
  currentLabel?: string;
  label: string;
  options: readonly { id: string; label: string; meta: string }[];
  /** Controlled selected option id. Omit to let the component own selection. */
  value?: string;
  /** Initial selection when uncontrolled. Defaults to the first option. */
  defaultValue?: string;
  /** Fires with the chosen option id whenever the user picks a language. */
  onSelect?: (id: string) => void;
}

export function GameLanguageMenu({
  className,
  currentLabel,
  label,
  options,
  value,
  defaultValue,
  onSelect,
}: GameLanguageMenuProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.id ?? '');
  const menuId = useId();
  const classes = ['game-ui-language-menu', className].filter(Boolean).join(' ');

  const selectedId = value ?? internalValue;
  const selectedOption = options.find((option) => option.id === selectedId);
  const triggerLabel = currentLabel ?? selectedOption?.label ?? options[0]?.label ?? '';

  const handleSelect = (id: string): void => {
    if (value === undefined) setInternalValue(id);
    onSelect?.(id);
    setOpen(false);
  };

  return (
    <div className={classes}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        className="game-ui-language-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
        data-game-ui-paint=""
      >
        <DropletSurface />
        <GameIcon icon="globe" size="sm" />
        <span>{triggerLabel}</span>
      </button>
      {open ? (
        <div aria-label={label} className="game-ui-language-popover" id={menuId} role="menu">
          {options.map((option) => (
            <button
              aria-checked={option.id === selectedId}
              data-selected={option.id === selectedId}
              key={option.id}
              onClick={() => handleSelect(option.id)}
              role="menuitemradio"
              type="button"
              data-game-ui-paint=""
            >
              <DropletSurface />
              <span>
                <strong>{option.label}</strong>
                <small>{option.meta}</small>
              </span>
              <SelectionMark />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
