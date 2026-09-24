import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
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
      typeof element.animate !== 'function' ||
      !sourceBox ||
      !validPresenceRect(sourceBox) ||
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
    const corner = variant === 'input' ? Math.min(28, size.height / 2 - 6) : 28;
    const to = { x: size.width - 6, y: size.height - corner - 6 };
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
          duration: 240,
          delay: index * 30,
          easing: 'cubic-bezier(.2,.7,.2,1)',
        }),
      );
    }
    for (const path of drawing.querySelectorAll<SVGPathElement>('[data-reveal-outline]')) {
      animations.push(
        path.animate(
          [
            { strokeDasharray: '1', strokeDashoffset: '1' },
            { strokeDasharray: '1', strokeDashoffset: '0' },
          ],
          // Hide undrawn ink during the delay; never flash a completed border first.
          { duration: 360, delay: 130, fill: 'backwards', easing: 'cubic-bezier(.18,.65,.2,1)' },
        ),
      );
    }
    const path = drawing.querySelector<SVGPathElement>('[data-reveal-outline]');
    const tip = drawing.querySelector<SVGGElement>('[data-reveal-tip]');
    if (path && tip) {
      const length = path.getTotalLength();
      animations.push(
        tip.animate(
          Array.from({ length: 49 }, (_, index) => {
            const p = path.getPointAtLength((length * index) / 48);
            return {
              transform: `translate(${p.x}px, ${p.y}px)`,
              opacity: index === 0 || index === 48 ? 0 : 1,
            };
          }),
          { duration: 360, delay: 130, easing: 'cubic-bezier(.18,.65,.2,1)' },
        ),
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
    // A moved viewport invalidates the captured flight coordinates. Settle the
    // material, without cancelling scrolling or the original host interaction.
    window.addEventListener('scroll', finish, true);
    window.addEventListener('resize', finish);
    return () => {
      finish();
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('scroll', finish, true);
      window.removeEventListener('resize', finish);
      // Resize / preference changes settle, rather than replaying a flight from
      // a stale source. A genuinely new mounted surface gets its own ref.
    };
  }, [revealKey, reduced, size.width, size.height, source, variant]);

  const w = Math.max(44, size.width),
    h = Math.max(44, size.height);
  const r = variant === 'input' ? Math.min(28, h / 2 - 6) : 28;
  // Begin beside the incoming droplet. Fixed geometry, not a moving text mask.
  const wave = variant === 'input' ? 0 : 3;
  const contour = `M ${w - 6} ${h - r - 6} Q ${w - 4} ${h - 5} ${w - r - 6} ${h - 6} C ${w * 0.66} ${h - 6 - wave} ${w * 0.3} ${h - 6 + wave} ${r + 6} ${h - 6} Q 5 ${h - 4} 6 ${h - r - 6} C ${6 + wave} ${h * 0.67} ${6 - wave} ${h * 0.3} 6 ${r + 6} Q 4 5 ${r + 6} 6 C ${w * 0.34} ${6 - wave} ${w * 0.66} ${6 + wave} ${w - r - 6} 6 Q ${w - 5} 4 ${w - 6} ${r + 6} C ${w - 6 - wave} ${h * 0.3} ${w - 6 + wave} ${h * 0.67} ${w - 6} ${h - r - 6} Z`;
  const filterOK = (w + 24) * (h + 24) <= getLiquidGooeyBudget().maxFilterArea;
  return (
    <div ref={root} className={`game-ui-liquid-reveal ${className}`} data-reveal-variant={variant}>
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
          <g filter={filterOK ? `url(#${id}-finish)` : undefined}>
            <path
              d={contour}
              fill="none"
              stroke={`url(#${id}-fill)`}
              strokeWidth="1"
              opacity="0.2"
            />
            <path
              data-reveal-outline=""
              d={contour}
              pathLength="1"
              fill="none"
              stroke={`url(#${id}-fill)`}
              strokeWidth={variant === 'input' ? 4 : 4.5}
              strokeLinecap="round"
            />
            <g fill={`url(#${id}-fill)`}>
              {variant === 'content' && (
                <>
                  <ellipse cx={w * 0.78} cy="6" rx="17" ry="3.8" />
                  <ellipse cx="6" cy={h * 0.64} rx="3.8" ry="11" />
                  <circle cx={w - 22} cy="0" r="3.5" />
                  <circle cx={w - 10} cy="-7" r="2" />
                </>
              )}
              <ellipse
                cx={w - 16}
                cy={h - 12}
                rx="10"
                ry="5"
                transform={`rotate(-32 ${w - 16} ${h - 12})`}
              />
              <ellipse cx="18" cy="12" rx="8" ry="4" transform="rotate(-25 18 12)" />
              <g data-reveal-tip="" opacity="0">
                <circle r="7" />
              </g>
            </g>
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
