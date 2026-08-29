/**
 * Waviness filter pass adapted from `liquid-gooey` by Jakub Antalik.
 *
 * Source: https://github.com/Jakubantalik/Libraries/tree/main/packages/liquid-gooey
 * Pinned commit: 3862ffa345217443b63696a8c331a0664eea4b04
 * Copyright (c) 2026 Jakub Antalik. Licensed under the MIT License.
 * See NOTICE for the attribution and license text.
 */

import type { ReactElement } from 'react';

import type { ShadowLayer, StrokeLayer } from './liquidGooeyShadow';

const BINARIZE = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -29.5';

/**
 * Small post-displacement pass that lets the browser reconstruct a clean
 * alpha contour after the wavy silhouette has been moved between pixels.
 */
export const LIQUID_GOOEY_EDGE_SOFTENING_BLUR = 0.5;

/** Fallbacks for SSR and hosts that have not loaded the CSS token layer yet. */
export const LIQUID_GOOEY_FILTER_DEFAULTS = {
  waviness: 6,
  wavinessFreq: 0.018,
} as const;

function insetContour(shadow: ShadowLayer): 'bin' | 'shape' {
  // Spread needs a hard mask: morphology on a soft fringe paints a hairline.
  // Offset-only inset is drawn from the anti-aliased silhouette so the 2px
  // clay highlight does not leak as a dashed rim through a binarised contour.
  return shadow.spread !== 0 ? 'bin' : 'shape';
}

function needsBinarize(shadows: ShadowLayer[], stroke: StrokeLayer | null): boolean {
  return stroke !== null || shadows.some((shadow) => shadow.spread !== 0);
}

function InsetPass({ index, shadow }: { index: number; shadow: ShadowLayer }): ReactElement {
  const parts: ReactElement[] = [];
  const contour = insetContour(shadow);
  let source: string = contour;
  if (shadow.spread !== 0) {
    parts.push(
      <feMorphology
        key="erode"
        in={source}
        operator={shadow.spread > 0 ? 'erode' : 'dilate'}
        radius={Math.abs(shadow.spread)}
        result={`shadow-${index}-erode`}
      />,
    );
    source = `shadow-${index}-erode`;
  }
  if (shadow.x !== 0 || shadow.y !== 0) {
    parts.push(
      <feOffset
        key="offset"
        in={source}
        dx={shadow.x}
        dy={shadow.y}
        result={`shadow-${index}-offset`}
      />,
    );
    source = `shadow-${index}-offset`;
  }
  if (shadow.blur > 0) {
    parts.push(
      <feGaussianBlur
        key="blur"
        in={source}
        stdDeviation={shadow.blur / 2}
        result={`shadow-${index}-blur`}
      />,
    );
    source = `shadow-${index}-blur`;
  }
  parts.push(
    <feComposite
      key="band"
      in={contour}
      in2={source}
      operator="out"
      result={`shadow-${index}-band`}
    />,
    <feFlood key="color" floodColor={shadow.color} result={`shadow-${index}-color`} />,
    <feComposite
      key="fill"
      in={`shadow-${index}-color`}
      in2={`shadow-${index}-band`}
      operator="in"
      result={`shadow-${index}`}
    />,
  );
  return <>{parts}</>;
}

/** Spread rings and other SVG-only outer layers. Blurred offset shadows
 *  without spread are CSS `drop-shadow()` on the silhouette element. */
function ShadowPass({ index, shadow }: { index: number; shadow: ShadowLayer }): ReactElement {
  const parts: ReactElement[] = [];
  let source = 'shape';
  if (shadow.spread !== 0) {
    parts.push(
      <feMorphology
        key="spread"
        in="bin"
        operator={shadow.spread > 0 ? 'dilate' : 'erode'}
        radius={Math.abs(shadow.spread)}
        result={`shadow-${index}-spread`}
      />,
    );
    source = `shadow-${index}-spread`;
  }
  if (shadow.blur > 0) {
    parts.push(
      <feGaussianBlur
        key="blur"
        in={source}
        stdDeviation={shadow.blur / 2}
        result={`shadow-${index}-blur`}
      />,
    );
    source = `shadow-${index}-blur`;
  }
  if (shadow.x !== 0 || shadow.y !== 0) {
    parts.push(
      <feOffset
        key="offset"
        in={source}
        dx={shadow.x}
        dy={shadow.y}
        result={`shadow-${index}-offset`}
      />,
    );
    source = `shadow-${index}-offset`;
  }
  parts.push(
    <feFlood key="color" floodColor={shadow.color} result={`shadow-${index}-color`} />,
    <feComposite
      key="fill"
      in={`shadow-${index}-color`}
      in2={source}
      operator="in"
      result={`shadow-${index}`}
    />,
  );
  return <>{parts}</>;
}

function StrokePass({ stroke }: { stroke: StrokeLayer }): ReactElement {
  const parts: ReactElement[] = [];
  parts.push(
    <feMorphology
      key="erode"
      in="bin"
      operator="erode"
      radius={stroke.width}
      result="stroke-erode"
    />,
    <feComposite key="band" in="bin" in2="stroke-erode" operator="out" result="stroke-band" />,
    <feFlood key="color" floodColor={stroke.color} result="stroke-color" />,
    <feComposite
      key="fill"
      in="stroke-color"
      in2="stroke-band"
      operator="in"
      result="stroke-out"
    />,
  );
  return <>{parts}</>;
}

export function LiquidGooeyFilter({
  blur,
  contrast,
  shadows,
  stroke,
  waviness = LIQUID_GOOEY_FILTER_DEFAULTS.waviness,
  wavinessFreq = LIQUID_GOOEY_FILTER_DEFAULTS.wavinessFreq,
}: {
  blur: number;
  contrast: number;
  shadows: ShadowLayer[];
  stroke: StrokeLayer | null;
  /** Max px the liquid boundary undulates. 0 keeps the calm geometric edge. */
  waviness?: number;
  /** Noise frequency of the undulation; lower values make longer waves. */
  wavinessFreq?: number;
}): ReactElement {
  const intercept = Math.round((0.5 - contrast * (5 / 12)) * 100) / 100;
  const wavy = waviness > 0;
  return (
    <>
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${intercept}`}
        result="goo"
      />
      <feComposite
        in="SourceGraphic"
        in2="goo"
        operator="atop"
        result={wavy ? 'shape-raw' : 'shape'}
      />
      {/* The liquid boundary itself undulates: the whole silhouette — edges,
          neck, SVG-resident shadow source — runs through one gentle
          displacement field, so the surface reads as fluid even at rest.
          Inset/spread consume the displaced 'shape'. Compositor drop-shadows
          then hug the already-merged SVG alpha. */}
      {wavy ? (
        <>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={wavinessFreq}
            numOctaves={2}
            seed="7"
            result="wave-noise"
          />
          <feDisplacementMap
            in="shape-raw"
            in2="wave-noise"
            scale={waviness * 2}
            xChannelSelector="R"
            yChannelSelector="G"
            result="shape-displaced"
          />
          <feGaussianBlur
            in="shape-displaced"
            stdDeviation={LIQUID_GOOEY_EDGE_SOFTENING_BLUR}
            result="shape"
          />
        </>
      ) : null}
      {needsBinarize(shadows, stroke) ? (
        <feColorMatrix in="shape" type="matrix" values={BINARIZE} result="bin" />
      ) : null}
      {shadows.map((shadow, index) =>
        shadow.inset ? (
          <InsetPass key={index} index={index} shadow={shadow} />
        ) : (
          <ShadowPass key={index} index={index} shadow={shadow} />
        ),
      )}
      {stroke ? <StrokePass stroke={stroke} /> : null}
      {shadows.length > 0 || stroke ? (
        <feMerge>
          {shadows
            .map((shadow, index) => (shadow.inset ? -1 : index))
            .filter((index) => index >= 0)
            .reverse()
            .map((index) => (
              <feMergeNode key={index} in={`shadow-${index}`} />
            ))}
          <feMergeNode in="shape" />
          {stroke ? <feMergeNode in="stroke-out" /> : null}
          {shadows.map((shadow, index) =>
            shadow.inset ? <feMergeNode key={index} in={`shadow-${index}`} /> : null,
          )}
        </feMerge>
      ) : null}
    </>
  );
}
