import { useLayoutEffect, useRef, type RefObject } from 'react';
import { blobPath } from './liquidGooeyGeometry';
import { presenceCurve, validPresenceRect } from './liquidPresenceGeometry';
import { liquidRevealShape } from './liquidRevealGeometry';
import { tryAcquireLiquidGooeyAnimation, releaseLiquidGooeyAnimation } from './liquidGooeyBudget';

/** A bounded browser-native timeline, not a task state machine. The initial
 * geometry must come from the positioned outlet, never its hidden (0,0) mount.
 * All path frames share the existing blob topology; no arbitrary SVG morphing. */
export function useLiquidRevealEntrance(
  root: RefObject<HTMLDivElement | null>,
  source: RefObject<HTMLElement | null> | undefined,
  key: string,
  width: number,
  height: number,
  reduced: boolean,
  material: boolean,
  input: boolean,
) {
  const last = useRef<string | null>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    if (!source || reduced || window.matchMedia('(forced-colors: active)').matches) {
      element.dataset.revealMotion = 'static';
      return;
    }
    if (last.current === key) return;
    element.dataset.revealMotion = 'preparing';
    if (!width || !height) return;
    let active = true,
      leased = false,
      started = false;
    let frame = 0,
      attempts = 0;
    const animations: Animation[] = [];
    const finish = () => {
      animations.forEach((animation) => animation.cancel());
      animations.length = 0;
      if (leased) releaseLiquidGooeyAnimation();
      leased = false;
      element.dataset.revealMotion = started ? 'settled' : 'static';
    };
    const start = () => {
      if (!active) return;
      // Floating UI mounts through a portal and computes asynchronously. Wait
      // for its visible positioned layer, with a finite static fallback.
      if (getComputedStyle(element).visibility === 'hidden') {
        if (++attempts < 12) {
          frame = requestAnimationFrame(start);
          return;
        }
        finish();
        return;
      }
      const origin = source.current?.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      const body = element.querySelector<SVGPathElement>('[data-reveal-body]');
      const ink = element.querySelector<SVGGElement>('[data-reveal-material]');
      const text = element.querySelector<HTMLElement>('.game-ui-liquid-reveal-content');
      last.current = key;
      if (
        !origin ||
        !validPresenceRect(origin) ||
        document.hidden ||
        typeof element.animate !== 'function' ||
        !tryAcquireLiquidGooeyAnimation((width + 24) * (height + 24))
      ) {
        finish();
        return;
      }
      leased = true;
      started = true;
      element.dataset.revealMotion = 'drawing';
      const sx = rect.width / width || 1,
        sy = rect.height / height || 1;
      const from = {
        x: (origin.x + origin.width / 2 - rect.x) / sx,
        y: (origin.y + origin.height / 2 - rect.y) / sy,
      };
      const landing = {
        x: Math.min(width - 28, Math.max(28, from.x)),
        y: from.y > height / 2 ? height - 28 : 28,
      };
      const viewport = {
        x: -rect.x / sx,
        y: -rect.y / sy,
        width: innerWidth / sx,
        height: innerHeight / sy,
      };
      const duration = 640;
      if (material && body && CSS.supports('d', 'path("M0 0L1 1Z")')) {
        const outline = liquidRevealShape(width, height, input).outline;
        const frames = Array.from({ length: 33 }, (_, i) => {
          const t = i / 32;
          const flight = Math.min(1, t / 0.38);
          const point = presenceCurve(from, landing, flight * flight * (3 - 2 * flight), viewport);
          const swell = Math.max(0, Math.min(1, (t - 0.33) / 0.55));
          const grow = 1 - (1 - swell) ** 3;
          const diameter = 10 + Math.min(1, t / 0.18) * 18;
          const w = diameter + (width - 12 - diameter) * grow;
          const h = diameter + (height - 12 - diameter) * grow;
          const x = point.x - diameter / 2 + (6 - point.x + diameter / 2) * grow;
          const y = point.y - diameter / 2 + (6 - point.y + diameter / 2) * grow;
          const radius = Math.min(w / 2, h / 2, 28);
          const path =
            grow >= 1
              ? outline
              : blobPath(x, y, w, h, [radius, radius, radius, radius], {
                  amplitude: 1.2 + (input ? 3.8 : 5.8) * grow,
                  seed: 17,
                  lobes: 3,
                  phase: 0,
                });
          return { d: `path("${path}")`, offset: t };
        });
        animations.push(body.animate(frames, { duration, fill: 'both', easing: 'linear' }));
        // The body becomes the surface. Its edge highlight appears only when
        // the material is nearly spread; it is not a second arriving panel.
        if (ink)
          animations.push(
            ink.animate([{ opacity: 0 }, { opacity: 0, offset: 0.88 }, { opacity: 1 }], {
              duration,
              fill: 'both',
            }),
          );
        if (text)
          animations.push(
            text.animate(
              [
                { opacity: 0 },
                { opacity: 0, offset: 0.7 },
                { opacity: 1, offset: 0.98 },
                { opacity: 1 },
              ],
              { duration, fill: 'both' },
            ),
          );
      } else {
        // Unsupported path interpolation or the retained dark style: do not
        // pretend an unimplemented morph exists. Use a short material fade.
        if (ink)
          animations.push(ink.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 180 }));
      }
      const visual = source.current?.querySelector<SVGSVGElement>('.game-ui-liquid-presence > svg');
      if (visual)
        animations.push(
          visual.animate([{ scale: '1' }, { scale: '.94', offset: 0.24 }, { scale: '1' }], {
            duration: 360,
            easing: 'ease-in-out',
          }),
        );
      void Promise.all(animations.map((a) => a.finished)).then(finish, finish);
    };
    // Cancellable frame avoids StrictMode's setup/cleanup consuming the one
    // real presentation before it can be painted.
    frame = requestAnimationFrame(start);
    const interrupt = () => {
      cancelAnimationFrame(frame);
      finish();
    };
    const hide = () => {
      if (document.hidden) interrupt();
    };
    // A user never has to wait for the flourish to type or use a control.
    element.addEventListener('focusin', interrupt);
    element.addEventListener('pointerdown', interrupt, true);
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('resize', interrupt);
    window.addEventListener('scroll', interrupt, true);
    return () => {
      active = false;
      interrupt();
      element.removeEventListener('focusin', interrupt);
      element.removeEventListener('pointerdown', interrupt, true);
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('resize', interrupt);
      window.removeEventListener('scroll', interrupt, true);
    };
  }, [root, source, key, width, height, reduced, material, input]);
}
