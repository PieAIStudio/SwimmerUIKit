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

import { useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { type ImageMeltRegistry } from './registry';
import { type ImageMeltRenderState, EMPTY_RENDER_STATE } from './types';
import { ImageMeltRuntime } from './runtime';
import { MeltPair } from './MeltPair';
import { DissolveLayers } from './DissolveLayers';

export function ImageMeltLayer({
  registry,
  getGroup,
}: {
  registry: ImageMeltRegistry;
  getGroup: () => HTMLElement | null;
}): ReactNode {
  const [state, setState] = useState<ImageMeltRenderState>(EMPTY_RENDER_STATE);
  useLayoutEffect(() => {
    const runtime = new ImageMeltRuntime({ registry, getGroup, onState: setState });
    const unsubscribe = registry.subscribe(runtime.invalidate);
    runtime.invalidate();
    return () => {
      unsubscribe();
      runtime.dispose();
    };
    // The group ref is stable; registry identity is the lifecycle boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry]);

  if (!state.melt && state.dissolves.length === 0) return null;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-liquid-gooey-image-melt=""
      width={state.width}
      height={state.height}
      viewBox={`0 0 ${state.width} ${state.height}`}
      style={
        {
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflow: 'visible',
          pointerEvents: 'none',
        } satisfies CSSProperties
      }
    >
      {state.melt ? <MeltPair {...state.melt} width={state.width} height={state.height} /> : null}
      {state.dissolves.length > 0 ? <DissolveLayers visuals={state.dissolves} /> : null}
    </svg>
  );
}
