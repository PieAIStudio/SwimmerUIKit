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
 * Post-displacement pass that lets the browser reconstruct a clean alpha
 * contour after the wavy silhouette has been moved between pixels.
 *
 * 0.9, not the 0.5 this shipped with. The goo threshold compresses a blurred
 * alpha ramp into a fraction of a pixel by design — that is what makes a
 * merged body read as one solid shape — and 0.5px of softening afterwards left
 * roughly one pixel of ramp, which is not anti-aliasing. On a 3x capture it
 * looked clean and on a real 1x screen the outline was visibly stepped, which
 * is how it survived review: the screenshots were taken at a density that
 * hides exactly this defect.
 */
export const LIQUID_GOOEY_EDGE_SOFTENING_BLUR = 0.9;

/*
 * Fallbacks for SSR and hosts that have not loaded the CSS token layer yet.
 *
 * `waviness` rests at 0, and that changed in 2.1.0. It used to be 6, which
 * meant the out-of-the-box look was a permanently undulating outline — and
 * University verified in production that waviness on a single static rounded
 * rectangle reads as a rendering defect rather than as liquid, because the
 * gooey technique says 「fluid」 through shapes merging and separating, not
 * through a wobbling edge. Their CTA passes `waviness={0}` on all eighteen
 * surfaces that use it; that override is now unnecessary.
 *
 * Nothing is lost: waviness is still a prop, and a deliberately molten surface
 * asks for it. The default is simply the value that looks correct on the
 * common case rather than the one every consumer has to discover and cancel.
 */
export const LIQUID_GOOEY_FILTER_DEFAULTS = {
  waviness: 0,
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
  gloss = 0,
  waviness = LIQUID_GOOEY_FILTER_DEFAULTS.waviness,
  wavinessFreq = LIQUID_GOOEY_FILTER_DEFAULTS.wavinessFreq,
}: {
  blur: number;
  contrast: number;
  shadows: ShadowLayer[];
  stroke: StrokeLayer | null;
  /**
   * Volume. 0 leaves the silhouette a flat colour; higher values light it as a
   * curved body so it reads as a material rather than as a shape.
   */
  gloss?: number;
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
          {/*
            One octave, not two.
            
            The second octave adds detail at twice the frequency, and with a
            displacement this large that detail is steep enough to fold the
            contour back on itself — it showed up as a hard notch part-way
            along the top edge, the one thing on the shape that did not look
            deliberate. A single octave keeps the field's gradient gentle
            enough that a big displacement still maps to a smooth boundary.
          */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency={wavinessFreq}
            numOctaves={1}
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
      {/*
        Volume, not just an outline.

        An irregular edge around a flat fill still reads as a sticker: the eye
        gets its cue about material from how a surface catches light, and a
        single colour catches none. Blurring the finished alpha gives a height
        field — high in the middle of the body, falling off at the rim — and
        lighting that field puts a soft sheen along the top and a darker belly
        below, which is what a blob of liquid actually looks like.

        `feDistantLight` rather than a point light on purpose: a point light
        needs coordinates in filter space, so it would have to be recomputed
        from the host's measured box on every resize and would drift out of
        place the moment a surface changed size. A direction is the same at
        every scale.
      */}
      {gloss > 0 ? (
        <>
          <feGaussianBlur in="shape" stdDeviation={2.5} result="gloss-bump" />
          <feSpecularLighting
            in="gloss-bump"
            surfaceScale={gloss}
            specularConstant={0.78}
            specularExponent={20}
            lightingColor="#ffffff"
            result="gloss-light"
          >
            {/*
              A low elevation is what makes this a liquid and not a donut.
              The interior of the body is flat — the blurred alpha has no
              gradient there — so a light overhead reflects off all of it at
              once and washes the fill out to near-white, leaving only a ring
              of colour at the rim. Dropped to a grazing angle, the flat middle
              reflects almost nothing and only the sloped shoulder catches the
              sheen, which is where a real wet surface carries it.
            */}
            <feDistantLight azimuth={235} elevation={22} />
          </feSpecularLighting>
          {/* Keep the sheen inside the body; a specular pass paints past it. */}
          <feComposite in="gloss-light" in2="shape" operator="in" result="gloss-clip" />
          <feComposite
            in="shape"
            in2="gloss-clip"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
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
