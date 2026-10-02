import type { CSSProperties, ReactNode } from 'react';
import { type GameMaterialSwatch, type GameMaterialLayout } from './types';

export interface GameMaterialSwatchesProps {
  activeMaterialId?: string | undefined;
  className?: string;
  disabled?: boolean;
  label: string;
  materials: readonly GameMaterialSwatch[];
  onMaterialChange?: ((materialId: string) => void) | undefined;
  variant?: GameMaterialLayout;
  'data-testid'?: string | undefined;
}

export function GameMaterialSwatches({
  activeMaterialId,
  className,
  disabled = false,
  label,
  materials,
  onMaterialChange,
  variant = 'desktop',
  'data-testid': testId,
}: GameMaterialSwatchesProps): ReactNode {
  const classes = ['game-ui-material-swatches', className].filter(Boolean).join(' ');
  return (
    <section
      aria-label={label}
      className={classes}
      data-ui-hook="material-swatches"
      data-variant={variant}
      data-testid={testId}
    >
      <div className="game-ui-material-swatch-grid" role="listbox" aria-label={label}>
        {materials.map((material) => {
          const selected = material.id === activeMaterialId;
          const buttonDisabled = disabled || material.disabled;
          const displayLabel =
            variant === 'small-mobile' ? (material.compactLabel ?? material.label) : material.label;
          const swatchStyle = {
            '--swatch-color': material.color,
            '--swatch-secondary-color': material.secondaryColor ?? material.color,
          } as CSSProperties;
          return (
            <button
              aria-describedby={material.meta ? `${material.id}-material-meta` : undefined}
              aria-label={material.label}
              aria-selected={selected}
              className="game-ui-material-swatch"
              data-material-id={material.id}
              disabled={buttonDisabled}
              key={material.id}
              onClick={
                onMaterialChange && !buttonDisabled
                  ? () => onMaterialChange(material.id)
                  : undefined
              }
              role="option"
              type="button"
            >
              <span
                aria-hidden="true"
                className="game-ui-material-swatch-chip"
                data-swatch-pattern={material.pattern ?? 'solid'}
                style={swatchStyle}
              />
              <span className="game-ui-material-swatch-copy">
                <strong>{displayLabel}</strong>
                {material.meta ? (
                  <small id={`${material.id}-material-meta`}>{material.meta}</small>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
