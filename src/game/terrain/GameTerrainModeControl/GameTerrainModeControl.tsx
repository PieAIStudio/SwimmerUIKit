import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';
import { type GameTerrainBuildModeOption, type GameTerrainBuildVariant } from '../model';
import { TOOL_ICONS } from '../shared';

export interface GameTerrainModeControlProps {
  activeModeId: string;
  className?: string;
  disabled?: boolean;
  label: string;
  modes: readonly GameTerrainBuildModeOption[];
  onModeChange?: ((modeId: string) => void) | undefined;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

function dataVariant(variant: GameTerrainBuildVariant): GameTerrainBuildVariant {
  return variant;
}

export function GameTerrainModeControl({
  activeModeId,
  className,
  disabled = false,
  label,
  modes,
  onModeChange,
  variant = 'desktop',
  'data-testid': testId,
}: GameTerrainModeControlProps): ReactNode {
  const classes = ['game-ui-terrain-mode-control', className].filter(Boolean).join(' ');

  return (
    <section
      aria-label={label}
      className={classes}
      data-ui-hook="terrain-mode-control"
      data-variant={dataVariant(variant)}
      data-testid={testId}
    >
      <span className="game-ui-sr-only">{label}</span>
      <div className="game-ui-terrain-mode-options" role="group">
        {modes.map((mode) => {
          const selected = mode.id === activeModeId;
          const buttonDisabled = disabled || mode.disabled;
          const displayLabel =
            variant === 'small-mobile' ? (mode.compactLabel ?? mode.label) : mode.label;
          return (
            <button
              aria-describedby={mode.meta ? `${mode.id}-mode-meta` : undefined}
              aria-label={mode.ariaLabel ?? mode.label}
              aria-pressed={selected}
              className="game-ui-terrain-mode-option"
              data-mode-id={mode.id}
              data-selected={selected ? 'true' : 'false'}
              disabled={buttonDisabled}
              key={mode.id}
              onClick={onModeChange && !buttonDisabled ? () => onModeChange(mode.id) : undefined}
              type="button"
            >
              <GameAssetIcon
                icon={mode.icon ?? TOOL_ICONS[mode.id] ?? 'portal'}
                size={variant === 'small-mobile' ? 'sm' : 'md'}
                style="line"
              />
              <span>{displayLabel}</span>
              {mode.meta ? <small id={`${mode.id}-mode-meta`}>{mode.meta}</small> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
