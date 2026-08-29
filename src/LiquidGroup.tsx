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

import { CLAY_LIQUID_GOOEY_TOKENS } from './clay/tokens';
import { DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET } from './liquidGooeyBudget';
import {
  LiquidGooeyFilter,
  LIQUID_GOOEY_EDGE_SOFTENING_BLUR,
  LIQUID_GOOEY_FILTER_DEFAULTS,
} from './liquidGooeyFilter';
import {
  LiquidGooeyEngine,
  type LiquidGooeyItemConfig,
  type LiquidGooeyMotionMode,
} from './liquidGooeyEngine';
import type { CornerRadii } from './liquidGooeyGeometry';
import type { BendTuning } from './liquidGooeyMove';
import type { MorphTuning } from './liquidGooeyEvolve';
import { parseShadow, parseStroke } from './liquidGooeyShadow';
import type { Transition } from './liquidGooeySpring';
import {
  createImageMeltRegistry,
  ImageMeltItem,
  ImageMeltLayer,
  registerDissolveItem,
  type DissolveOptions,
  type DissolveRegistration,
  type ImageMeltItemProps,
  type ImageMeltOptions,
  type ImageMeltRegistry,
} from './liquidGooeyImageMelt';

/**
 * A shared liquid silhouette behind crisp item content.
 *
 * Put the visual treatment on the group: `fill`, `stroke`, and `shadow` are
 * rebuilt on the merged silhouette. Do NOT add border, outline, or box-shadow
 * to children directly; those styles live on the content layer and cannot
 * merge with the liquid shape.
 *
 * Its motion vocabulary is intentionally small and semantic:
 *
 * | gesture | meaning |
 * | --- | --- |
 * | **merge** (Morph) | two things become one: reward settling, collecting, confirming |
 * | **follow** (Move) | selection, progress, dragging |
 * | **shape** (Morph shape) | the liquid changes size and corners like jelly |
 * | **bend** | speed bows the surface while content stays glued to it |
 * | **dissolve** | replacement, transition |
 * | **still** | THE DEFAULT |
 *
 * Liquid appears only on a state change the user caused. There is no ambient,
 * idle, or decorative liquid; keep the filter-area budget visible when more
 * than one group is on a screen.
 */
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
  /** Max px the liquid boundary undulates. Defaults to the CSS token (6). */
  waviness?: number;
  /** Noise frequency of the undulation; lower values make longer waves. */
  wavinessFreq?: number;
  /**
   * `auto` follows the existing component transition clock, `follow` adopts
   * the Move surface for an explicit user-caused selection/progress gesture,
   * and `reduced` snaps. Still remains the house default gesture.
   */
  motion?: 'auto' | 'follow' | 'reduced';
}

export interface LiquidItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Crisp content rendered above the merged silhouette. Do NOT add border,
   * outline, or box-shadow to children directly; put the shared treatment on
   * the parent <LiquidGroup> instead.
   */
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
  /** Select the adopted item surface behavior. Bend follows child geometry. */
  effect?: 'morph' | 'move' | 'melt' | 'bend';
  /** Morph shape, tempo, bounce, and content cross-blur tuning. */
  morph?: MorphTuning;
  /** Bend strengths for vertical bow and horizontal cap deformation. */
  bend?: BendTuning;
  /** Follow a child moved by external code; Bend implies this automatically. */
  observe?: boolean;
  /** Numeric knobs for the pairwise image Melt surface, plus an optional source URL. */
  melt?: ImageMeltOptions & { src?: string };
  /** Contact image modifier. Text and other DOM content remain on the crisp layer. */
  dissolve?: boolean | number | DissolveOptions;
}

interface LiquidGroupContextValue {
  portal: SVGGElement | null;
  engine: LiquidGooeyEngine;
  follow: boolean;
  imageMelt: ImageMeltRegistry;
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

function resolveCssVariable(
  value: string | undefined,
  element: HTMLElement | null,
): string | undefined {
  if (!value) return value;
  const variable = /^var\((--[\w-]+)\)$/.exec(value.trim());
  if (!variable || !element) return value;
  const view = element.ownerDocument.defaultView;
  if (!view) return value;
  const resolved = view
    .getComputedStyle(element)
    .getPropertyValue(variable[1] ?? '')
    .trim();
  return resolved || value;
}

function readNumericCssToken(value: string, element: HTMLElement | null, fallback: number): number {
  const resolved = resolveCssVariable(value, element);
  const parsed = Number.parseFloat(resolved ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

function joinClasses(...classes: Array<string | undefined>): string | undefined {
  const result = classes.filter(Boolean).join(' ');
  return result || undefined;
}

function imageMeltHostProps(
  input: LiquidItemProps,
): Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  const props = { ...input } as Record<string, unknown>;
  for (const key of [
    'children',
    'effect',
    'melt',
    'dissolve',
    'x',
    'y',
    'scale',
    'transition',
    'delay',
    'radius',
    'morph',
    'bend',
    'observe',
  ]) {
    delete props[key];
  }
  return props as Omit<HTMLAttributes<HTMLDivElement>, 'children'>;
}

/**
 * `window` existing does not mean `matchMedia` does. jsdom ships the first and
 * not the second, and a server render has neither, so both the initializer and
 * the subscription have to ask for the function itself — guarding only on
 * `typeof window` throws in every test runner and every SSR pass.
 */
function reducedMotionQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  if (typeof window.matchMedia !== 'function') return null;
  return window.matchMedia('(prefers-reduced-motion: reduce)');
}

function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => reducedMotionQuery()?.matches ?? false);

  useEffect(() => {
    const media = reducedMotionQuery();
    if (!media) return;
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
    waviness,
    wavinessFreq,
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
  const [liquidFilterTokens, setLiquidFilterTokens] = useState<{
    waviness: number;
    wavinessFreq: number;
  }>({
    waviness: LIQUID_GOOEY_FILTER_DEFAULTS.waviness,
    wavinessFreq: LIQUID_GOOEY_FILTER_DEFAULTS.wavinessFreq,
  });
  const [featurePadding, setFeaturePadding] = useState(0);
  const featurePaddingRef = useRef(0);
  const systemReducedMotion = useSystemReducedMotion();
  const reducedMotion = motion === 'reduced' || systemReducedMotion;
  const [motionMode, setMotionMode] = useState<LiquidGooeyMotionMode>(
    reducedMotion ? 'reduced' : 'static',
  );

  const blurValue = Math.max(0, finite(blur, 6));
  const contrastValue = Math.max(1, finite(contrast, 18));
  const filterPaddingValue = Math.max(0, finite(filterPadding, 24));
  const wavinessValue = Math.max(
    0,
    finite(waviness ?? liquidFilterTokens.waviness, LIQUID_GOOEY_FILTER_DEFAULTS.waviness),
  );
  const wavinessFreqValue = Math.max(
    0,
    finite(
      wavinessFreq ?? liquidFilterTokens.wavinessFreq,
      LIQUID_GOOEY_FILTER_DEFAULTS.wavinessFreq,
    ),
  );
  // `shadow`/`stroke` may be a complete CSS token such as
  // `var(--game-ui-shadow-button)`. Resolve it after the first measured render
  // so the SVG filter receives the token's actual shorthand, not a zero-width
  // placeholder. Inline token expressions remain valid as-is.
  const resolvedShadow = resolveCssVariable(shadow, groupRef.current);
  const resolvedStroke = resolveCssVariable(stroke, groupRef.current);
  const shadows = useMemo(() => parseShadow(resolvedShadow), [resolvedShadow]);
  const parsedStroke = useMemo(() => parseStroke(resolvedStroke), [resolvedStroke]);
  const basePad = Math.ceil(
    blurValue * 3 +
      filterPaddingValue +
      shadowExtentOf(shadows) +
      (parsedStroke ? parsedStroke.width : 0) +
      // feDisplacementMap can move either channel by at most `waviness` px;
      // reserve that slack so the wavy silhouette and its shadow stay inside
      // the filter raster and the area budget reflects the real work.
      wavinessValue +
      // The post-displacement AA blur extends the painted alpha by roughly
      // three sigma; reserve it here so the softened contour is not clipped
      // and the filter-area budget includes the extra raster work.
      (wavinessValue > 0 ? Math.ceil(LIQUID_GOOEY_EDGE_SOFTENING_BLUR * 3) : 0),
  );
  const basePadRef = useRef(basePad);
  basePadRef.current = basePad;
  const pad = Math.ceil(basePad + featurePadding);
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

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const next = {
      waviness: Math.max(
        0,
        waviness === undefined
          ? readNumericCssToken(
              CLAY_LIQUID_GOOEY_TOKENS.waviness,
              group,
              LIQUID_GOOEY_FILTER_DEFAULTS.waviness,
            )
          : finite(waviness, LIQUID_GOOEY_FILTER_DEFAULTS.waviness),
      ),
      wavinessFreq: Math.max(
        0,
        wavinessFreq === undefined
          ? readNumericCssToken(
              CLAY_LIQUID_GOOEY_TOKENS.wavinessFreq,
              group,
              LIQUID_GOOEY_FILTER_DEFAULTS.wavinessFreq,
            )
          : finite(wavinessFreq, LIQUID_GOOEY_FILTER_DEFAULTS.wavinessFreq),
      ),
    };
    setLiquidFilterTokens((previous) =>
      previous.waviness === next.waviness && previous.wavinessFreq === next.wavinessFreq
        ? previous
        : next,
    );
  }, [waviness, wavinessFreq]);

  // The engine is stable across ordinary prop changes; changing the effect
  // mode replaces it so `follow` cannot leak into a neighboring render.
  const engine = useMemo(
    () =>
      new LiquidGooeyEngine({
        getGroup: () => groupRef.current,
        getFilterArea: () => {
          const group = groupRef.current;
          if (!group) return 0;
          return (
            (group.offsetWidth + (basePadRef.current + featurePaddingRef.current) * 2) *
            (group.offsetHeight + (basePadRef.current + featurePaddingRef.current) * 2)
          );
        },
        onModeChange: setMotionMode,
        onFeaturePaddingChange: (next) => {
          featurePaddingRef.current = next;
          setFeaturePadding((previous) => (Math.abs(previous - next) < 0.5 ? previous : next));
        },
        follow: motion === 'follow',
      }),
    // Its live reduced-motion value is updated below.
    [motion],
  );
  const imageMelt = useMemo(() => createImageMeltRegistry(), []);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const measure = (): void => {
      const next = { w: group.offsetWidth, h: group.offsetHeight };
      setSize((previous) => (previous.w === next.w && previous.h === next.h ? previous : next));
      engine.setFilterArea((next.w + padRef.current * 2) * (next.h + padRef.current * 2));
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
      data-liquid-filter-area={Math.round((size.w + pad * 2) * (size.h + pad * 2))}
      data-liquid-filter-budget={DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET}
      data-liquid-feature-padding={Math.round(featurePadding * 10) / 10}
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
              waviness={wavinessValue}
              wavinessFreq={wavinessFreqValue}
            />
          </filter>
        </defs>
        <g ref={setPortalRef} fill={fill} filter={`url(#${filterId})`} />
      </svg>
      <ImageMeltLayer registry={imageMelt} getGroup={() => groupRef.current} />
      <LiquidGroupContext.Provider
        value={{ portal, engine, follow: motion === 'follow', imageMelt }}
      >
        <div className="game-ui-liquid-content">{children}</div>
      </LiquidGroupContext.Provider>
    </div>
  );
});

const LiquidItemContent = forwardRef<HTMLDivElement, LiquidItemProps>(function LiquidItemContent(
  {
    effect,
    melt: ignoredMelt,
    dissolve,
    x = 0,
    y = 0,
    scale = 1,
    transition,
    delay,
    radius,
    morph,
    bend,
    observe,
    className,
    style,
    children,
    ...rest
  },
  forwardedRef,
) {
  const { portal, engine, follow, imageMelt } = useLiquidGroupContext();
  const itemId = `liquid-item-${sanitizeId(useId())}`;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<SVGPathElement | null>(null);
  const initialConfig = useRef<LiquidGooeyItemConfig | null>(null);
  const dissolveRegistration = useRef<DissolveRegistration | null>(null);
  const dissolveKey = JSON.stringify(dissolve ?? null);
  const hasDissolve = dissolve !== undefined && dissolve !== false;
  void ignoredMelt;
  const config = useMemo<LiquidGooeyItemConfig>(() => {
    // The image layer owns `melt`; the shared SVG engine only understands the
    // Morph/Bend surface names. `move` remains the group-level follow mode.
    const engineEffect = effect === 'morph' || effect === 'bend' ? effect : undefined;
    const bendObserved = engineEffect === 'bend';
    const effectiveMorph =
      effect === 'bend' ||
      (follow && morph === undefined && effect !== 'morph') ||
      (hasDissolve && morph === undefined && effect !== 'morph')
        ? undefined
        : (morph ?? {});
    const next: LiquidGooeyItemConfig = {
      ...(engineEffect === undefined ? {} : { effect: engineEffect }),
      ...(effectiveMorph === undefined ? {} : { morph: effectiveMorph }),
      ...(bend === undefined ? {} : { bend }),
      ...(observe === undefined && !bendObserved ? {} : { observe: bendObserved || observe }),
      x: finite(x, 0),
      y: finite(y, 0),
      scale: finite(scale, 1),
    };
    if (transition !== undefined) next.transition = transition;
    if (delay !== undefined) next.delay = delay;
    if (radius !== undefined) next.radius = radius;
    return next;
  }, [bend, delay, effect, follow, hasDissolve, morph, observe, radius, scale, transition, x, y]);
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
    return () => {
      dissolveRegistration.current?.unregister();
      dissolveRegistration.current = null;
    };
  }, [imageMelt]);

  useLayoutEffect(() => {
    if (effect === 'move' || dissolve === undefined || dissolve === false) {
      dissolveRegistration.current?.unregister();
      dissolveRegistration.current = null;
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    if (dissolveRegistration.current) {
      dissolveRegistration.current.update(dissolve);
      return;
    }
    dissolveRegistration.current = registerDissolveItem(imageMelt, host, dissolve);
    // The JSON key is the value dependency; registration identity is stable
    // while the item remains in the same group.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dissolveKey, effect, imageMelt]);

  useEffect(() => {
    if (effect !== 'move' || !hasDissolve || import.meta.env?.DEV === false) return;
    console.warn(
      '[swimmer-ui] dissolve is ignored for effect="move" because Move intentionally lags the measured image rect.',
    );
  }, [effect, hasDissolve]);

  useLayoutEffect(() => {
    if (import.meta.env?.DEV !== false) {
      const host = hostRef.current;
      if (!host) return;
      const child = host.firstElementChild;
      if (!child) return;
      const style = window.getComputedStyle(child);
      const hasBorder =
        style.borderStyle !== 'none' && style.borderWidth !== '0px' && style.borderWidth !== '';
      const hasOutline =
        style.outlineStyle !== 'none' && style.outlineWidth !== '0px' && style.outlineWidth !== '';
      const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none';
      if (hasBorder || hasOutline || hasBoxShadow) {
        console.warn(
          'LiquidGroup.Item children should not have their own border, outline, or box-shadow. ' +
            'They exist on the content layer and will not merge with the liquid silhouette. ' +
            'Use the `stroke` and `shadow` props on <LiquidGroup> instead.',
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

export const LiquidItem = forwardRef<HTMLDivElement, LiquidItemProps>(
  function LiquidItem(props, forwardedRef) {
    const { imageMelt } = useLiquidGroupContext();
    if (props.effect !== 'melt') {
      return <LiquidItemContent {...props} ref={forwardedRef} />;
    }

    const hostProps = imageMeltHostProps(props);
    const children = props.children;
    const melt = { ...(props.melt ?? {}) };
    const src = melt.src;
    delete melt.src;
    const meltProps: ImageMeltItemProps = {
      ...hostProps,
      registry: imageMelt,
      children,
      options: melt,
      ...(src === undefined ? {} : { src }),
      ...(forwardedRef === undefined ? {} : { forwardedRef }),
    };
    return <ImageMeltItem {...meltProps} />;
  },
);

/**
 * Merges nearby item silhouettes into one shape while leaving their content
 * accessible and separately filtered. Morph content may cross-blur while it
 * moves; Bend keeps its content surface-glued and exposes its live CSS vars.
 * Do NOT add border, outline, or box-shadow to children directly; pass the
 * shared treatment to <LiquidGroup>.
 */
export const LiquidGroup = Object.assign(LiquidGroupRoot, { Item: LiquidItem });

export type { BendTuning, CornerRadii, MorphTuning, Transition };
