import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { presenceBody } from '../presence/geometry';

export interface V12LiquidBodyProps {
  children?: ReactNode;
  className?: string;
  size?: number;
  phase?: number;
  energy?: number;
  living?: number;
}

type LiquidStyle = CSSProperties & { '--swimmer-v12-liquid-size'?: string };

function useLiquidPhase(speed = 2.4): number {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let frame = 0;
    let previous = 0;
    const reduced = () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const tick = (time: number) => {
      if (previous === 0) previous = time;
      const delta = Math.min(48, time - previous);
      previous = time;
      if (!document.hidden && !reduced()) setPhase((value) => value + (delta / 1000) * speed);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed]);
  return phase;
}

export function V12LiquidBody({
  children,
  className,
  energy = 0.4,
  living = 0.8,
  phase: suppliedPhase,
  size = 64,
}: V12LiquidBodyProps): ReactNode {
  const phase = suppliedPhase ?? useLiquidPhase();
  const gradientId = 'swimmer-v12-liquid-' + useId().replace(/:/g, '');
  const style = { '--swimmer-v12-liquid-size': String(size) + 'px' } as LiquidStyle;
  return (
    <span
      className={['game-ui-v12-liquid-body', className].filter(Boolean).join(' ')}
      style={style}
    >
      <svg aria-hidden="true" className="game-ui-v12-liquid-body__svg" viewBox="0 0 160 160">
        <defs>
          <linearGradient id={gradientId} x1="22%" y1="8%" x2="80%" y2="94%">
            <stop offset="0%" stopColor="var(--swimmer-v12-liquid-from)" />
            <stop offset="58%" stopColor="var(--swimmer-v12-liquid-mid)" />
            <stop offset="100%" stopColor="var(--swimmer-v12-liquid-to)" />
          </linearGradient>
        </defs>
        <ellipse
          className="game-ui-v12-liquid-body__contact"
          cx="80"
          cy="145"
          fill="var(--swimmer-v12-contact-shadow)"
          rx="48"
          ry="7"
        />
        <path
          className="game-ui-v12-liquid-body__path"
          d={presenceBody(phase, energy, 0, 1, living)}
          fill={'url(#' + gradientId + ')'}
        />
      </svg>
      {children}
    </span>
  );
}
