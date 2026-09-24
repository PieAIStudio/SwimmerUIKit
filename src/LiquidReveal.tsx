import { useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { liquidRevealShape } from './liquidRevealGeometry';
import { useLiquidRevealAmbient } from './useLiquidRevealAmbient';
import { LiquidGooeyFilter } from './liquidGooeyFilter';
import { useLiquidRevealEntrance } from './useLiquidRevealEntrance';
import { getLiquidGooeyBudget } from './liquidGooeyBudget';
import { useSystemReducedMotion } from './reducedMotion';

export interface LiquidRevealProps {
  children: ReactNode;
  /** Real launcher geometry. Omit for a static inline resource surface. */
  source?: RefObject<HTMLElement | null>;
  /** A new explicitly requested presentation, never a token/stream revision. */
  revealKey?: string;
  variant?: 'content' | 'input';
  /** Same liquid colour through the whole face. Dark retains the earlier style. */
  surface?: 'material' | 'dark';
  reducedMotion?: boolean;
  /** Optional slow perimeter flow. Caller must offer a persistent pause control. */
  idleMotion?: 'still' | 'breathe';
  className?: string;
}

/** One finite material gesture, not a window, microphone, state machine or
 * another orb. The real HTML stays still and usable while the perimeter draws.
 * Uses the SAME opaque fill, goo/gloss and budget as LiquidPresence. */
export function LiquidReveal({
  children,
  source,
  revealKey = 'initial',
  variant = 'content',
  surface = 'dark',
  reducedMotion,
  idleMotion = 'still',
  className = '',
}: LiquidRevealProps) {
  const systemReduced = useSystemReducedMotion();
  const reduced = systemReduced || reducedMotion === true;
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const id = `liquid-reveal-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth,
        height = element.clientHeight;
      setSize((old) => (old.width === width && old.height === height ? old : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLiquidRevealEntrance(
    root,
    source,
    revealKey,
    size.width,
    size.height,
    reduced,
    surface === 'material',
    variant === 'input',
  );

  const w = Math.max(44, size.width),
    h = Math.max(44, size.height);
  const phase = useLiquidRevealAmbient(
    root,
    !reduced && idleMotion === 'breathe',
    size.width,
    size.height,
    variant === 'input',
  );
  const shape = liquidRevealShape(w, h, variant === 'input', phase.current);
  const filterOK = (w + 24) * (h + 24) <= getLiquidGooeyBudget().maxFilterArea;
  return (
    <div
      ref={root}
      className={`game-ui-liquid-reveal ${className}`}
      data-reveal-variant={variant}
      data-reveal-surface={surface}
      data-reveal-filter={filterOK ? 'volume' : 'flat'}
    >
      <div className="game-ui-liquid-reveal-content">{children}</div>
      {size.width > 0 && (
        <svg
          className="game-ui-liquid-reveal-ink"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--liquid-presence-from, var(--game-ui-secondary))" />
              <stop offset="1" stopColor="var(--liquid-presence-to, var(--game-ui-secondary))" />
            </linearGradient>
            <filter
              id={`${id}-finish`}
              x="-12"
              y="-12"
              width={w + 24}
              height={h + 24}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <LiquidGooeyFilter
                blur={1.2}
                contrast={18}
                gloss={3.5}
                shadows={[]}
                stroke={null}
                waviness={0}
              />
            </filter>
          </defs>
          {surface === 'material' && (
            <path data-reveal-body="" d={shape.outline} fill={`url(#${id}-fill)`} />
          )}
          <g data-reveal-material="" filter={filterOK ? `url(#${id}-finish)` : undefined}>
            <path
              data-reveal-ribbon=""
              d={shape.ribbon}
              fillRule="evenodd"
              fill={`url(#${id}-fill)`}
            />
            <path
              data-reveal-outline=""
              d={shape.outline}
              pathLength="1"
              fill="none"
              stroke={`url(#${id}-fill)`}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      )}
    </div>
  );
}
