export type CornerRadii = [number, number, number, number];

export interface BlobBox {
  x: number;
  y: number;
  w: number;
  h: number;
  r: CornerRadii;
}

/** Read an element's layout position without including its own transform. */
export function offsetTo(el: HTMLElement, ancestor: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor && ancestor.contains(node)) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

export function measureRadius(el: Element, w: number, h: number): CornerRadii {
  const cs = getComputedStyle(el);
  const parse = (value: string): number => {
    const first = value.split(' ')[0] ?? '';
    if (first.endsWith('%')) return ((parseFloat(first) || 0) / 100) * Math.min(w, h);
    return parseFloat(first) || 0;
  };
  return [
    parse(cs.borderTopLeftRadius),
    parse(cs.borderTopRightRadius),
    parse(cs.borderBottomRightRadius),
    parse(cs.borderBottomLeftRadius),
  ];
}

export function normalizeRadius(radius: number | CornerRadii): CornerRadii {
  return typeof radius === 'number' ? [radius, radius, radius, radius] : radius;
}

/** Rounded-rectangle path with CSS-style overlap clamping. */
export function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii,
): string {
  let [tl, tr, br, bl] = radii.map((value) => Math.max(0, value)) as CornerRadii;
  const factor = Math.min(
    1,
    w / Math.max(1e-6, tl + tr),
    w / Math.max(1e-6, bl + br),
    h / Math.max(1e-6, tl + bl),
    h / Math.max(1e-6, tr + br),
  );
  tl *= factor;
  tr *= factor;
  br *= factor;
  bl *= factor;
  return (
    `M ${x + tl} ${y} ` +
    `H ${x + w - tr} A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr} ` +
    `V ${y + h - br} A ${br} ${br} 0 0 1 ${x + w - br} ${y + h} ` +
    `H ${x + bl} A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl} ` +
    `V ${y + tl} A ${tl} ${tl} 0 0 1 ${x + tl} ${y} Z`
  );
}

/*
 * An organic silhouette, drawn as geometry rather than pushed around by a
 * filter.
 *
 * `waviness` cannot produce this shape, and the reason is worth writing down
 * because two rounds of tuning were spent believing it could. Chrome resamples
 * `feDisplacementMap` with nearest-neighbour, so the displaced contour can only
 * land on whole pixels. At a high noise frequency that is per-pixel jitter —
 * the frayed edge the effect was first blamed for — and at a low one the whole
 * side steps over by exactly one pixel at some arbitrary point, which is the
 * 「notch」 that kept reappearing. Measured on a straight top edge at device
 * ratio 1, the settings that shipped moved the outline a constant 1.5px and
 * varied it by 0.01px: the silhouette was a plain rounded rectangle the entire
 * time, which is exactly what it was reported to look like.
 *
 * Path data has no sampling grid. It is exact at every device ratio and zoom,
 * it costs one string instead of two full-region filter passes, and it can be
 * as bold as a design wants without ever tearing.
 *
 * The deviation is outward-only by construction, which gives the surface a
 * property worth relying on: the silhouette always contains the control's own
 * box. No label is ever crowded by its own background, at any amplitude.
 */

/** Blob sample count. Enough for a smooth spline, few enough to build hot. */
const BLOB_SAMPLES = 44;

/** Deterministic [0,1) from an integer, so a seed always picks one shape. */
function blobRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

interface OutlinePoint {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

/**
 * Walk a rounded rectangle's outline by normalised perimeter position,
 * returning the point and its outward normal.
 *
 * Parametrising by perimeter rather than by angle is what keeps one amplitude
 * looking the same on a wide pill and on a square: the lobes are spaced along
 * the edge the eye actually follows.
 */
function outlineAt(w: number, h: number, r: number, t: number): OutlinePoint {
  const flatX = Math.max(0, w - 2 * r);
  const flatY = Math.max(0, h - 2 * r);
  const arc = (Math.PI / 2) * r;
  const segments = [flatX, arc, flatY, arc, flatX, arc, flatY, arc];
  const total = segments.reduce((sum, value) => sum + value, 0) || 1;
  let distance = t * total;
  let index = 0;
  while (index < segments.length - 1 && distance > segments[index]!) {
    distance -= segments[index]!;
    index += 1;
  }
  const segment = segments[index]!;
  const u = segment === 0 ? 0 : distance / segment;
  const corner = (base: number, cx: number, cy: number): OutlinePoint => {
    const angle = base + u * (Math.PI / 2);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      nx: Math.cos(angle),
      ny: Math.sin(angle),
    };
  };
  switch (index) {
    case 0:
      return { x: r + u * flatX, y: 0, nx: 0, ny: -1 };
    case 1:
      return corner(-Math.PI / 2, w - r, r);
    case 2:
      return { x: w, y: r + u * flatY, nx: 1, ny: 0 };
    case 3:
      return corner(0, w - r, h - r);
    case 4:
      return { x: w - r - u * flatX, y: h, nx: 0, ny: 1 };
    case 5:
      return corner(Math.PI / 2, r, h - r);
    case 6:
      return { x: 0, y: h - r - u * flatY, nx: -1, ny: 0 };
    default:
      return corner(Math.PI, r, r);
  }
}

export interface BlobShape {
  /** Outward bulge, in px. 0 gives the plain rounded rectangle. */
  readonly amplitude: number;
  /** Which shape. Same seed, same silhouette, every render. */
  readonly seed?: number;
  /** How many swells go round the outline. 2 is lazy, 5 is busy. */
  readonly lobes?: number;
  /** Rotates the swells around the outline; the knob a press animates. */
  readonly phase?: number;
}

/**
 * The share of a box's shorter side that a poured outline may swell by.
 *
 * Exported because it is the reason one `blob` value can be handed to a 44px
 * button and a 14px meter at all, which makes it a fact the documentation and
 * the form shelf have to be able to state — and a number stated in three
 * places is a number that drifts in two of them.
 */
export const LIQUID_BLOB_MAX_FRACTION = 0.18;

/**
 * A rounded rectangle whose edge swells outward like a poured body.
 *
 * Amplitude is clamped to a share of the shorter side so one value can be
 * handed to a 44px button and a 14px meter without the meter dissolving.
 */
export function blobPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii,
  shape: BlobShape,
): string {
  const short = Math.min(w, h);
  const amplitude = Math.min(Math.max(0, shape.amplitude), short * LIQUID_BLOB_MAX_FRACTION);
  if (amplitude < 0.15 || short <= 0) return roundedRectPath(x, y, w, h, radii);
  const radius = Math.min(Math.max(...radii, 0), short / 2);
  const seed = shape.seed ?? 7;
  const lobes = Math.max(2, Math.round(shape.lobes ?? 3));
  const phase = shape.phase ?? 0;
  const harmonics: { k: number; a: number; p: number }[] = [];
  for (let index = 0; index < lobes; index += 1)
    harmonics.push({
      k: index + 2,
      a: blobRandom(seed * 31 + index) * 0.6 + 0.4,
      p: blobRandom(seed * 57 + index) * Math.PI * 2,
    });
  const weight = harmonics.reduce((sum, value) => sum + value.a, 0) || 1;
  const points: [number, number][] = [];
  for (let index = 0; index < BLOB_SAMPLES; index += 1) {
    const t = index / BLOB_SAMPLES;
    const point = outlineAt(w, h, radius, t);
    let wave = 0;
    for (const { k, a, p } of harmonics) wave += a * Math.sin(2 * Math.PI * k * t + p + phase);
    const offset = ((wave / weight + 1) / 2) * amplitude;
    points.push([x + point.x + point.nx * offset, y + point.y + point.ny * offset]);
  }
  const count = points.length;
  const at = (index: number): [number, number] => points[((index % count) + count) % count]!;
  const round = (value: number): string => (Math.round(value * 100) / 100).toString();
  let d = `M ${round(at(0)[0])} ${round(at(0)[1])}`;
  // Closed Catmull-Rom converted to cubics: C1 everywhere, so no sample ever
  // shows up as a crease no matter how far the outline has been pushed.
  for (let index = 0; index < count; index += 1) {
    const p0 = at(index - 1);
    const p1 = at(index);
    const p2 = at(index + 1);
    const p3 = at(index + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return `${d} Z`;
}

/** The rounded rectangle, or its poured version when a shape is asked for. */
export function silhouettePath(
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii,
  shape?: BlobShape | undefined,
): string {
  if (!shape || shape.amplitude <= 0) return roundedRectPath(x, y, w, h, radii);
  return blobPath(x, y, w, h, radii, shape);
}
