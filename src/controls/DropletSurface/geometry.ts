/** A flat, closed contour. It never uses an SVG threshold/displacement filter.
 * Geometry is measured once; a press only changes the sampled wave and pose. */
export interface DropletPoint {
  x: number;
  y: number;
  nx: number;
  ny: number;
  u: number;
}

export interface DropletGeometry {
  width: number;
  height: number;
  frequency: number;
  points: readonly DropletPoint[];
}

const finite = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);
const rounded = (value: number) => Math.round(value * 1000) / 1000;

/** Owner's slight perimeter irregularity cap; row length never raises it. */
export const DROPLET_WOBBLE_MAX = 1.4;

export function dropletSeed(id: string): number {
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return ((hash >>> 0) / 4294967296) * Math.PI * 2;
}

/** Clockwise perimeter sampling, with the outward normal stored alongside it. */
export function createDropletGeometry(
  width: number,
  height: number,
  radius: number,
): DropletGeometry {
  const w = Math.max(1, finite(width, 1));
  const h = Math.max(1, finite(height, 1));
  const r = Math.max(0.5, Math.min(finite(radius, h / 2), w / 2, h / 2));
  const straightX = Math.max(0, w - 2 * r),
    straightY = Math.max(0, h - 2 * r);
  const quarter = (Math.PI * r) / 2;
  const lengths = [straightX, quarter, straightY, quarter, straightX, quarter, straightY, quarter];
  const perimeter = lengths.reduce((sum, length) => sum + length, 0);
  const count = Math.min(224, Math.max(48, Math.ceil(perimeter / 7)));
  const points: DropletPoint[] = [];
  for (let i = 0; i < count; i++) {
    const u = i / count;
    let distance = perimeter * u;
    let segment = 0;
    while (segment < 7 && distance >= lengths[segment]!) distance -= lengths[segment++]!;
    let x = 0,
      y = 0,
      nx = 0,
      ny = 0;
    if (segment === 0) {
      x = r + distance;
      y = 0;
      ny = -1;
    } else if (segment === 2) {
      x = w;
      y = r + distance;
      nx = 1;
    } else if (segment === 4) {
      x = w - r - distance;
      y = h;
      ny = 1;
    } else if (segment === 6) {
      x = 0;
      y = h - r - distance;
      nx = -1;
    } else {
      const angle = ((segment - 3) * Math.PI) / 4 + distance / r;
      const cx = segment < 4 ? w - r : r;
      const cy = segment === 1 || segment === 7 ? r : h - r;
      nx = Math.cos(angle);
      ny = Math.sin(angle);
      x = cx + r * nx;
      y = cy + r * ny;
    }
    points.push({ x, y, nx, ny, u });
  }
  return { width: w, height: h, frequency: Math.max(2, Math.round(perimeter / 110)), points };
}

/** Integer-frequency waves join without a seam; Catmull–Rom gives C1-continuous
 * cubic segments. The SVG renderer anti-aliases the actual path at the host DPR. */
export function dropletPath(
  geometry: DropletGeometry,
  amplitude: number,
  phase = 0,
  seed = 0,
  padding = 0,
): string {
  const amount = Math.max(
    0,
    Math.min(
      DROPLET_WOBBLE_MAX,
      finite(amplitude, 0),
      Math.min(geometry.width, geometry.height) * 0.1,
    ),
  );
  const shift = finite(phase, 0),
    origin = finite(seed, 0),
    pad = finite(padding, 0);
  const points = geometry.points.map((point) => {
    const angle = Math.PI * 2 * point.u;
    const wave =
      amount *
      (0.67 * Math.sin(angle * geometry.frequency + origin + shift) +
        0.33 * Math.sin(angle * (geometry.frequency + 1) - origin * 0.7 - shift * 0.55));
    return { x: point.x + point.nx * wave + pad, y: point.y + point.ny * wave + pad };
  });
  const at = (index: number) => points[(index + points.length) % points.length]!;
  const first = at(0);
  let result = `M${rounded(first.x)} ${rounded(first.y)}`;
  for (let i = 0; i < points.length; i++) {
    const a = at(i - 1),
      b = at(i),
      c = at(i + 1),
      d = at(i + 2);
    result += `C${rounded(b.x + (c.x - a.x) / 6)} ${rounded(b.y + (c.y - a.y) / 6)} ${rounded(c.x - (d.x - b.x) / 6)} ${rounded(c.y - (d.y - b.y) / 6)} ${rounded(c.x)} ${rounded(c.y)}`;
  }
  return `${result}Z`;
}
