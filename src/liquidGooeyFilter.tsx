import type { ReactElement } from 'react';

import type { ShadowLayer, StrokeLayer } from './liquidGooeyShadow';

const BINARIZE = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -29.5';

function InsetPass({ index, shadow }: { index: number; shadow: ShadowLayer }): ReactElement {
  const parts: ReactElement[] = [];
  let source = 'bin';
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
    <feComposite key="band" in="bin" in2={source} operator="out" result={`shadow-${index}-band`} />,
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
}: {
  blur: number;
  contrast: number;
  shadows: ShadowLayer[];
  stroke: StrokeLayer | null;
}): ReactElement {
  const intercept = Math.round((0.5 - contrast * (5 / 12)) * 100) / 100;
  return (
    <>
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${intercept}`}
        result="goo"
      />
      <feComposite in="SourceGraphic" in2="goo" operator="atop" result="shape" />
      {stroke !== null || shadows.some((shadow) => shadow.inset || shadow.spread !== 0) ? (
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
