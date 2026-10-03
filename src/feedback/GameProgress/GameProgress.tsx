import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useSystemReducedMotion } from '../../tokens/reducedMotion';
import {
  createDropletGeometry,
  dropletPath,
  dropletSeed,
} from '../../controls/DropletSurface/geometry';
import { attachProgress } from './controller';
import { progressFrontPath } from './geometry';

export interface GameProgressProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  valueLabel?: string;
  className?: string;
}
/** Native progress semantics; only a finite, unfiltered tide meniscus moves. */
export function GameProgress({
  value,
  max = 100,
  label,
  showValue = false,
  valueLabel,
  className,
}: GameProgressProps): ReactNode {
  const safeMax = !Number.isFinite(max) || max <= 0 ? 100 : max;
  const safeValue = Math.max(0, Math.min(safeMax, Number.isFinite(value) ? value : 0));
  const ratio = safeValue / safeMax,
    percentage = ratio * 100;
  const id = `progress-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const reduced = useSystemReducedMotion();
  const svg = useRef<SVGSVGElement>(null);
  const controller = useRef<ReturnType<typeof attachProgress> | null>(null);
  const initialRatio = useRef(ratio).current;
  const valueRef = useRef(ratio);
  valueRef.current = ratio;
  useLayoutEffect(() => {
    if (!svg.current) return;
    const instance = attachProgress(svg.current, dropletSeed(id), valueRef.current, !reduced);
    controller.current = instance;
    return () => {
      instance.dispose();
      controller.current = null;
    };
  }, [id, reduced]);
  useLayoutEffect(() => controller.current?.update(ratio), [ratio, reduced]);
  const outline = dropletPath(createDropletGeometry(100, 10, 5), 1, 0, dropletSeed(id), 4);
  return (
    <div className={['game-ui-progress', className].filter(Boolean).join(' ')}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={valueLabel || undefined}
        className="game-ui-progress-track"
      >
        <svg
          ref={svg}
          viewBox="0 0 108 18"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id={`${id}-clip`}>
              <path data-progress-clip="" d={outline} />
            </clipPath>
            <linearGradient id={`${id}-fill`}>
              <stop offset="0%" style={{ stopColor: 'var(--game-ui-cta-from)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--game-ui-cta-to)' }} />
            </linearGradient>
          </defs>
          <path data-progress-track="" d={outline} />
          <path
            data-progress-front=""
            d={progressFrontPath(100, initialRatio)}
            clipPath={`url(#${id}-clip)`}
            fill={`url(#${id}-fill)`}
          />
        </svg>
      </div>
      {valueLabel || showValue ? (
        <span className="game-ui-progress-value">{valueLabel || `${Math.round(percentage)}%`}</span>
      ) : null}
    </div>
  );
}
