import type { ChangeEvent, ReactNode } from 'react';

import { GameField } from '../../../controls/GameField/GameField';
import {
  type GameBrushControlLabels,
  type GameBrushControlState,
  type GameTerrainBuildVariant,
} from '../model';

export interface GameBrushControlsProps {
  className?: string;
  labels?: GameBrushControlLabels;
  onRadiusChange?: ((radius: number) => void) | undefined;
  onStrengthChange?: ((strength: number) => void) | undefined;
  state: GameBrushControlState;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

function normalizeNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function GameBrushControls({
  className,
  labels = {},
  onRadiusChange,
  onStrengthChange,
  state,
  variant = 'desktop',
  'data-testid': testId,
}: GameBrushControlsProps): ReactNode {
  const classes = ['game-ui-brush-controls', className].filter(Boolean).join(' ');
  const minRadius = state.minRadius ?? 1;
  const maxRadius = state.maxRadius ?? 8;
  const radiusStep = state.radiusStep ?? 0.25;
  const minStrength = state.minStrength ?? 0;
  const maxStrength = state.maxStrength ?? 1;
  const strengthStep = state.strengthStep ?? 0.05;
  const radius = normalizeNumber(state.radius, minRadius, maxRadius);
  const strength = normalizeNumber(state.strength, minStrength, maxStrength);
  const disabled = Boolean(state.disabled);

  const handleRadiusChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onRadiusChange?.(normalizeNumber(Number(event.currentTarget.value), minRadius, maxRadius));
  };
  const handleStrengthChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onStrengthChange?.(
      normalizeNumber(Number(event.currentTarget.value), minStrength, maxStrength),
    );
  };

  return (
    <section
      className={classes}
      data-ui-hook="brush-controls"
      data-variant={variant}
      data-testid={testId}
    >
      <GameField
        {...(labels.radiusHint ? { hint: labels.radiusHint } : {})}
        label={labels.radius ?? 'Brush radius'}
      >
        <div className="game-ui-brush-control-row" data-control="radius">
          <input
            aria-label={labels.radius ?? 'Brush radius'}
            className="game-ui-brush-range"
            disabled={disabled}
            max={maxRadius}
            min={minRadius}
            onChange={onRadiusChange ? handleRadiusChange : undefined}
            readOnly={!onRadiusChange}
            step={radiusStep}
            type="range"
            value={radius}
          />
          <input
            aria-label={`${labels.radius ?? 'Brush radius'} value`}
            className="game-ui-brush-number"
            disabled={disabled}
            max={maxRadius}
            min={minRadius}
            onChange={onRadiusChange ? handleRadiusChange : undefined}
            readOnly={!onRadiusChange}
            step={radiusStep}
            type="number"
            value={radius}
          />
        </div>
      </GameField>
      <GameField
        {...(labels.strengthHint ? { hint: labels.strengthHint } : {})}
        label={labels.strength ?? 'Brush strength'}
      >
        <div className="game-ui-brush-control-row" data-control="strength">
          <input
            aria-label={labels.strength ?? 'Brush strength'}
            className="game-ui-brush-range"
            disabled={disabled}
            max={maxStrength}
            min={minStrength}
            onChange={onStrengthChange ? handleStrengthChange : undefined}
            readOnly={!onStrengthChange}
            step={strengthStep}
            type="range"
            value={strength}
          />
          <input
            aria-label={`${labels.strength ?? 'Brush strength'} value`}
            className="game-ui-brush-number"
            disabled={disabled}
            max={maxStrength}
            min={minStrength}
            onChange={onStrengthChange ? handleStrengthChange : undefined}
            readOnly={!onStrengthChange}
            step={strengthStep}
            type="number"
            value={strength}
          />
        </div>
      </GameField>
    </section>
  );
}
