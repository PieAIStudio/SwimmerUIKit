import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { LiquidGooeyFilter } from './liquidGooeyFilter';
import { useSystemReducedMotion } from './reducedMotion';
import { presenceBody, presenceSeat, clampPresence } from './liquidPresenceGeometry';
import { useLiquidPresenceMotion } from './useLiquidPresenceMotion';
import type { LiquidPresenceProps } from './liquidPresenceTypes';

/** A liquid body and its visual gesture. It never creates a model, acquires
 * media, clicks an app control, or interprets animation as a task receipt. */
export function LiquidPresence(props: LiquidPresenceProps) {
  const systemReduced = useSystemReducedMotion();
  const reduced = systemReduced || props.reducedMotion === true;
  const size = clampPresence(props.size ?? 64, 32, 224);
  const id = `presence-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const source = useRef<HTMLSpanElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);
  useEffect(() => {
    const targetDialog = props.target?.contextElement?.closest('dialog');
    setPortalRoot(targetDialog ?? source.current?.closest('dialog') ?? document.body);
  }, [props.target?.contextElement]);
  useEffect(() => {
    const anchor = source.current;
    const layer = overlay.current;
    if (!anchor || !layer) return;
    // A body/native-dialog portal leaves the component's theme subtree. Copy
    // only the material and label tokens this leaf uses, including local host
    // overrides. Never move the page theme just to fix one floating element.
    const tokens = [
      '--liquid-presence-from',
      '--liquid-presence-to',
      '--game-ui-secondary',
      '--game-ui-warning',
      '--game-ui-panel-strong',
      '--game-ui-text',
      '--game-ui-font-body',
      '--game-ui-radius-control',
      '--game-ui-shadow-button',
      // Interactive explanations reuse brand controls, not a second control
      // theme. Carry their semantic paint tokens across the same portal.
      '--game-ui-surface-raised',
      '--game-ui-text-muted',
      '--game-ui-border-subtle',
      '--game-ui-border-ink',
      '--game-ui-disabled',
      '--game-ui-button-lip-ink',
      '--game-ui-accent',
      '--game-ui-accent-bright',
      '--game-ui-accent-contrast',
    ];
    const sync = () => {
      const computed = getComputedStyle(anchor);
      for (const token of tokens) {
        const value = computed.getPropertyValue(token).trim();
        if (layer.style.getPropertyValue(token) !== value) layer.style.setProperty(token, value);
      }
    };
    const observer = new MutationObserver(sync);
    for (let node: Element | null = anchor; node; node = node.parentElement) {
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-game-ui-theme', 'data-activity'],
      });
    }
    sync();
    window.addEventListener('resize', sync, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [portalRoot]);
  useLiquidPresenceMotion(source, overlay, { ...props, size, reducedMotion: reduced }, portalRoot);
  const style = {
    width: size,
    height: size,
    ...(props.colorFrom ? { '--liquid-presence-from': props.colorFrom } : {}),
    ...(props.colorTo ? { '--liquid-presence-to': props.colorTo } : {}),
    ...(['error', 'unknown'].includes(props.activity ?? '')
      ? {
          '--liquid-presence-from': 'var(--game-ui-warning)',
          '--liquid-presence-to': 'var(--game-ui-warning)',
        }
      : {}),
  } as CSSProperties;
  const material = (
    suffix: string,
    region: { x: number; y: number; width: number; height: number },
  ) => (
    <defs>
      <linearGradient
        id={`${id}-${suffix}-fill`}
        gradientUnits="userSpaceOnUse"
        x1={suffix === 'core' ? 24 : -24}
        y1={suffix === 'core' ? 16 : -18}
        x2={suffix === 'core' ? 136 : 24}
        y2={suffix === 'core' ? 146 : 18}
      >
        <stop offset="0" stopColor="var(--liquid-presence-from, var(--game-ui-secondary))" />
        <stop offset="1" stopColor="var(--liquid-presence-to, var(--game-ui-secondary))" />
      </linearGradient>
      <filter
        id={`${id}-${suffix}-goo`}
        filterUnits="userSpaceOnUse"
        {...region}
        colorInterpolationFilters="sRGB"
      >
        <LiquidGooeyFilter
          blur={suffix === 'core' ? 5 : 2}
          contrast={18}
          gloss={3.5}
          shadows={[]}
          stroke={null}
          waviness={0}
        />
      </filter>
    </defs>
  );
  return (
    <>
      <span
        ref={source}
        className={`game-ui-liquid-presence ${props.className ?? ''}`}
        style={style}
        data-activity={props.activity ?? 'idle'}
        aria-hidden="true"
      >
        <svg viewBox="0 0 160 160" focusable="false">
          {material('core', { x: -80, y: -80, width: 320, height: 320 })}
          <g fill={`url(#${id}-core-fill)`} filter={`url(#${id}-core-goo)`}>
            <path data-presence-body="" d={presenceBody()} />
            <circle data-presence-bud="" cx="80" cy="80" r="0" style={{ display: 'none' }} />
            {[0, 1, 2].map((key) => (
              <circle
                key={key}
                data-presence-satellite=""
                cx="80"
                cy="80"
                r="0"
                style={{ display: 'none' }}
              />
            ))}
          </g>
        </svg>
      </span>
      {portalRoot &&
        createPortal(
          <div
            ref={overlay}
            className="game-ui-liquid-presence-overlay"
            style={{ ...style, width: undefined, height: undefined }}
            data-presence-overlay=""
          >
            <svg
              className="game-ui-liquid-presence-flight"
              viewBox="-48 -36 96 72"
              aria-hidden="true"
              focusable="false"
              style={{ display: 'none' }}
            >
              {material('flight', { x: -48, y: -36, width: 96, height: 72 })}
              <g fill={`url(#${id}-flight-fill)`} filter={`url(#${id}-flight-goo)`}>
                <g data-presence-flight-body="">
                  <circle r="16" />
                  <g data-presence-trail="">
                    <circle cx="-27" cy="5" r="4.5" />
                    <circle cx="-36" cy="8" r="2.5" />
                  </g>
                </g>
              </g>
            </svg>
            <svg
              className="game-ui-liquid-presence-seat"
              viewBox="-56 -28 112 56"
              aria-hidden="true"
              focusable="false"
              style={{ display: 'none' }}
            >
              {material('seat', { x: -56, y: -28, width: 112, height: 56 })}
              <path
                data-presence-seat-body=""
                d={presenceSeat(48, 1)}
                fill={`url(#${id}-seat-fill)`}
                filter={`url(#${id}-seat-goo)`}
              />
            </svg>
            <div
              className={`game-ui-liquid-presence-label${props.guideContent ? ' game-ui-liquid-presence-label--guide' : ''}`}
              role={props.guideContent ? undefined : 'status'}
              aria-atomic={props.guideContent ? undefined : true}
              onClick={props.guideContent ? (event) => event.stopPropagation() : undefined}
              onPointerDown={props.guideContent ? (event) => event.stopPropagation() : undefined}
              onKeyDown={
                props.guideContent
                  ? (event) => {
                      // Portals bubble through the source launcher in the React tree.
                      event.stopPropagation();
                      if (event.key === 'Escape') event.preventDefault();
                    }
                  : undefined
              }
              hidden
            >
              {props.guideContent ?? props.target?.label.slice(0, 240)}
            </div>
          </div>,
          portalRoot,
        )}
    </>
  );
}
