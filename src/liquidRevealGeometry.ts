import { blobPath, roundedRectPath } from './liquidGooeyGeometry';

/** The SAME closed C1 silhouette as the body. A fixed inner shore makes local
 * swells read as liquid thickness, not four synchronized bending rules.
 * Text, the backing and native hit boxes do not use either path. */
export function liquidRevealShape(
  width: number,
  height: number,
  input: boolean,
  phase = 0,
  intensity = 1,
) {
  const w = Math.max(44, width),
    h = Math.max(44, height);
  const r = Math.min(28, (w - 12) / 2, (h - 12) / 2);
  const outline = blobPath(6, 6, w - 12, h - 12, [r, r, r, r], {
    amplitude:
      (input ? 8 : 11) * Math.min(1.25, Math.max(0.25, Number.isFinite(intensity) ? intensity : 1)),
    lobes: 3,
    seed: 17,
    phase,
  });
  const innerRadius = Math.max(0, r - 2.5);
  const inner = roundedRectPath(8.5, 8.5, w - 17, h - 17, [
    innerRadius,
    innerRadius,
    innerRadius,
    innerRadius,
  ]);
  return { outline, ribbon: `${outline} ${inner}` };
}
