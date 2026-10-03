import { useId, useLayoutEffect, useRef, type RefObject } from 'react';
import { useSystemReducedMotion } from '../../tokens/reducedMotion';
import { attachDroplet } from './controller';
import { dropletSeed } from './geometry';

/** One internal paint primitive for every flat control. Not an interactive
 * wrapper: it decorates the same native parent that owns focus and value. */
export function DropletSurface({
  static: isStatic = false,
  pressTarget,
  maxWobble = 1.4,
}: {
  static?: boolean;
  pressTarget?: RefObject<HTMLElement | null>;
  /** Internal static display cap; never raises the brand's 1.4px maximum. */
  maxWobble?: number;
}) {
  const id = useId();
  const svg = useRef<SVGSVGElement>(null);
  const reduced = useSystemReducedMotion();
  useLayoutEffect(() => {
    const element = svg.current,
      parent = element?.parentElement;
    if (!element || !(parent instanceof HTMLElement)) return;
    let disposed = false;
    let disconnect: (() => void) | undefined;
    const connect = () => {
      if (disposed) return;
      disconnect = attachDroplet(
        element,
        parent,
        dropletSeed(id),
        !reduced && !isStatic,
        pressTarget?.current ?? parent,
        maxWobble,
      );
    };
    // A row's native selection button is a later sibling of its decoration.
    // Its ref is attached after this child's layout effect. Wait only until
    // the current React commit ends; never bind the row's side actions instead.
    if (pressTarget) queueMicrotask(connect);
    else connect();
    return () => {
      disposed = true;
      disconnect?.();
    };
  }, [id, reduced, isStatic, pressTarget, maxWobble]);
  return (
    <svg ref={svg} className="game-ui-droplet" aria-hidden="true" focusable="false">
      <g>
        <path vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/** A reserved inline cell, so selection never changes a row's width. */
export function SelectionMark() {
  return (
    <span className="game-ui-selection-mark" aria-hidden="true">
      ✓
    </span>
  );
}
