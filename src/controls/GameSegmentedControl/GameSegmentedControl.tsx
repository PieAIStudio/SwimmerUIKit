import type { ReactNode } from 'react';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type GameUiHue } from '../../tokens/hue';

export interface GameSegmentedOption {
  id: string;
  label: string;
  hue?: GameUiHue;
}
export interface GameSegmentedControlProps {
  activeId: string;
  label: string;
  onSelect?: (id: string) => void;
  options: readonly GameSegmentedOption[];
  disabled?: boolean;
  hue?: GameUiHue;
}
/** Selection belongs to the host. Each segment reserves the same checkmark
 * cell, so changing selection does not resize the row or its native targets. */
export function GameSegmentedControl({
  activeId,
  label,
  onSelect,
  options,
  disabled,
  hue,
}: GameSegmentedControlProps): ReactNode {
  return (
    <div aria-label={label} className="game-ui-segmented" role="group">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="game-ui-segmented-option"
          aria-pressed={option.id === activeId}
          disabled={disabled}
          onClick={onSelect ? () => onSelect(option.id) : undefined}
          data-game-ui-paint=""
          style={controlHue(option.hue ?? hue)}
        >
          <DropletSurface />
          <span>{option.label}</span>
          <SelectionMark />
        </button>
      ))}
    </div>
  );
}
