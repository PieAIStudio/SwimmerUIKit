import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type CSSProperties,
} from 'react';
import { clampPresence } from '../geometry';
import { liquidRevealShape } from './geometry';
import { useLiquidRevealAmbient } from './useAmbient';
import { LiquidGooeyFilter } from '../../liquid/filter';
import { useLiquidRevealEntrance } from './useEntrance';
import { getLiquidGooeyBudget } from '../../liquid/budget';
import { PRESENCE_MATERIAL_LIGHT } from '../../liquid/material/light';
import { LIQUID_MATERIAL } from '../../liquid/material/weight';
import { useSystemReducedMotion } from '../../tokens/reducedMotion';

export interface LiquidRevealProps {
  children: ReactNode;
  /** Real launcher geometry. Omit for a static inline resource surface. */
  source?: RefObject<HTMLElement | null>;
  /** A new explicitly requested presentation, never a token/stream revision. */
  revealKey?: string;
  variant?: 'content' | 'input';
  reducedMotion?: boolean;
  /** Optional slow perimeter flow. Caller must offer a persistent pause control. */
  idleMotion?: 'still' | 'breathe';
  /** Same palette as the source; appearance only, never provider state. */
  colorFrom?: string;
  colorTo?: string;
  motionIntensity?: number;
  motionSpeed?: number;
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
  reducedMotion,
  idleMotion = 'still',
  colorFrom,
  colorTo,
  motionIntensity = 1,
  motionSpeed = 1,
  className = '',
}: LiquidRevealProps) {
  const systemReduced = useSystemReducedMotion();
  const reduced = systemReduced || reducedMotion === true;
  const intensity = clampPresence(motionIntensity, 0.25, 1.25);
  const speed = clampPresence(motionSpeed, 0.5, 1.5);
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
    true,
    variant === 'input',
    intensity,
  );

  const w = Math.max(44, size.width),
    h = Math.max(44, size.height);
  const phase = useLiquidRevealAmbient(
    root,
    !reduced && idleMotion === 'breathe',
    size.width,
    size.height,
    variant === 'input',
    intensity,
    speed,
  );
  const shape = liquidRevealShape(w, h, variant === 'input', phase.current, intensity);
  const filterOK = (w + 24) * (h + 24) <= getLiquidGooeyBudget().maxFilterArea;
  return (
    <div
      ref={root}
      className={`game-ui-liquid-reveal ${className}`}
      style={
        {
          ...(colorFrom ? { '--liquid-presence-from': colorFrom } : {}),
          ...(colorTo ? { '--liquid-presence-to': colorTo } : {}),
        } as CSSProperties
      }
      data-reveal-variant={variant}
      data-reveal-surface="material"
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
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              {PRESENCE_MATERIAL_LIGHT.map(([offset, color]) => (
                <stop key={offset} offset={offset} style={{ stopColor: color }} />
              ))}
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
                blur={LIQUID_MATERIAL.blur}
                contrast={LIQUID_MATERIAL.contrast}
                gloss={LIQUID_MATERIAL.gloss}
                shadows={[]}
                stroke={null}
                waviness={0}
              />
            </filter>
          </defs>
          <path data-reveal-body="" d={shape.outline} fill={`url(#${id}-fill)`} />
          <g data-reveal-material="" filter={filterOK ? `url(#${id}-finish)` : undefined}>
            <path data-reveal-outline="" d={shape.outline} fill={`url(#${id}-fill)`} />
          </g>
        </svg>
      )}
    </div>
  );
}
