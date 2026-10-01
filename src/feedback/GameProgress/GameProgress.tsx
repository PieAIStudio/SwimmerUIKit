import type { ReactNode } from 'react';

import { LiquidGroup } from '../../liquid/LiquidGroup/LiquidGroup';

import type { LiquidFinish } from '../../liquid/finish';

import type { GameButtonSurface } from '../../controls/GameButton/GameButton';

export interface GameProgressProps {
  /** Defaults to the existing liquid leading edge. Flat adds no SVG filter. */
  surface?: Exclude<GameButtonSurface, 'plaque'>;
  liquidFinish?: LiquidFinish;
  /** Current value, between 0 and `max`. */
  value: number;
  max?: number;
  /** Accessible label for the progress bar. */
  label: string;
  tone?: 'accent' | 'success' | 'danger' | 'warning';
  /** Show the rounded percentage next to the bar. */
  showValue?: boolean;
  /**
   * Text shown next to the bar in place of the percentage, for progress that
   * is more meaningful as a count than a ratio (e.g. "3 / 21").
   */
  valueLabel?: string;
  className?: string;
}

export function GameProgress({
  className,
  label,
  max = 100,
  showValue = false,
  tone = 'accent',
  value,
  valueLabel,
  surface = 'liquid',
  liquidFinish,
}: GameProgressProps): ReactNode {
  const safeMax = !Number.isFinite(max) || max <= 0 ? 100 : max;
  const safeValue = Math.max(0, Math.min(safeMax, Number.isFinite(value) ? value : 0));
  const pct = (safeValue / safeMax) * 100;
  const classes = ['game-ui-progress', className].filter(Boolean).join(' ');
  const hasValueLabel = Boolean(valueLabel);
  const fill = {
    accent: 'var(--game-ui-accent)',
    danger: 'var(--game-ui-danger)',
    success: 'var(--game-ui-success)',
    warning: 'var(--game-ui-warning)',
  }[tone];
  return (
    <div className={classes} data-progress-tone={tone}>
      <div
        aria-label={label}
        aria-valuemax={safeMax}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        aria-valuetext={hasValueLabel ? valueLabel : undefined}
        className="game-ui-progress-track"
        role="progressbar"
      >
        {surface === 'flat' ? (
          <span
            className="game-ui-progress-flat-fill"
            style={{ width: `${pct}%`, background: fill }}
          />
        ) : (
          <LiquidGroup
            {...(liquidFinish === undefined ? {} : { liquidFinish })}
            aria-hidden="true"
            className="game-ui-progress-liquid"
            fill={fill}
            motion="follow"
            shadow="var(--game-ui-shadow-button)"
            style={{ inset: 0, pointerEvents: 'none', position: 'absolute' }}
          >
            <LiquidGroup.Item
              aria-hidden="true"
              className="game-ui-progress-fill"
              style={{
                borderRadius: 'var(--game-ui-radius-control)',
                height: '100%',
                left: 0,
                position: 'absolute',
                top: 0,
                width: `${pct}%`,
              }}
            >
              {null}
            </LiquidGroup.Item>
          </LiquidGroup>
        )}
      </div>
      {hasValueLabel ? (
        <span className="game-ui-progress-value">{valueLabel}</span>
      ) : showValue ? (
        <span className="game-ui-progress-value">{Math.round(pct)}%</span>
      ) : null}
    </div>
  );
}
