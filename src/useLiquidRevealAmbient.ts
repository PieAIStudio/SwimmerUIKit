import { useEffect, useRef, type RefObject } from 'react';
import { requestLiquidAmbient } from './liquidAmbientClock';
import { liquidRevealShape } from './liquidRevealGeometry';
import {
  getLiquidGooeyBudget,
  tryAcquireLiquidGooeyAnimation,
  releaseLiquidGooeyAnimation,
} from './liquidGooeyBudget';

/** Optional ten-second material flow. Yields to real actions and sleeps offscreen.
 * The clock/budget are shared with the body; there is no React update per frame. */
export function useLiquidRevealAmbient(
  root: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  width: number,
  height: number,
  input: boolean,
) {
  const phase = useRef(0);
  useEffect(() => {
    const element = root.current;
    if (!element || !enabled || !width || !height) {
      if (element) element.dataset.revealAmbient = 'static';
      return;
    }
    let active = true;
    let visible = true;
    let last = performance.now();
    let cancel = () => {};
    const path = element.querySelector<SVGPathElement>('[data-reveal-outline]');
    const ribbon = element.querySelector<SVGPathElement>('[data-reveal-ribbon]');
    const area = (width + 24) * (height + 24);
    const paint = (now: number) => {
      if (!active || !visible || document.hidden) return;
      const elapsed = Math.min(160, Math.max(0, now - last));
      last = now;
      const modal = document.querySelector('dialog:modal');
      const blocked =
        (modal && !modal.contains(element)) || element.dataset.revealMotion === 'drawing';
      const budget = getLiquidGooeyBudget();
      if (blocked || budget.activeGroups > 0 || !tryAcquireLiquidGooeyAnimation(area)) {
        element.dataset.revealAmbient = 'paused';
        cancel = requestLiquidAmbient(paint, 250);
        return;
      }
      try {
        phase.current += (elapsed * Math.PI * 2) / 10000;
        const shape = liquidRevealShape(width, height, input, phase.current);
        path?.setAttribute('d', shape.outline);
        ribbon?.setAttribute('d', shape.ribbon);
        element.dataset.revealAmbient = 'flowing';
      } finally {
        releaseLiquidGooeyAnimation();
      }
      cancel = requestLiquidAmbient(paint);
    };
    const wake = () => {
      cancel();
      last = performance.now();
      element.dataset.revealAmbient = 'paused';
      if (visible && !document.hidden) cancel = requestLiquidAmbient(paint);
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            visible = entries[0]?.isIntersecting ?? false;
            wake();
          });
    observer?.observe(element);
    document.addEventListener('visibilitychange', wake);
    wake();
    return () => {
      active = false;
      cancel();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', wake);
      element.dataset.revealAmbient = 'static';
    };
  }, [root, enabled, width, height, input]);
  // React must render the retained phase too: resize/pause must not replace the
  // imperatively painted shape with phase zero for a visible frame.
  return phase;
}
