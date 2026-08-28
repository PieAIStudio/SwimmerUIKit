import {
  createContext,
  forwardRef,
  useContext,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';

import { LiquidGooeyFilter } from './liquidGooeyFilter';
import {
  LiquidGooeyEngine,
  type LiquidGooeyItemConfig,
  type LiquidGooeyMotionMode,
} from './liquidGooeyEngine';
import type { CornerRadii } from './liquidGooeyGeometry';
import { parseShadow, parseStroke } from './liquidGooeyShadow';
import type { Transition } from './liquidGooeySpring';

export interface LiquidGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  /** Goo blur sigma in px. Larger values bridge larger gaps. */
  blur?: number;
  /** Alpha-contrast slope. Larger values make the liquid edge harder. */
  contrast?: number;
  /** Surface fill. Defaults to the kit's theme surface token. */
  fill?: string;
  /** Extra filter-region slack in px for the silhouette's painted edges. */
  filterPadding?: number;
  /** Optional token-based box-shadow syntax rebuilt on the merged silhouette. */
  shadow?: string;
  /** Optional stroke syntax rebuilt on the merged silhouette. Note: Do NOT add border to children directly! */
  stroke?: string;
  /** Deterministic reduced-motion override for previews; auto follows the OS. */
  motion?: 'auto' | 'reduced';
}

export interface LiquidItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  /** Mirrored translation applied to the content wrapper and SVG silhouette. */
  x?: number;
  y?: number;
  scale?: number;
  /** Spring preset/config or an explicit duration/easing pair. */
  transition?: Transition;
  /** Delay before this item starts its group-clock transition, in ms. */
  delay?: number;
  /** Override the measured content border radius for the silhouette. */
  radius?: number | CornerRadii;
}

interface LiquidGroupContextValue {
  portal: SVGGElement | null;
  engine: LiquidGooeyEngine;
}

const LiquidGroupContext = createContext<LiquidGroupContextValue | null>(null);

function useLiquidGroupContext(): LiquidGroupContextValue {
  const context = useContext(LiquidGroupContext);
  if (!context) throw new Error('<LiquidGroup.Item> must be rendered inside <LiquidGroup>.');
  return context;
}

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function joinClasses(...classes: Array<string | undefined>): string | undefined {
  const result = classes.filter(Boolean).join(' ');
  return result || undefined;
}

function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
    setReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function shadowExtentOf(shadows: ReturnType<typeof parseShadow>): number {
  return shadows.reduce(
    (extent, shadow) =>
      Math.max(
        extent,
        Math.max(Math.abs(shadow.x), Math.abs(shadow.y)) +
          shadow.blur * 1.5 +
          Math.max(0, shadow.spread),
      ),
    0,
  );
}

const LiquidGroupRoot = forwardRef<HTMLDivElement, LiquidGroupProps>(function LiquidGroup(
  {
    blur = 6,
    contrast = 18,
    fill = 'var(--game-ui-surface, var(--game-ui-panel-strong))',
    filterPadding = 24,
    shadow,
    stroke,
    motion = 'auto',
    className,
    style,
    children,
    ...rest
  },
  forwardedRef: Ref<HTMLDivElement>,
) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [portal, setPortal] = useState<SVGGElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const systemReducedMotion = useSystemReducedMotion();
  const reducedMotion = motion === 'reduced' || systemReducedMotion;
  const [motionMode, setMotionMode] = useState<LiquidGooeyMotionMode>(
    reducedMotion ? 'reduced' : 'static',
  );

  const blurValue = Math.max(0, finite(blur, 6));
  const contrastValue = Math.max(1, finite(contrast, 18));
  const filterPaddingValue = Math.max(0, finite(filterPadding, 24));
  const shadows = useMemo(() => parseShadow(shadow), [shadow]);
  const parsedStroke = useMemo(() => parseStroke(stroke), [stroke]);
  const pad = Math.ceil(
    blurValue * 3 +
      filterPaddingValue +
      shadowExtentOf(shadows) +
      (parsedStroke ? parsedStroke.width : 0),
  );
  const padRef = useRef(pad);
  padRef.current = pad;

  const filterId = `liquid-gooey-${sanitizeId(useId())}`;
  const setGroupRef = useCallback(
    (node: HTMLDivElement | null): void => {
      groupRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const setPortalRef = useCallback((node: SVGGElement | null): void => setPortal(node), []);

  // The engine is intentionally stable across prop changes; live values are
  // updated through its setters so a render cannot tear an animation in half.
  const engine = useMemo(
    () =>
      new LiquidGooeyEngine({
        getGroup: () => groupRef.current,
        getFilterArea: () => {
          const group = groupRef.current;
          if (!group) return 0;
          return (
            (group.offsetWidth + padRef.current * 2) * (group.offsetHeight + padRef.current * 2)
          );
        },
        onModeChange: setMotionMode,
      }),
    // Its live values are updated below.
    [],
  );

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const measure = (): void => {
      const next = { w: group.offsetWidth, h: group.offsetHeight };
      setSize((previous) => (previous.w === next.w && previous.h === next.h ? previous : next));
      engine.setFilterArea((next.w + pad * 2) * (next.h + pad * 2));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    return () => observer.disconnect();
  }, [engine, pad]);

  useEffect(() => {
    engine.setReducedMotion(reducedMotion);
  }, [engine, reducedMotion]);

  useEffect(() => () => engine.dispose(), [engine]);

  const viewWidth = Math.max(1, size.w);
  const viewHeight = Math.max(1, size.h);
  const classes = joinClasses('game-ui-liquid-group', className);

  return (
    <div
      {...rest}
      ref={setGroupRef}
      className={classes}
      data-liquid-motion={motionMode}
      style={style}
    >
      <svg
        aria-hidden="true"
        className="game-ui-liquid-silhouette"
        data-liquid-gooey-silhouette=""
        focusable="false"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      >
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height={viewHeight + pad * 2}
            id={filterId}
            width={viewWidth + pad * 2}
            x={-pad}
            y={-pad}
          >
            <LiquidGooeyFilter
              blur={blurValue}
              contrast={contrastValue}
              shadows={shadows}
              stroke={parsedStroke}
            />
          </filter>
        </defs>
        <g ref={setPortalRef} fill={fill} filter={`url(#${filterId})`} />
      </svg>
      <LiquidGroupContext.Provider value={{ portal, engine }}>
        <div className="game-ui-liquid-content">{children}</div>
      </LiquidGroupContext.Provider>
    </div>
  );
});

export const LiquidItem = forwardRef<HTMLDivElement, LiquidItemProps>(function LiquidItem(
  { x = 0, y = 0, scale = 1, transition, delay, radius, className, style, children, ...rest },
  forwardedRef,
) {
  const { portal, engine } = useLiquidGroupContext();
  const itemId = `liquid-item-${sanitizeId(useId())}`;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<SVGPathElement | null>(null);
  const initialConfig = useRef<LiquidGooeyItemConfig | null>(null);
  const config = useMemo<LiquidGooeyItemConfig>(() => {
    const next: LiquidGooeyItemConfig = {
      x: finite(x, 0),
      y: finite(y, 0),
      scale: finite(scale, 1),
    };
    if (transition !== undefined) next.transition = transition;
    if (delay !== undefined) next.delay = delay;
    if (radius !== undefined) next.radius = radius;
    return next;
  }, [delay, radius, scale, transition, x, y]);
  if (initialConfig.current === null) initialConfig.current = config;

  const setHostRef = useCallback(
    (node: HTMLDivElement | null): void => {
      hostRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  useLayoutEffect(() => {
    const host = hostRef.current;
    const blob = blobRef.current;
    if (!portal || !host || !blob || !initialConfig.current) return;
    return engine.register({ id: itemId, host, blob, config: initialConfig.current });
  }, [engine, itemId, portal]);

  useLayoutEffect(() => {
    engine.update(itemId, config);
  }, [config, engine, itemId]);

  useLayoutEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const host = hostRef.current;
      if (!host) return;
      const child = host.firstElementChild;
      if (!child) return;
      const style = window.getComputedStyle(child);
      const hasBorder = style.borderStyle !== 'none' && style.borderWidth !== '0px' && style.borderWidth !== '';
      const hasOutline = style.outlineStyle !== 'none' && style.outlineWidth !== '0px' && style.outlineWidth !== '';
      const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none';
      if (hasBorder || hasOutline || hasBoxShadow) {
        console.warn(
          'LiquidGroup.Item children should not have their own border, outline, or box-shadow. ' +
          'They exist on the content layer and will not merge with the liquid silhouette. ' +
          'Use the `stroke` and `shadow` props on <LiquidGroup> instead.'
        );
      }
    }
  }, []);

  return (
    <>
      <div
        {...rest}
        ref={setHostRef}
        className={joinClasses('game-ui-liquid-item', className)}
        style={style}
      >
        {children}
      </div>
      {portal ? createPortal(<path ref={blobRef} d="" data-liquid-gooey-blob="" />, portal) : null}
    </>
  );
});

export const LiquidGroup = Object.assign(LiquidGroupRoot, { Item: LiquidItem });

export type { CornerRadii, Transition };
