/**
 * Morph shape physics adapted from `liquid-gooey` by Jakub Antalik.
 *
 * Source: https://github.com/Jakubantalik/Libraries/tree/main/packages/liquid-gooey
 * Pinned commit: 3862ffa345217443b63696a8c331a0664eea4b04
 * Copyright (c) 2026 Jakub Antalik. Licensed under the MIT License.
 * See NOTICE for the attribution and license text. This local module keeps
 * the donor's centre -> size -> corner timeline and content cross-blur, but
 * routes every tunable value through SwimmerUIKit's token layer.
 */

import { CLAY_LIQUID_GOOEY_TOKENS } from './clay/tokens';
import { roundedRectPath, type CornerRadii } from './liquidGooeyGeometry';

export interface EvolveOptions {
  /** Spring driving the liquid mass's centre. */
  massStiffness?: number;
  massDamping?: number;
  /** Spring driving width and height. */
  sizeStiffness?: number;
  sizeDamping?: number;
  /** Spring driving the corner radius. */
  radiusStiffness?: number;
  radiusDamping?: number;
  /** Maximum content cross-blur during the morph, in px. */
  contentBlur?: number;
  /** 0..1 droplet roundness during a shape transition. */
  roundness?: number;
  /** Corner-forming timeline. */
  cornerDuration?: number;
  cornerDelay?: number;
  cornerEase?: string;
  /** Ramp-in time for the droplet lead, in ms. */
  anticipation?: number;
  /** Maximum droplet lead toward the destination, in px. */
  travel?: number;
}

export const EVOLVE_DEFAULTS: Required<EvolveOptions> = {
  massStiffness: 320,
  massDamping: 17,
  sizeStiffness: 170,
  sizeDamping: 11.5,
  radiusStiffness: 900,
  radiusDamping: 60,
  contentBlur: 7,
  roundness: 1,
  cornerDuration: 460,
  cornerDelay: 0,
  cornerEase: 'cubic-bezier(0.3, 1.05, 0.4, 1)',
  anticipation: 90,
  travel: 32,
};

export interface MorphTuning {
  /** Whether shape-change physics is enabled. The kit default is token-on. */
  shape?: boolean;
  /** Tempo multiplier. */
  speed?: number;
  /** 0..1 overshoot amount. */
  bounce?: number;
  /** Maximum content cross-blur, in px. */
  contentBlur?: number;
  /** Raw evolve escape hatch. */
  advanced?: Partial<EvolveOptions>;
}

export interface EvolveTarget {
  cx: number;
  cy: number;
  w: number;
  h: number;
  r: number;
  scale: number;
}

export interface EvolveState {
  cx: number;
  cy: number;
  w: number;
  h: number;
  r: number;
  vcx: number;
  vcy: number;
  vw: number;
  vh: number;
  vr: number;
  motionEnv: number;
  tPrev: { cx: number; cy: number } | null;
  tvx: number;
  tvy: number;
  lead01: number;
  cornerT0: number;
  cornerStarted: boolean;
  lastTargetMoveT: number;
  lastTargetSize: { w: number; h: number } | null;
  morphActive: boolean;
  round01: number;
}

export interface EvolveFrame {
  path: string;
  transform: string;
  contentBlur: number;
  moving: boolean;
}

type NumericTokenKey =
  | 'morphShape'
  | 'morphSpeed'
  | 'morphBounce'
  | 'evolveMassStiffness'
  | 'evolveMassDamping'
  | 'evolveSizeStiffness'
  | 'evolveSizeDamping'
  | 'evolveRadiusStiffness'
  | 'evolveRadiusDamping'
  | 'evolveContentBlur'
  | 'evolveRoundness'
  | 'evolveCornerDuration'
  | 'evolveCornerDelay'
  | 'evolveAnticipation'
  | 'evolveTravel'
  | 'contentBlurAreaMultiplier';

function tokenName(reference: string): string | null {
  return /^var\((--[\w-]+)\)$/.exec(reference.trim())?.[1] ?? null;
}

function finite(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function readNumberToken(
  group: HTMLElement | null,
  key: NumericTokenKey,
  fallback: number,
): number {
  const view = group?.ownerDocument.defaultView;
  const name = tokenName(CLAY_LIQUID_GOOEY_TOKENS[key]);
  if (!view || !name) return fallback;
  const value = Number.parseFloat(view.getComputedStyle(group).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

function readStringToken(
  group: HTMLElement | null,
  key: 'evolveCornerEase',
  fallback: string,
): string {
  const view = group?.ownerDocument.defaultView;
  const name = tokenName(CLAY_LIQUID_GOOEY_TOKENS[key]);
  if (!view || !name) return fallback;
  return view.getComputedStyle(group).getPropertyValue(name).trim() || fallback;
}

/** Resolve the local morph knobs against the donor's raw physics defaults. */
export function resolveEvolveOptions(
  group: HTMLElement | null,
  tuning?: MorphTuning,
): Required<EvolveOptions> {
  const read = (key: NumericTokenKey, fallback: number): number =>
    readNumberToken(group, key, fallback);
  const base: Required<EvolveOptions> = {
    massStiffness: Math.max(0.001, read('evolveMassStiffness', EVOLVE_DEFAULTS.massStiffness)),
    massDamping: Math.max(0, read('evolveMassDamping', EVOLVE_DEFAULTS.massDamping)),
    sizeStiffness: Math.max(0.001, read('evolveSizeStiffness', EVOLVE_DEFAULTS.sizeStiffness)),
    sizeDamping: Math.max(0, read('evolveSizeDamping', EVOLVE_DEFAULTS.sizeDamping)),
    radiusStiffness: Math.max(
      0.001,
      read('evolveRadiusStiffness', EVOLVE_DEFAULTS.radiusStiffness),
    ),
    radiusDamping: Math.max(0, read('evolveRadiusDamping', EVOLVE_DEFAULTS.radiusDamping)),
    contentBlur: Math.max(0, read('evolveContentBlur', EVOLVE_DEFAULTS.contentBlur)),
    roundness: clamp(read('evolveRoundness', EVOLVE_DEFAULTS.roundness)),
    cornerDuration: Math.max(0, read('evolveCornerDuration', EVOLVE_DEFAULTS.cornerDuration)),
    cornerDelay: Math.max(0, read('evolveCornerDelay', EVOLVE_DEFAULTS.cornerDelay)),
    cornerEase: readStringToken(group, 'evolveCornerEase', EVOLVE_DEFAULTS.cornerEase),
    anticipation: Math.max(0, read('evolveAnticipation', EVOLVE_DEFAULTS.anticipation)),
    travel: Math.max(0, read('evolveTravel', EVOLVE_DEFAULTS.travel)),
  };
  const speed = Math.max(0.25, finite(tuning?.speed, read('morphSpeed', 1)));
  const bounce = clamp(finite(tuning?.bounce, read('morphBounce', 0.5)));
  // Same damping-ratio mapping as the donor's public Morph knob. Stiffness ×
  // speed² and damping × speed preserve the character while changing tempo.
  const zeta = (value: number): number => Math.max(0.12, 1 - 1.1 * clamp(value));
  const dampingRatio = zeta(bounce) / zeta(0.5);
  const mapped: Required<EvolveOptions> = {
    massStiffness: base.massStiffness * speed * speed,
    massDamping: base.massDamping * speed * dampingRatio,
    sizeStiffness: base.sizeStiffness * speed * speed,
    sizeDamping: base.sizeDamping * speed * dampingRatio,
    // Radius stays critically damped. The roundness envelope is the visible
    // jelly wobble; a bouncing radius reads as corner flicker.
    radiusStiffness: base.radiusStiffness * speed * speed,
    radiusDamping: base.radiusDamping * speed,
    contentBlur: Math.max(0, finite(tuning?.contentBlur, base.contentBlur)),
    roundness: base.roundness,
    cornerDuration: base.cornerDuration / speed,
    cornerDelay: base.cornerDelay,
    cornerEase: base.cornerEase,
    anticipation: base.anticipation,
    travel: base.travel,
  };
  return { ...mapped, ...(tuning?.advanced ?? {}) } as Required<EvolveOptions>;
}

/** The brand-kit default is deliberately on; callers can explicitly opt out. */
export function resolveMorphShape(group: HTMLElement | null, tuning?: MorphTuning): boolean {
  if (tuning?.shape !== undefined) return tuning.shape;
  return readNumberToken(group, 'morphShape', 1) >= 0.5;
}

/** Content blur is a real raster cost; reserve its max blur footprint. */
export function evolveFilterPadding(group: HTMLElement | null, tuning?: MorphTuning): number {
  const options = resolveEvolveOptions(group, tuning);
  const multiplier = Math.max(0, readNumberToken(group, 'contentBlurAreaMultiplier', 3));
  return options.contentBlur * multiplier;
}

export function createEvolveState(target: EvolveTarget): EvolveState {
  return {
    cx: target.cx,
    cy: target.cy,
    w: target.w,
    h: target.h,
    r: target.r,
    vcx: 0,
    vcy: 0,
    vw: 0,
    vh: 0,
    vr: 0,
    motionEnv: 0,
    tPrev: null,
    tvx: 0,
    tvy: 0,
    lead01: 0,
    cornerT0: 0,
    cornerStarted: false,
    lastTargetMoveT: 0,
    lastTargetSize: null,
    morphActive: false,
    round01: 0,
  };
}

export function snapEvolveState(state: EvolveState, target: EvolveTarget): void {
  state.cx = target.cx;
  state.cy = target.cy;
  state.w = target.w;
  state.h = target.h;
  state.r = target.r;
  state.vcx = 0;
  state.vcy = 0;
  state.vw = 0;
  state.vh = 0;
  state.vr = 0;
  state.motionEnv = 0;
  state.tPrev = { cx: target.cx, cy: target.cy };
  state.tvx = 0;
  state.tvy = 0;
  state.lead01 = 0;
  state.cornerT0 = 0;
  state.cornerStarted = false;
  state.lastTargetMoveT = 0;
  state.lastTargetSize = { w: target.w, h: target.h };
  state.morphActive = false;
  state.round01 = 0;
}

function springStep(
  current: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): [number, number] {
  const acceleration = stiffness * (target - current) - damping * velocity;
  const nextVelocity = velocity + acceleration * dt;
  return [current + nextVelocity * dt, nextVelocity];
}

function springSteps(
  current: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): [number, number] {
  const safeDt = Math.max(0, finite(dt, 0));
  let steps = Math.max(1, Math.ceil(safeDt * 60));
  const stepDt = safeDt / steps;
  let position = current;
  let speed = velocity;
  while (steps-- > 0) {
    [position, speed] = springStep(position, speed, target, stiffness, damping, stepDt);
  }
  return [position, speed];
}

const easeCache = new Map<string, (progress: number) => number>();

function easingFunction(spec: string): (progress: number) => number {
  let cached = easeCache.get(spec);
  if (cached) return cached;
  const match = /cubic-bezier\(([^)]+)\)/.exec(spec);
  if (match) {
    const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = (match[1] ?? '').split(',').map(Number);
    cached = (progress: number): number => {
      if (progress <= 0) return 0;
      if (progress >= 1) return 1;
      let low = 0;
      let high = 1;
      for (let index = 0; index < 24; index += 1) {
        const mid = (low + high) / 2;
        const x = 3 * mid * (1 - mid) * (1 - mid) * x1 + 3 * mid * mid * (1 - mid) * x2 + mid ** 3;
        if (x < progress) low = mid;
        else high = mid;
      }
      const u = (low + high) / 2;
      return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u ** 3;
    };
  } else if (spec === 'ease-in-out') {
    cached = easingFunction('cubic-bezier(0.42, 0, 0.58, 1)');
  } else {
    cached = (progress: number): number => clamp(progress);
  }
  easeCache.set(spec, cached);
  return cached;
}

function format(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

/**
 * Centre-first liquid evolution, adapted from the donor's `writeBlob` branch.
 * The returned path is painted into the SVG silhouette while `contentBlur`
 * is applied by the caller to the real content layer only.
 */
export function advanceEvolve(
  state: EvolveState,
  target: EvolveTarget,
  dt: number,
  now: number,
  options: Required<EvolveOptions>,
): EvolveFrame {
  const safeDt = Math.max(0, finite(dt, 0));
  const tcx = target.cx;
  const tcy = target.cy;
  if (!state.tPrev) state.tPrev = { cx: tcx, cy: tcy };
  const rawVx = (tcx - state.tPrev.cx) / Math.max(1e-6, safeDt || 1 / 60);
  const rawVy = (tcy - state.tPrev.cy) / Math.max(1e-6, safeDt || 1 / 60);
  state.tvx = state.tvx * 0.7 + rawVx * 0.3;
  state.tvy = state.tvy * 0.7 + rawVy * 0.3;
  state.tPrev = { cx: tcx, cy: tcy };

  const remX = tcx - state.cx;
  const remY = tcy - state.cy;
  const rem = Math.hypot(remX, remY);
  const targetVelocity = Math.hypot(state.tvx, state.tvy);
  let directionX = 0;
  let directionY = 0;
  if (targetVelocity > 1e-3) {
    directionX = state.tvx / targetVelocity;
    directionY = state.tvy / targetVelocity;
  } else if (rem > 1e-3) {
    directionX = remX / rem;
    directionY = remY / rem;
  }
  const anticipation = Math.max(0, options.anticipation) / 1000;
  const leadRate = anticipation > 0 ? 1 - Math.exp(-safeDt / anticipation) : 1;
  state.lead01 += ((rem > 0.5 ? 1 : 0) - state.lead01) * leadRate;
  const lead = Math.min(Math.max(0, options.travel) * state.lead01, rem);
  [state.cx, state.vcx] = springSteps(
    state.cx,
    state.vcx,
    tcx + directionX * lead,
    options.massStiffness,
    options.massDamping,
    safeDt,
  );
  [state.cy, state.vcy] = springSteps(
    state.cy,
    state.vcy,
    tcy + directionY * lead,
    options.massStiffness,
    options.massDamping,
    safeDt,
  );
  [state.w, state.vw] = springSteps(
    state.w,
    state.vw,
    target.w,
    options.sizeStiffness,
    options.sizeDamping,
    safeDt,
  );
  [state.h, state.vh] = springSteps(
    state.h,
    state.vh,
    target.h,
    options.sizeStiffness,
    options.sizeDamping,
    safeDt,
  );
  [state.r, state.vr] = springSteps(
    state.r,
    state.vr,
    target.r,
    options.radiusStiffness,
    options.radiusDamping,
    safeDt,
  );

  const previousSize = state.lastTargetSize;
  const sizeDelta = previousSize
    ? Math.abs(target.w - previousSize.w) + Math.abs(target.h - previousSize.h)
    : 0;
  if (sizeDelta > 0.5) {
    if (!state.morphActive) {
      state.cornerT0 = now;
      state.cornerStarted = true;
      state.morphActive = true;
    }
    state.lastTargetMoveT = now;
  } else if (
    state.morphActive &&
    now - state.lastTargetMoveT > 150 &&
    now - state.cornerT0 > Math.max(0, options.cornerDelay) + Math.max(1, options.cornerDuration)
  ) {
    state.morphActive = false;
  }
  state.lastTargetSize = { w: target.w, h: target.h };

  const cornerTotal = Math.max(0, options.cornerDelay) + Math.max(1, options.cornerDuration);
  let roundTarget = 0;
  if (state.cornerStarted && options.roundness > 0 && now - state.cornerT0 < cornerTotal) {
    const progress = clamp(
      (now - state.cornerT0 - Math.max(0, options.cornerDelay)) /
        Math.max(1, options.cornerDuration),
    );
    const eased = easingFunction(options.cornerEase)(progress);
    roundTarget = clamp((1 - eased) * options.roundness);
  }
  const maxRoundStep = safeDt * 8;
  state.round01 += Math.max(-maxRoundStep, Math.min(maxRoundStep, roundTarget - state.round01));

  let renderRadius = Math.max(0, state.r);
  if (state.round01 > 0.001) {
    const dropletRadius = Math.max(Math.min(state.w, state.h) / 2, renderRadius);
    renderRadius += (dropletRadius - renderRadius) * state.round01;
    renderRadius = Math.max(renderRadius, target.r);
  }

  const motionRaw = Math.min(
    1,
    (Math.hypot(state.vcx, state.vcy) + Math.abs(state.vw) + Math.abs(state.vh)) / 420,
  );
  state.motionEnv = Math.max(motionRaw, state.motionEnv - safeDt * 1.9);
  const blur = state.motionEnv * state.motionEnv * Math.max(0, options.contentBlur);
  const cornerActive =
    (state.cornerStarted && now - state.cornerT0 < cornerTotal + 80) ||
    Math.abs(roundTarget - state.round01) > 0.004 ||
    state.round01 > 0.004;
  const speed = Math.hypot(state.vcx, state.vcy);
  const settled =
    Math.abs(state.cx - tcx) < 0.05 &&
    Math.abs(state.cy - tcy) < 0.05 &&
    Math.abs(state.w - target.w) < 0.05 &&
    Math.abs(state.h - target.h) < 0.05 &&
    Math.abs(state.r - target.r) < 0.05 &&
    speed < 1 &&
    Math.abs(state.vw) + Math.abs(state.vh) + Math.abs(state.vr) < 1 &&
    state.motionEnv < 0.01 &&
    !cornerActive;
  const radii: CornerRadii = [renderRadius, renderRadius, renderRadius, renderRadius];
  return {
    path: roundedRectPath(-state.w / 2, -state.h / 2, state.w, state.h, radii),
    transform: `translate(${format(state.cx)} ${format(state.cy)}) scale(${format(target.scale)})`,
    contentBlur: blur,
    moving: !settled,
  };
}
