import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { presenceBody } from '../presence/geometry';

export interface V12LiquidBodyProps {
  children?: ReactNode;
  className?: string;
  size?: number;
  phase?: number;
  phaseOffset?: number;
  speed?: number;
  energy?: number;
  living?: number;
}

type LiquidStyle = CSSProperties & { '--swimmer-v12-liquid-size'?: string };

function useLiquidPhase(speed = 2.0, offset = 0, active = true): number {
  const [phase, setPhase] = useState(offset);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let previous = 0;
    let accumulator = 0;
    const reduced = () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const tick = (time: number) => {
      if (previous === 0) previous = time;
      const delta = Math.min(160, time - previous);
      previous = time;
      accumulator += delta;
      if (accumulator >= 25 && !document.hidden && !reduced()) {
        const step = (accumulator / 1000) * speed;
        accumulator = 0;
        setPhase((value) => value + step);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, speed]);
  return phase;
}

export function V12OrbGlyph({ kind }: { kind: 'plus' | 'close' }): ReactNode {
  const path = kind === 'plus' ? 'M12 5.5v13M5.5 12h13' : 'M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5';
  return (
    <svg
      aria-hidden="true"
      className="game-ui-v12-orb-glyph"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.6}
      viewBox="0 0 24 24"
    >
      <path
        d={path}
        style={{ stroke: 'var(--swimmer-v12-orb-glyph-under)' }}
        transform="translate(0 1.2)"
      />
      <path d={path} style={{ stroke: 'var(--swimmer-v12-orb-ink)' }} />
    </svg>
  );
}

export function V12LiquidBody({
  children,
  className,
  energy = 0,
  living = 1,
  phase: suppliedPhase,
  phaseOffset = 0,
  size,
  speed = 2.0,
}: V12LiquidBodyProps): ReactNode {
  const animatedPhase = useLiquidPhase(speed, phaseOffset, suppliedPhase === undefined);
  const phase = suppliedPhase ?? animatedPhase;
  const uid = useId().replace(/:/g, '');
  const gradientId = 'swimmer-v12-liquid-' + uid;
  const shadowId = 'swimmer-v12-shadow-' + uid;
  const style =
    size === undefined
      ? undefined
      : ({ '--swimmer-v12-liquid-size': String(size) + 'px' } as LiquidStyle);

  return (
    <span
      className={['game-ui-v12-liquid-body', className].filter(Boolean).join(' ')}
      style={style}
    >
      <svg aria-hidden="true" className="game-ui-v12-liquid-body__svg" viewBox="0 0 160 160">
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1="0"
            x2="0"
            y1="16"
            y2="146"
          >
            <stop offset="0" style={{ stopColor: 'var(--swimmer-v12-liquid-top)' }} />
            <stop offset="0.16" style={{ stopColor: 'var(--swimmer-v12-liquid-hi)' }} />
            <stop offset="0.5" style={{ stopColor: 'var(--swimmer-v12-liquid-mid)' }} />
            <stop offset="1" style={{ stopColor: 'var(--swimmer-v12-liquid-bottom)' }} />
          </linearGradient>
          <radialGradient id={shadowId}>
            <stop
              offset="0"
              stopOpacity={0.3}
              style={{ stopColor: 'var(--swimmer-v12-contact-shadow)' }}
            />
            <stop
              offset="1"
              stopOpacity={0}
              style={{ stopColor: 'var(--swimmer-v12-contact-shadow)' }}
            />
          </radialGradient>
        </defs>
        <ellipse
          className="game-ui-v12-liquid-body__contact"
          cx="80"
          cy="150"
          fill={'url(#' + shadowId + ')'}
          rx="56"
          ry="9"
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
