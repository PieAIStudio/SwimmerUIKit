import {
  createDropletGeometry,
  dropletPath,
  DROPLET_WOBBLE_MAX,
  type DropletGeometry,
} from './geometry';
import {
  advanceDropletSpring,
  createDropletSpring,
  pressedPose,
  restingPose,
  snapDropletSpring,
} from './spring';
import { observePress } from '../../liquid/LiquidPressSurface/observePress';

const numeric = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Imperative paint only. React owns DOM identity and all interaction semantics.
 * No per-frame measurements, timer, filter, global registry or idle animation. */
export function attachDroplet(
  svg: SVGSVGElement,
  target: HTMLElement,
  seed: number,
  motion: boolean,
  pressTarget: HTMLElement = target,
  maxWobble = DROPLET_WOBBLE_MAX,
): () => void {
  const path = svg.querySelector('path')!;
  const group = svg.querySelector('g')!;
  const spring = createDropletSpring(1.4);
  let geometry: DropletGeometry | undefined;
  let amplitude = 1.4,
    padding = 10,
    last = 0,
    frame: number | undefined;
  let active = false,
    disposed = false,
    fingerprint = '';
  const paint = () => {
    if (disposed || !geometry) return;
    const { x, y, phase, amplitude: wave } = spring.value;
    path.setAttribute('d', dropletPath(geometry, wave, phase, seed, padding));
    const cx = padding + geometry.width / 2,
      cy = padding + geometry.height / 2;
    group.setAttribute(
      'transform',
      `translate(${cx} ${cy}) scale(${x.toFixed(5)} ${y.toFixed(5)}) translate(${-cx} ${-cy})`,
    );
  };
  const cancelFrame = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
  const measure = () => {
    const style = getComputedStyle(target);
    const box = (dimension: 'width' | 'height') => {
      const sides = dimension === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'];
      const extra =
        style.boxSizing === 'border-box'
          ? 0
          : sides.reduce(
              (sum, side) =>
                sum +
                numeric(style.getPropertyValue(`padding-${side.toLowerCase()}`), 0) +
                numeric(style.getPropertyValue(`border-${side.toLowerCase()}-width`), 0),
              0,
            );
      return (
        numeric(
          style[dimension],
          dimension === 'width' ? target.offsetWidth : target.offsetHeight,
        ) + extra
      );
    };
    const width = box('width'),
      height = box('height');
    if (width <= 0 || height <= 0) return;
    const radius = numeric(
      style.getPropertyValue('--game-ui-droplet-radius'),
      Math.min(width, height) / 2,
    );
    const wave = Math.max(
      0,
      Math.min(
        DROPLET_WOBBLE_MAX,
        Number.isFinite(maxWobble) ? Math.max(0, maxWobble) : DROPLET_WOBBLE_MAX,
        numeric(style.getPropertyValue('--game-ui-droplet-wobble'), DROPLET_WOBBLE_MAX),
      ),
    );
    const next = `${width}|${height}|${radius}|${wave}`;
    if (next === fingerprint) return;
    fingerprint = next;
    amplitude = wave;
    geometry = createDropletGeometry(width, height, radius);
    padding = Math.ceil(width * 0.025 + wave * 3 + 6);
    svg.setAttribute('width', String(width + 2 * padding));
    svg.setAttribute('height', String(height + 2 * padding));
    svg.setAttribute('viewBox', `0 0 ${width + 2 * padding} ${height + 2 * padding}`);
    svg.style.left = `${-padding}px`;
    svg.style.top = `${-padding}px`;
    svg.style.width = `${width + padding * 2}px`;
    svg.style.height = `${height + padding * 2}px`;
    const targetPose = active && motion ? pressedPose(amplitude) : restingPose(amplitude);
    snapDropletSpring(spring, targetPose);
    svg.dataset.ready = 'true';
    paint();
  };
  const tick = (now: number) => {
    frame = undefined;
    if (disposed || !target.isConnected) return;
    if (document.hidden) {
      snapDropletSpring(spring, restingPose(amplitude));
      active = false;
      paint();
      return;
    }
    const moving = advanceDropletSpring(spring, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    paint();
    if (moving) frame = requestAnimationFrame(tick);
  };
  const pressed = (value: boolean) => {
    if (disposed) return;
    measure();
    active = value && motion;
    svg.dataset.pressed = String(active);
    spring.target = active ? pressedPose(amplitude) : restingPose(amplitude);
    if (!motion || document.hidden || pressTarget.matches(':disabled,[aria-disabled="true"]')) {
      cancelFrame();
      snapDropletSpring(spring, restingPose(amplitude));
      paint();
      return;
    }
    if (frame === undefined) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  measure();
  const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
  resize?.observe(target);
  const detach = motion ? observePress(pressTarget, pressed) : () => {};
  return () => {
    disposed = true;
    cancelFrame();
    detach();
    resize?.disconnect();
    delete svg.dataset.ready;
    delete svg.dataset.pressed;
  };
}
