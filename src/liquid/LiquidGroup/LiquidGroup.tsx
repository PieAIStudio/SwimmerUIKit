import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from 'react';

import { CLAY_LIQUID_GOOEY_TOKENS } from '../../tokens/legacy';

import { liquidFinishGloss } from '../finish';

import { DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET } from '../budget';

import { LiquidGooeyFilter, LIQUID_GOOEY_FILTER_DEFAULTS } from '../filter';

import { LIQUID_GOOEY_WAVINESS_MAX_FRACTION, resolveLiquidGooeyWaviness } from '../waviness';

import { LiquidGooeyEngine, type LiquidGooeyMotionMode } from '../engine';

import { useSystemReducedMotion } from '../../tokens/reducedMotion';

import {
  compositorDropShadowFilter,
  parseShadow,
  parseStroke,
  shadowExtentOf,
  svgFilterShadows,
} from '../shadow';

import { createImageMeltRegistry } from '../../liquid-effects/melt/registry';

import { ImageMeltLayer } from '../../liquid-effects/melt/ImageMeltLayer';
import { type LiquidGroupProps } from './types';
import {
  finite,
  resolveCssVariable,
  sanitizeId,
  readNumericCssToken,
  joinClasses,
} from './resolve';
import { LiquidFillGradient } from './fill';
import { LiquidGroupContext } from './context';
import { LiquidItem } from './LiquidItem';

const LiquidGroupRoot = forwardRef<HTMLDivElement, LiquidGroupProps>(function LiquidGroup(
  {
    blur = 6,
    contrast = 18,
    gloss,
    liquidFinish,
    fill = 'var(--game-ui-surface, var(--game-ui-panel-strong))',
    filterPadding = 24,
    shadow,
    stroke,
    waviness,
    wavinessFreq,
    wavinessClamp,
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
  const requestedWavinessValue = Math.max(
    0,
    finite(waviness ?? liquidFilterTokens.waviness, LIQUID_GOOEY_FILTER_DEFAULTS.waviness),
  );
  const wavinessClampValue =
    wavinessClamp === false
      ? false
      : Math.max(
          0,
          finite(
            wavinessClamp ?? LIQUID_GOOEY_WAVINESS_MAX_FRACTION,
            LIQUID_GOOEY_WAVINESS_MAX_FRACTION,
          ),
        );
  const shorterSide = size.w > 0 && size.h > 0 ? Math.min(size.w, size.h) : 0;
  const wavinessValue = resolveLiquidGooeyWaviness(
    requestedWavinessValue,
    shorterSide,
    wavinessClampValue,
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
  // Large-radius outer shadows (0 13px 26px and friends) run as CSS
  // drop-shadow() on the SVG element. SVG feGaussianBlur of that radius
  // re-rasterises the whole padded filter region on the CPU every frame;
  // CSS drop-shadow is the same math (blur-radius = 2σ) on the compositor.
  // Inset and spread stay in the SVG filter — CSS cannot express them.
  const svgShadows = useMemo(() => svgFilterShadows(shadows), [shadows]);
  const cssShadowFilter = useMemo(() => compositorDropShadowFilter(shadows), [shadows]);
  const parsedStroke = useMemo(() => parseStroke(resolvedStroke), [resolvedStroke]);
  const basePad = Math.ceil(
    blurValue * 3 +
      filterPaddingValue +
      shadowExtentOf(svgShadows) +
      (parsedStroke ? parsedStroke.width : 0) +
      // feDisplacementMap can move either channel by at most `waviness` px;
      // reserve that slack so the wavy silhouette stays inside the filter
      // raster. Compositor drop-shadows paint outside this region on purpose.
      wavinessValue,
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
      data-liquid-finish={liquidFinish}
      data-liquid-waviness={Math.round(wavinessValue * 100) / 100}
      style={style}
    >
      <svg
        aria-hidden="true"
        className="game-ui-liquid-silhouette"
        data-liquid-gooey-silhouette=""
        focusable="false"
        style={cssShadowFilter ? { filter: cssShadowFilter } : undefined}
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
              gloss={gloss ?? liquidFinishGloss(liquidFinish, 0)}
              shadows={svgShadows}
              stroke={parsedStroke}
              waviness={wavinessValue}
              wavinessFreq={wavinessFreqValue}
            />
          </filter>
        </defs>
        {typeof fill === 'string' ? null : (
          <LiquidFillGradient id={`${filterId}-fill`} fill={fill} />
        )}
        <g
          ref={setPortalRef}
          fill={typeof fill === 'string' ? fill : `url(#${filterId}-fill)`}
          filter={`url(#${filterId})`}
        />
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

/**
 * Merges nearby item silhouettes into one shape while leaving their content
 * accessible and separately filtered. Morph content may cross-blur while it
 * moves; Bend keeps its content surface-glued and exposes its live CSS vars.
 * Do NOT add border, outline, or box-shadow to children directly; pass the
 * shared treatment to <LiquidGroup>.
 */
export const LiquidGroup = Object.assign(LiquidGroupRoot, { Item: LiquidItem });
