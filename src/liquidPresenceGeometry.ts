import { blobPath } from './liquidGooeyGeometry';

/** Geometry only. These rectangles come from the host, never from a model. */
export interface LiquidPresenceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface LiquidPoint {
  x: number;
  y: number;
}

export const LIQUID_PRESENCE_VIEW = 160;
export const LIQUID_PRESENCE_RADIUS = 66;
export const LIQUID_PRESENCE_PAD = 80;
export const LIQUID_PRESENCE_BEAD = 16;
export const LIQUID_PRESENCE_RELEASE = 112;

export function clampPresence(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;
}

export function validPresenceRect(value: LiquidPresenceRect | null): value is LiquidPresenceRect {
  return Boolean(
    value &&
    [value.x, value.y, value.width, value.height].every(Number.isFinite) &&
    value.width > 0 &&
    value.height > 0,
  );
}

export function visiblePresenceRect(
  rect: LiquidPresenceRect,
  viewport: LiquidPresenceRect,
): boolean {
  return (
    validPresenceRect(rect) &&
    rect.x + rect.width > viewport.x &&
    rect.y + rect.height > viewport.y &&
    rect.x < viewport.x + viewport.width &&
    rect.y < viewport.y + viewport.height
  );
}

export function rectCenter(rect: LiquidPresenceRect): LiquidPoint {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export function direction(from: LiquidPoint, to: LiquidPoint): LiquidPoint {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
}

export function clipPresenceRect(
  rect: LiquidPresenceRect,
  viewport: LiquidPresenceRect,
): LiquidPresenceRect {
  const x = Math.max(rect.x, viewport.x);
  const y = Math.max(rect.y, viewport.y);
  return {
    x,
    y,
    width: Math.max(0, Math.min(rect.x + rect.width, viewport.x + viewport.width) - x),
    height: Math.max(0, Math.min(rect.y + rect.height, viewport.y + viewport.height) - y),
  };
}

/** Stay beside the target, not on its text or hit area. */
export function presenceLanding(rect: LiquidPresenceRect, viewport: LiquidPresenceRect) {
  const below = rect.y + rect.height + 88 < viewport.y + viewport.height;
  const side = below ? 'bottom' : 'top';
  const left = Math.max(viewport.x + 18, rect.x);
  const right = Math.min(viewport.x + viewport.width - 18, rect.x + rect.width);
  const width = clampPresence(Math.max(0, right - left) * 0.58, 36, 84);
  return {
    x: clampPresence(
      (left + right) / 2,
      viewport.x + width / 2 + 8,
      viewport.x + viewport.width - width / 2 - 8,
    ),
    // An editor can span beyond BOTH viewport edges. Keep the cue in the
    // visible portion rather than landing above an offscreen first line.
    y: clampPresence(
      below ? rect.y + rect.height + 10 : rect.y - 10,
      viewport.y + 18,
      viewport.y + viewport.height - 18,
    ),
    side,
    width,
  } as const;
}

/** A single C1 curve, with a bounded bend inside the visible viewport. */
export function presenceCurve(
  from: LiquidPoint,
  to: LiquidPoint,
  progress: number,
  viewport: LiquidPresenceRect,
) {
  const t = clampPresence(progress, 0, 1);
  const normal = direction(from, to);
  const bend = Math.min(86, Math.hypot(to.x - from.x, to.y - from.y) * 0.2);
  const control = {
    x: clampPresence(
      (from.x + to.x) / 2 + normal.y * bend,
      viewport.x + 16,
      viewport.x + viewport.width - 16,
    ),
    y: clampPresence(
      (from.y + to.y) / 2 - normal.x * bend,
      viewport.y + 16,
      viewport.y + viewport.height - 16,
    ),
  };
  const dx = 2 * (1 - t) * (control.x - from.x) + 2 * t * (to.x - control.x);
  const dy = 2 * (1 - t) * (control.y - from.y) + 2 * t * (to.y - control.y);
  return {
    x: (1 - t) ** 2 * from.x + 2 * (1 - t) * t * control.x + t ** 2 * to.x,
    y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * control.y + t ** 2 * to.y,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
}

/** Uses the same smooth outline geometry as the brand's liquid controls. */
export function presenceBody(
  phase = 0,
  energy = 0,
  separated = 0,
  intensity = 1,
  living = 0,
): string {
  // Approximate area conservation; the core never vanishes with its guide bead.
  const life = clampPresence(living, 0, 1);
  const radius =
    LIQUID_PRESENCE_RADIUS * Math.sqrt(1 - 0.075 * clampPresence(separated, 0, 1)) - life * 2.4;
  return blobPath(
    80 - radius,
    80 - radius,
    radius * 2,
    radius * 2,
    [radius, radius, radius, radius],
    {
      amplitude:
        (3.5 + life * 9 + clampPresence(energy, 0, 1) * 9) * clampPresence(intensity, 0.15, 1.25),
      lobes: 3,
      seed: 17,
      phase,
    },
  );
}

export function presenceSeat(width: number, progress: number, diameter = 20): string {
  const t = clampPresence(progress, 0, 1);
  const d = clampPresence(diameter, 6, 48);
  const w = d + (width - d) * t;
  const h = d + (8 - d) * t;
  return blobPath(-w / 2, -h / 2, w, h, [h / 2, h / 2, h / 2, h / 2], {
    amplitude: 2.2,
    phase: t * Math.PI,
    seed: 17,
    lobes: 3,
  });
}
