import { createDropletGeometry, dropletPath } from '../../controls/DropletSurface/geometry';
import { progressFrontPath } from './geometry';

/** Measures only at layout changes. Value changes spend at most 600ms of RAF;
 * static display, reduced motion and hidden pages retain no animation loop. */
export function attachProgress(
  svg: SVGSVGElement,
  seed: number,
  initialRatio: number,
  motion: boolean,
) {
  const track = svg.parentElement!;
  const outline = svg.querySelector<SVGPathElement>('[data-progress-track]')!;
  const clip = svg.querySelector<SVGPathElement>('[data-progress-clip]')!;
  const front = svg.querySelector<SVGPathElement>('[data-progress-front]')!;
  let width = 0,
    current = initialRatio,
    target = initialRatio,
    from = initialRatio;
  let frame: number | undefined,
    start = 0,
    disposed = false;
  const set = (element: SVGPathElement, d: string) => {
    if (element.getAttribute('d') !== d) element.setAttribute('d', d);
  };
  const paint = (wave = 0) => set(front, progressFrontPath(width || 100, current, wave));
  const cancel = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
  const settle = () => {
    cancel();
    current = target;
    paint();
    svg.dataset.progressMotion = 'static';
  };
  const measure = () => {
    const measured = Number.parseFloat(getComputedStyle(track).width) || track.clientWidth;
    if (!measured || measured === width) return;
    width = measured;
    svg.setAttribute('viewBox', `0 0 ${width + 8} 18`);
    const d = dropletPath(createDropletGeometry(width, 10, 5), 1, 0, seed, 4);
    set(outline, d);
    set(clip, d);
    svg.dataset.progressReady = 'true';
    // A value label or viewport may change width during the same transition.
    // Refit its geometry without cancelling the finite value animation.
    paint();
    if (frame === undefined) svg.dataset.progressMotion = 'static';
  };
  const tick = (now: number) => {
    frame = undefined;
    if (disposed) return;
    if (document.hidden || !svg.isConnected) {
      settle();
      return;
    }
    const t = Math.min(1, Math.max(0, (now - start) / 600));
    current = from + (target - from) * (1 - (1 - t) ** 3);
    paint(Math.sin(t * Math.PI * 6) * (1 - t) * 1.4 * Math.sign(target - from));
    if (t < 1) frame = requestAnimationFrame(tick);
    else settle();
  };
  const hide = () => {
    if (document.hidden) settle();
  };
  measure();
  const resize = new ResizeObserver(measure);
  resize.observe(track);
  document.addEventListener('visibilitychange', hide);
  return {
    update(ratio: number) {
      const next = Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 0;
      if (next === target) return;
      cancel();
      from = current;
      target = next;
      if (!motion || document.hidden) {
        settle();
        return;
      }
      svg.dataset.progressMotion = 'moving';
      start = performance.now();
      frame = requestAnimationFrame(tick);
    },
    dispose() {
      disposed = true;
      cancel();
      resize.disconnect();
      document.removeEventListener('visibilitychange', hide);
    },
  };
}
