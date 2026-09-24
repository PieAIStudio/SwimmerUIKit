import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { liquidRevealShape } from './liquidRevealGeometry';
import { useLiquidRevealAmbient } from './useLiquidRevealAmbient';
import { LiquidGooeyFilter } from './liquidGooeyFilter';
import { presenceCurve, validPresenceRect } from './liquidPresenceGeometry';
import {
  getLiquidGooeyBudget,
  releaseLiquidGooeyAnimation,
  tryAcquireLiquidGooeyAnimation,
} from './liquidGooeyBudget';
import { useSystemReducedMotion } from './reducedMotion';

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
  className = '',
}: LiquidRevealProps) {
  const systemReduced = useSystemReducedMotion();
  const reduced = systemReduced || reducedMotion === true;
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const id = `liquid-reveal-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const lastGesture = useRef<string | null>(null);
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

  useEffect(() => {
    const element = root.current,
      drawing = svg.current;
    if (!element || !drawing || !size.width || !size.height) return;
    if (lastGesture.current === revealKey) return;
    lastGesture.current = revealKey;
    const sourceBox = source?.current?.getBoundingClientRect();
    const area = (size.width + 24) * (size.height + 24);
    if (
      reduced ||
      document.hidden ||
      !sourceBox ||
      !validPresenceRect(sourceBox) ||
      typeof element.animate !== 'function' ||
      !tryAcquireLiquidGooeyAnimation(area)
    ) {
      element.dataset.revealMotion = 'static';
      return;
    }
    element.dataset.revealMotion = 'drawing';
    const rect = element.getBoundingClientRect();
    const sx = rect.width / size.width || 1,
      sy = rect.height / size.height || 1;
    const from = {
      x: (sourceBox.x + sourceBox.width / 2 - rect.x) / sx,
      y: (sourceBox.y + sourceBox.height / 2 - rect.y) / sy,
    };
    const path = drawing.querySelector<SVGPathElement>('[data-reveal-outline]');
    const length = path?.getTotalLength() ?? 0;
    // The material arrives at the nearest real edge from ANY host placement.
    // No fast bead races a whole rectangle like a loading indicator.
    const to = path
      ? Array.from({ length: 48 }, (_, i) => path.getPointAtLength((length * i) / 48)).reduce(
          (a, b) =>
            Math.hypot(b.x - from.x, b.y - from.y) < Math.hypot(a.x - from.x, a.y - from.y) ? b : a,
        )
      : { x: size.width - 18, y: size.height - 30 };
    const viewport = {
      x: -rect.x / sx,
      y: -rect.y / sy,
      width: innerWidth / sx,
      height: innerHeight / sy,
    };
    const animations: Animation[] = [];
    for (const bead of drawing.querySelectorAll<SVGGElement>('[data-reveal-flight]')) {
      const index = Number(bead.dataset.revealFlight);
      const frames = Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const point = presenceCurve(from, to, t, viewport);
        return {
          transform: `translate(${point.x}px, ${point.y}px) scale(${1 - index * 0.2})`,
          opacity: i === 0 || i === 12 ? 0 : 1,
        };
      });
      animations.push(
        bead.animate(frames, {
          duration: 340,
          delay: index * 35,
          easing: 'cubic-bezier(.2,.7,.2,1)',
        }),
      );
    }
    const material = drawing.querySelector<SVGGElement>('[data-reveal-material]');
    if (material) {
      animations.push(
        material.animate([{ opacity: 0.18 }, { opacity: 1 }], {
          duration: 700,
          delay: 140,
          fill: 'backwards',
          easing: 'cubic-bezier(.18,.65,.2,1)',
        }),
      );
    }
    let released = false;
    const finish = () => {
      if (released) return;
      released = true;
      animations.forEach((animation) => animation.cancel());
      releaseLiquidGooeyAnimation();
      element.dataset.revealMotion = 'settled';
    };
    void Promise.all(animations.map((animation) => animation.finished)).then(finish, finish);
    const hide = () => {
      if (document.hidden) finish();
    };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('resize', finish);
    window.addEventListener('scroll', finish, true);
    return () => {
      finish();
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('resize', finish);
      window.removeEventListener('scroll', finish, true);
      // Resize / preference changes settle, rather than replaying a flight from
      // a stale source. A genuinely new mounted surface gets its own ref.
    };
  }, [revealKey, reduced, size.width, size.height, source]);

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
      data-reveal-filter={filterOK ? 'volume' : 'flat'}
    >
      <div className="game-ui-liquid-reveal-content">{children}</div>
      {size.width > 0 && (
        <svg
          ref={svg}
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
          {/* Small flights must not be clipped by the perimeter's filter bounds. */}
          {[0, 1, 2].map((index) => (
            <g key={index} data-reveal-flight={index} opacity="0" fill={`url(#${id}-fill)`}>
              <ellipse rx="8" ry="6" />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
