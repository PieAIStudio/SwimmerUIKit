import { easingFunction } from './liquidGooeySpring';
import {
  clampPresence,
  direction,
  presenceCurve,
  rectCenter,
  LIQUID_PRESENCE_BEAD,
  LIQUID_PRESENCE_RELEASE,
  type LiquidPoint,
  type LiquidPresenceRect,
} from './liquidPresenceGeometry';

const ease = easingFunction('cubic-bezier(0.45, 0, 0.2, 1)');
export interface LiquidPresenceFrame {
  phase: 'split' | 'flight' | 'land' | 'dock' | 'gather' | 'return' | 'merge' | 'still';
  point: LiquidPoint;
  angle: number;
  diameter: number;
  stretch: number;
  separation: number;
  bud: { x: number; y: number; radius: number } | null;
  seat: number | null;
  /** Retained through gather, even if the next target has a different width. */
  seatWidth?: number;
}

/** Pure, seekable choreography. Animation frames cannot call an application
 * action. Tests can sample every handoff without timers or a media provider. */
export function samplePresenceMotion(options: {
  elapsed: number;
  source: LiquidPresenceRect;
  destination: LiquidPoint;
  viewport: LiquidPresenceRect;
  returning?: boolean;
  from?: LiquidPoint;
  /** The last actually painted shape, not a reconstruction of a finished trip. */
  origin?: LiquidPresenceFrame;
}): LiquidPresenceFrame {
  const { source, destination, viewport, returning = false, from, origin } = options;
  const gatherMs = origin?.seat != null ? 180 : 0;
  if (gatherMs && options.elapsed < gatherMs)
    return {
      ...origin!,
      phase: 'gather',
      seat: origin!.seat! * (1 - ease(clampPresence(options.elapsed / gatherMs, 0, 1))),
    };
  const elapsed = Math.max(0, options.elapsed - gatherMs);
  const center = rectCenter(source);
  const heading = direction(center, destination);
  const angle = (Math.atan2(heading.y, heading.x) * 180) / Math.PI;
  const scale = source.width / 160;
  const release = {
    x: center.x + heading.x * LIQUID_PRESENCE_RELEASE * scale,
    y: center.y + heading.y * LIQUID_PRESENCE_RELEASE * scale,
  };
  const frame: LiquidPresenceFrame = {
    phase: 'still',
    point: center,
    angle,
    diameter: LIQUID_PRESENCE_BEAD * scale * 2,
    stretch: 1,
    separation: 0,
    bud: null,
    seat: null,
  };
  if (returning) {
    // A cancelled neck is still attached. Retract that exact neck locally;
    // spawning a fully detached bead first would visibly teleport it outward.
    if (origin?.bud) {
      const t = ease(clampPresence(elapsed / 320, 0, 1));
      const x = origin.bud.x + (80 - origin.bud.x) * t;
      const y = origin.bud.y + (80 - origin.bud.y) * t;
      return {
        ...frame,
        phase: t < 1 ? 'merge' : 'still',
        separation: origin.separation * (1 - t),
        point: { x: center.x + (x - 80) * scale, y: center.y + (y - 80) * scale },
        bud: t < 1 ? { x, y, radius: origin.bud.radius * (1 - t) } : null,
      };
    }
    const t = clampPresence(elapsed / 620, 0, 1);
    if (t < 1) {
      const path = presenceCurve(from ?? destination, release, ease(t), viewport);
      return {
        ...frame,
        phase: 'return',
        separation: 1,
        angle: path.angle,
        point: path,
        stretch: 1 + 0.3 * Math.sin(t * Math.PI),
      };
    }
    const merge = clampPresence((elapsed - 620) / 420, 0, 1);
    const distance = LIQUID_PRESENCE_RELEASE - 78 * ease(merge);
    return {
      ...frame,
      phase: merge < 1 ? 'merge' : 'still',
      separation: 1 - ease(merge),
      point: {
        x: center.x + heading.x * distance * scale,
        y: center.y + heading.y * distance * scale,
      },
      bud:
        merge < 1
          ? {
              x: 80 + heading.x * distance,
              y: 80 + heading.y * distance,
              radius: LIQUID_PRESENCE_BEAD * (1 - 0.65 * ease(merge)),
            }
          : null,
    };
  }
  const priorBud = origin?.phase === 'split' ? origin.bud : null;
  const initialSeparation = priorBud ? origin!.separation : 0;
  const splitMs = priorBud ? Math.max(180, 460 * (1 - initialSeparation)) : from ? 0 : 460;
  if (elapsed < splitMs) {
    const t = ease(elapsed / splitMs);
    const distance = 42 + (LIQUID_PRESENCE_RELEASE - 42) * t;
    const x = priorBud
      ? priorBud.x + (80 + heading.x * LIQUID_PRESENCE_RELEASE - priorBud.x) * t
      : 80 + heading.x * distance;
    const y = priorBud
      ? priorBud.y + (80 + heading.y * LIQUID_PRESENCE_RELEASE - priorBud.y) * t
      : 80 + heading.y * distance;
    const initialRadius = priorBud?.radius ?? LIQUID_PRESENCE_BEAD * 0.55;
    return {
      ...frame,
      phase: 'split',
      separation: initialSeparation + (1 - initialSeparation) * t,
      point: {
        x: center.x + (x - 80) * scale,
        y: center.y + (y - 80) * scale,
      },
      bud: {
        x,
        y,
        radius: initialRadius + (LIQUID_PRESENCE_BEAD - initialRadius) * t,
      },
    };
  }
  const start = from ?? release;
  const flightMs =
    560 + Math.min(260, Math.hypot(destination.x - start.x, destination.y - start.y) * 0.26);
  const t = clampPresence((elapsed - splitMs) / flightMs, 0, 1);
  if (t < 1) {
    const p = presenceCurve(start, destination, ease(t), viewport);
    return {
      ...frame,
      phase: 'flight',
      separation: 1,
      point: p,
      angle: p.angle,
      stretch: 1 + 0.35 * Math.sin(t * Math.PI),
    };
  }
  const land = clampPresence((elapsed - splitMs - flightMs) / 380, 0, 1);
  return {
    ...frame,
    phase: land < 1 ? 'land' : 'dock',
    separation: 1,
    point: destination,
    seat: ease(land),
  };
}
