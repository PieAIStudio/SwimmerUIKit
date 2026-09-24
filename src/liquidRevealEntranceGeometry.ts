import { blobPath } from './liquidGooeyGeometry';
import { presenceCurve, type LiquidPresenceRect } from './liquidPresenceGeometry';
import { liquidRevealShape } from './liquidRevealGeometry';

export const LIQUID_REVEAL_DURATION = 720;
const ease = (value: number) => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * t * (10 + t * (-15 + 6 * t));
};

/** One sampled material timeline. Flight has a stretched neck, then the drop
 * gathers, opens sideways and gently settles. Native content never scales.
 * All shapes share blobPath topology; this is not an arbitrary SVG interpolator. */
export function liquidRevealEntranceFrames(
  width: number,
  height: number,
  input: boolean,
  from: { x: number; y: number },
  landing: { x: number; y: number },
  viewport: LiquidPresenceRect,
  intensity = 1,
) {
  const final = liquidRevealShape(width, height, input, 0, intensity).outline;
  return Array.from({ length: 49 }, (_, i) => {
    const t = i / 48;
    const flight = ease((t - 0.08) / 0.34);
    const point = presenceCurve(from, landing, flight, viewport);
    const unfoldX = ease((t - 0.39) / 0.46);
    const unfoldY = ease((t - 0.47) / 0.46);
    const gather = ease((t - 0.3) / 0.14) * (1 - unfoldX);
    const diameter = 8 + 20 * ease(t / 0.15) + 10 * gather;
    const stretch = 1 + Math.sin(flight * Math.PI) * 0.35;
    const dx = landing.x - from.x,
      dy = landing.y - from.y;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const dw = diameter * (horizontal ? stretch : 1 / Math.sqrt(stretch));
    const dh = diameter * (horizontal ? 1 / Math.sqrt(stretch) : stretch);
    const w = dw + (width - 12 - dw) * unfoldX;
    const h = dh + (height - 12 - dh) * unfoldY;
    const x = (point.x - dw / 2) * (1 - unfoldX) + 6 * unfoldX;
    const y = (point.y - dh / 2) * (1 - unfoldY) + 6 * unfoldY;
    const radius = Math.min(w / 2, h / 2, 28 + 12 * (1 - unfoldY));
    const path =
      t >= 0.95
        ? final
        : blobPath(x, y, w, h, [radius, radius, radius, radius], {
            amplitude: 1.2 + ((input ? 8 : 11) * intensity - 1.2) * unfoldY,
            seed: 17,
            lobes: 3,
            phase: 0,
          });
    return { d: `path("${path}")`, offset: t };
  });
}
