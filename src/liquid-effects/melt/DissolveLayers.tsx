/**
 * Image-melt and contact-dissolve layers adapted from liquid-gooey by Jakub
 * Antalik.
 *
 * Source: https://github.com/Jakubantalik/Libraries/blob/3862ffa345217443b63696a8c331a0664eea4b04/packages/liquid-gooey/src/imageMelt.tsx
 * Pinned commit: 3862ffa345217443b63696a8c331a0664eea4b04
 * Copyright (c) 2026 Jakub Antalik. Licensed under the MIT License.
 * See NOTICE for the attribution and license text.
 *
 * SwimmerUIKit keeps this as a scoped image layer. The donor's general
 * observer is intentionally not included: this module owns only the pairwise
 * image-melt engine, contact-image dissolve, and their idle-sleeping clock.
 */

import { useId, type ReactNode } from 'react';
import { type DissolveRenderState } from './types';
import { safeId, round, flowTransform, erodeValues } from './geometry';

export function DissolveLayers({ visuals }: { visuals: DissolveRenderState[] }): ReactNode {
  const uid = `lgd-${safeId(useId())}`;
  return (
    <>
      {visuals.map((visual) => {
        const base = `${uid}-${safeId(visual.id)}`;
        const imagePattern = `${base}-pattern`;
        const maskId = `${base}-mask`;
        const neighborPattern = base + '-neighbor';
        const image = visual.image;
        const zoneTransform =
          visual.elongation > 1.001
            ? `translate(${round(visual.cx)} ${round(visual.cy)}) rotate(${round(visual.angle)}) scale(${round(visual.elongation, 3)} 1) rotate(${-round(visual.angle)}) translate(${round(-visual.cx)} ${round(-visual.cy)})`
            : undefined;
        const filterRegion =
          visual.d * visual.elongation +
          visual.options.blur * 2.5 +
          visual.options.warp +
          visual.options.gravity * 0.5 +
          8;
        const baseFrequency = Math.min(
          0.3,
          Math.max(0.01, visual.options.warpFreq / (visual.options.zone * 1.1)),
        );
        const flow = flowTransform(
          visual.cx,
          visual.cy,
          visual.gravityX,
          visual.gravityY,
          visual.d,
          visual.options.pull * visual.structure,
          visual.options.gravity * visual.structure,
          visual.elongation,
          visual.options.taper,
        );
        return (
          <g key={visual.id} data-liquid-gooey-dissolve="">
            <defs>
              <pattern
                id={imagePattern}
                patternUnits="userSpaceOnUse"
                x={image.x}
                y={image.y}
                width={image.w}
                height={image.h}
              >
                <image
                  href={visual.src}
                  width={image.w}
                  height={image.h}
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
              {visual.neighborSrc ? (
                <pattern
                  id={neighborPattern}
                  patternUnits="userSpaceOnUse"
                  x={image.x}
                  y={image.y}
                  width={image.w}
                  height={image.h}
                >
                  <image
                    href={visual.neighborSrc}
                    width={image.w}
                    height={image.h}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
              ) : null}
              <radialGradient id={`${base}-gradient`}>
                <stop offset="0%" stopColor="#fff" />
                <stop offset="55%" stopColor="#fff" />
                <stop offset="78%" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <circle
                  cx={visual.cx}
                  cy={visual.cy}
                  r={visual.d * visual.elongation}
                  fill={`url(#${base}-gradient)`}
                  transform={zoneTransform}
                />
              </mask>
              {visual.seamBlur > 0 ? (
                <filter
                  id={`${base}-seam`}
                  filterUnits="userSpaceOnUse"
                  x={visual.cx - filterRegion}
                  y={visual.cy - filterRegion}
                  width={filterRegion * 2}
                  height={filterRegion * 2}
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation={visual.seamBlur * visual.structure} />
                </filter>
              ) : null}
              {[0, 1, 2].map((index) => {
                const t = index / 2;
                const blur = visual.options.blur * (0.15 + 0.85 * t ** 1.4) * visual.structure;
                const warp = visual.options.warp * (0.45 + 0.55 * t) * visual.structure;
                const mix = visual.mix * visual.structure * (0.15 + 0.85 * t);
                const churn = visual.phase * (0.7 + 0.3 * t);
                const offsetX =
                  visual.gravityX * Math.sin(churn + t * 1.7) * 3 -
                  visual.gravityY * Math.cos(churn * 1.31 + t) * 1.5;
                const offsetY =
                  visual.gravityY * Math.cos(churn + t * 1.3) * 2 +
                  visual.gravityX * Math.sin(churn * 1.17 + t) * 1.1;
                return (
                  <filter
                    key={index}
                    id={`${base}-filter-${index}`}
                    filterUnits="userSpaceOnUse"
                    x={visual.cx - filterRegion}
                    y={visual.cy - filterRegion}
                    width={filterRegion * 2}
                    height={filterRegion * 2}
                    colorInterpolationFilters="sRGB"
                  >
                    <feTurbulence
                      type={visual.options.warpStyle}
                      baseFrequency={`${(baseFrequency * (index === 0 ? 0.35 : 1.6)).toFixed(4)} ${(baseFrequency * (index === 0 ? 1.6 : 0.35)).toFixed(4)}`}
                      numOctaves={visual.options.detail}
                      seed="17"
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale={warp}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      result="warped"
                    />
                    <feGaussianBlur in="warped" stdDeviation={blur} result="soft" />
                    <feColorMatrix in="soft" type="saturate" values="1.2" result="col" />
                    <feTurbulence
                      type={visual.options.warpStyle}
                      baseFrequency={baseFrequency.toFixed(4)}
                      numOctaves={visual.options.detail}
                      seed="19"
                      result="erosion-noise"
                    />
                    <feColorMatrix
                      in="erosion-noise"
                      type="matrix"
                      values={erodeValues(mix)}
                      result="erosion"
                    />
                    <feComposite in="col" in2="erosion" operator="in" />
                    <feOffset dx={offsetX} dy={offsetY} />
                  </filter>
                );
              })}
            </defs>
            {visual.seamBlur > 0 ? (
              <g mask={`url(#${maskId})`} opacity={visual.opacity * 0.55}>
                <g filter={`url(#${base}-seam)`}>
                  <rect
                    x={image.x}
                    y={image.y}
                    width={image.w}
                    height={image.h}
                    rx={image.r}
                    fill={`url(#${imagePattern})`}
                  />
                </g>
              </g>
            ) : null}
            {[0, 1, 2].map((index) => (
              <g key={index} mask={`url(#${maskId})`} opacity={visual.opacity}>
                <g filter={`url(#${base}-filter-${index})`}>
                  <g transform={flow}>
                    <rect
                      x={image.x}
                      y={image.y}
                      width={image.w}
                      height={image.h}
                      rx={image.r}
                      fill={`url(#${imagePattern})`}
                    />
                  </g>
                </g>
              </g>
            ))}
            {visual.neighborSrc && visual.mix > 0 ? (
              <g
                mask={'url(#' + maskId + ')'}
                opacity={visual.opacity * Math.min(0.55, visual.mix * 0.55)}
              >
                <g filter={'url(#' + base + '-filter-1)'}>
                  <rect
                    x={image.x}
                    y={image.y}
                    width={image.w}
                    height={image.h}
                    rx={image.r}
                    fill={'url(#' + neighborPattern + ')'}
                  />
                </g>
              </g>
            ) : null}
          </g>
        );
      })}
    </>
  );
}
