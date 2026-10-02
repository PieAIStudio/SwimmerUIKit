import type { ReactNode } from 'react';
import { controlHue } from '../../tokens/hue';

export interface GameProgressProps {
  value: number;
  max?: number;
  label: string;
  tone?: 'accent' | 'success' | 'danger' | 'warning';
  showValue?: boolean;
  valueLabel?: string;
  className?: string;
}
/** A progressbar reports real progress. It is not a CTA or a liquid effect. */
export function GameProgress({
  value,
  max = 100,
  label,
  tone = 'accent',
  showValue = false,
  valueLabel,
  className,
}: GameProgressProps): ReactNode {
  const safeMax = !Number.isFinite(max) || max <= 0 ? 100 : max;
  const safeValue = Math.max(0, Math.min(safeMax, Number.isFinite(value) ? value : 0));
  const percentage = (safeValue / safeMax) * 100;
  const hasLabel = Boolean(valueLabel);
  return (
    <div
      className={['game-ui-progress', className].filter(Boolean).join(' ')}
      data-progress-tone={tone}
      data-game-ui-paint=""
      style={controlHue(
        tone === 'success' ? 'leaf' : tone === 'warning' ? 'sun' : 'sky',
        tone === 'danger',
      )}
    >
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={hasLabel ? valueLabel : undefined}
        className="game-ui-progress-track"
      >
        <span className="game-ui-progress-flat-fill" style={{ width: `${percentage}%` }} />
      </div>
      {hasLabel || showValue ? (
        <span className="game-ui-progress-value">
          {hasLabel ? valueLabel : `${Math.round(percentage)}%`}
        </span>
      ) : null}
    </div>
  );
}
