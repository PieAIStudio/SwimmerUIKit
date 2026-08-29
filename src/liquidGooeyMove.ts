/**
 * Move physics adapted from `liquid-gooey` by Jakub Antalik.
 *
 * Source: https://github.com/Jakubantalik/Libraries/tree/main/packages/liquid-gooey
 * Pinned commit: 3862ffa345217443b63696a8c331a0664eea4b04
 * Copyright (c) 2026 Jakub Antalik. Licensed under the MIT License.
 * See NOTICE for the attribution and license text. This local module keeps
 * the donor's Move and Bend geometry, but routes tunables through the
 * SwimmerUIKit token layer. Melt, dissolve, image-melt, and the donor's
 * general observer are deliberately not included.
 */

import { CLAY_LIQUID_GOOEY_TOKENS } from './clay/tokens';
import { roundedRectPath, type BlobBox } from './liquidGooeyGeometry';

/** The donor's Move knobs. Bend is exposed separately below. */
export interface MoveOptions {
  /** Spring pulling the liquid surface after the element. */
  stiffness?: number;
  damping?: number;
  /** Maximum axial stretch at speed. */
  stretch?: number;
  /** Trailing droplet size as a fraction of the trailing side. */
  tail?: number;
  /** How far the trailing droplet may extend behind the body. */
  force?: number;
}

export const MOVE_DEFAULTS: Required<MoveOptions> = {
  stiffness: 380,
  damping: 18,
  stretch: 0.18,
  tail: 0.46,
  force: 0.5,
};

export interface BendTuning {
  /** Vertical bow strength, 0..1. */
  vertical?: number;
  /** Horizontal cap deformation, 0..1. */
  horizontal?: number;
}

export interface BendOptions {
  vertical: number;
  horizontal: number;
  velocityVertical: number;
  velocityHorizontal: number;
  smoothing: number;
  activeThreshold: number;
  verticalCap: number;
  horizontalCap: number;
  radiusMin: number;
  radiusMax: number;
  leadingCapFactor: number;
  trailingCapFactor: number;
}

export interface BendState {
  cx: number;
  cy: number;
  previousCx: number;
  previousCy: number;
  vcx: number;
  vcy: number;
  bendY: number;
  bendX: number;
  initialized: boolean;
}

export interface BendFrame {
  path: string;
  transform: string;
  bendX: number;
  bendY: number;
  moving: boolean;
  fingerprint: string;
}

interface MoveRenderOptions extends Required<MoveOptions> {
  tailSpringStiffness: number;
  tailSpringDamping: number;
  stretchSpeed: number;
  stretchSquash: number;
  speedThreshold: number;
  tailOnsetSpeed: number;
  tailOnsetRange: number;
  tailRamp: number;
  tailMinRadius: number;
  tailWobble: number;
  tailPhaseSpeed: number;
  tailMidpointA: number;
  tailMidpointB: number;
  tailMidRadiusA: number;
  tailMidRadiusB: number;
  tailWobblePhase: number;
  minPerpendicular: number;
  lagBase: number;
  lagForce: number;
  settleDistance: number;
  settleSpeed: number;
  integrationRate: number;
}

export interface MoveTarget {
  cx: number;
  cy: number;
  scale: number;
}

export interface MoveState {
  cx: number;
  cy: number;
  vcx: number;
  vcy: number;
  tailX: number;
  tailY: number;
  tailVx: number;
  tailVy: number;
  tailR: number;
  tailPhase: number;
  tailInitialized: boolean;
}

export interface MoveTailFrame {
  cx: number;
  cy: number;
  radius: number;
  midACx: number;
  midACy: number;
  midARadius: number;
  midBCx: number;
  midBCy: number;
  midBRadius: number;
  visible: boolean;
  fingerprint: string;
}

export interface MoveFrame {
  path: string;
  transform: string;
  tail: MoveTailFrame;
  moving: boolean;
}

/** Numeric fallbacks mirror the donor defaults; runtime values come from CSS tokens. */
const MOVE_RENDER_DEFAULTS: Omit<MoveRenderOptions, keyof MoveOptions> = {
  tailSpringStiffness: 170,
  tailSpringDamping: 22,
  stretchSpeed: 0.0006,
  stretchSquash: 0.65,
  speedThreshold: 2,
  tailOnsetSpeed: 20,
  tailOnsetRange: 120,
  tailRamp: 10,
  tailMinRadius: 0.3,
  tailWobble: 0.16,
  tailPhaseSpeed: 0.045,
  tailMidpointA: 0.45,
  tailMidpointB: 0.75,
  tailMidRadiusA: 0.62,
  tailMidRadiusB: 0.4,
  tailWobblePhase: 2.4,
  minPerpendicular: 4,
  lagBase: 0.2,
  lagForce: 1.6,
  settleDistance: 0.05,
  settleSpeed: 1,
  integrationRate: 60,
};

type MoveTokenKey = keyof typeof CLAY_LIQUID_GOOEY_TOKENS;

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function finite(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function tokenName(reference: string): string | null {
  const match = /^var\((--[\w-]+)\)$/.exec(reference.trim());
  return match?.[1] ?? null;
}

function readToken(group: HTMLElement | null, key: MoveTokenKey, fallback: number): number {
  const view = group?.ownerDocument.defaultView;
  const name = tokenName(CLAY_LIQUID_GOOEY_TOKENS[key]);
  if (!view || !name) return fallback;
  const raw = view.getComputedStyle(group).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Resolve all Move knobs through the host's token layer once an animation starts. */
export function resolveMoveOptions(group: HTMLElement | null): MoveRenderOptions {
  const read = (key: MoveTokenKey, fallback: number): number => readToken(group, key, fallback);
  return {
    stiffness: Math.max(0.001, read('moveStiffness', MOVE_DEFAULTS.stiffness)),
    damping: Math.max(0, read('moveDamping', MOVE_DEFAULTS.damping)),
    stretch: clamp(read('moveStretch', MOVE_DEFAULTS.stretch)),
    tail: clamp(read('moveTail', MOVE_DEFAULTS.tail)),
    force: clamp(read('moveForce', MOVE_DEFAULTS.force)),
    tailSpringStiffness: Math.max(
      0.001,
      read('moveTailSpringStiffness', MOVE_RENDER_DEFAULTS.tailSpringStiffness),
    ),
    tailSpringDamping: Math.max(
      0,
      read('moveTailSpringDamping', MOVE_RENDER_DEFAULTS.tailSpringDamping),
    ),
    stretchSpeed: Math.max(0, read('moveStretchSpeed', MOVE_RENDER_DEFAULTS.stretchSpeed)),
    stretchSquash: Math.max(0, read('moveStretchSquash', MOVE_RENDER_DEFAULTS.stretchSquash)),
    speedThreshold: Math.max(0, read('moveSpeedThreshold', MOVE_RENDER_DEFAULTS.speedThreshold)),
    tailOnsetSpeed: Math.max(0, read('moveTailOnsetSpeed', MOVE_RENDER_DEFAULTS.tailOnsetSpeed)),
    tailOnsetRange: Math.max(
      0.001,
      read('moveTailOnsetRange', MOVE_RENDER_DEFAULTS.tailOnsetRange),
    ),
    tailRamp: Math.max(0, read('moveTailRamp', MOVE_RENDER_DEFAULTS.tailRamp)),
    tailMinRadius: Math.max(0, read('moveTailMinRadius', MOVE_RENDER_DEFAULTS.tailMinRadius)),
    tailWobble: Math.max(0, read('moveTailWobble', MOVE_RENDER_DEFAULTS.tailWobble)),
    tailPhaseSpeed: Math.max(0, read('moveTailPhaseSpeed', MOVE_RENDER_DEFAULTS.tailPhaseSpeed)),
    tailMidpointA: clamp(read('moveTailMidpointA', MOVE_RENDER_DEFAULTS.tailMidpointA)),
    tailMidpointB: clamp(read('moveTailMidpointB', MOVE_RENDER_DEFAULTS.tailMidpointB)),
    tailMidRadiusA: clamp(read('moveTailMidRadiusA', MOVE_RENDER_DEFAULTS.tailMidRadiusA)),
    tailMidRadiusB: clamp(read('moveTailMidRadiusB', MOVE_RENDER_DEFAULTS.tailMidRadiusB)),
    tailWobblePhase: read('moveTailWobblePhase', MOVE_RENDER_DEFAULTS.tailWobblePhase),
    minPerpendicular: Math.max(
      0,
      read('moveMinPerpendicular', MOVE_RENDER_DEFAULTS.minPerpendicular),
    ),
    lagBase: Math.max(0, read('moveLagBase', MOVE_RENDER_DEFAULTS.lagBase)),
    lagForce: Math.max(0, read('moveLagForce', MOVE_RENDER_DEFAULTS.lagForce)),
    settleDistance: Math.max(0, read('moveSettleDistance', MOVE_RENDER_DEFAULTS.settleDistance)),
    settleSpeed: Math.max(0, read('moveSettleSpeed', MOVE_RENDER_DEFAULTS.settleSpeed)),
    integrationRate: Math.max(1, read('moveIntegrationRate', MOVE_RENDER_DEFAULTS.integrationRate)),
  };
}

/** Resolve the donor's Bend knobs through the same numeric token layer. */
export function resolveBendOptions(group: HTMLElement | null, tuning?: BendTuning): BendOptions {
  return {
    vertical: clamp(finite(tuning?.vertical, readToken(group, 'bendVertical', 0.6))),
    horizontal: clamp(finite(tuning?.horizontal, readToken(group, 'bendHorizontal', 0.35))),
    velocityVertical: Math.max(0, readToken(group, 'bendVelocityVertical', 0.05)),
    velocityHorizontal: Math.max(0, readToken(group, 'bendVelocityHorizontal', 0.09)),
    smoothing: Math.max(0, readToken(group, 'bendSmoothing', 9)),
    activeThreshold: Math.max(0, readToken(group, 'bendActiveThreshold', 0.5)),
    verticalCap: Math.max(0, readToken(group, 'bendVerticalCap', 0.5)),
    horizontalCap: Math.max(0, readToken(group, 'bendHorizontalCap', 0.9)),
    radiusMin: Math.max(0, readToken(group, 'bendRadiusMin', 0.2)),
    radiusMax: Math.max(0, readToken(group, 'bendRadiusMax', 3)),
    leadingCapFactor: Math.max(0, readToken(group, 'bendLeadingCapFactor', 0.8)),
    trailingCapFactor: Math.max(0, readToken(group, 'bendTrailingCapFactor', 1.6)),
  };
}

/** Semi-implicit Euler spring step copied from the donor's Move implementation. */
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

/** Keep the integration stable across long frame gaps while honoring wall-clock time. */
function springSteps(
  current: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
  integrationRate: number,
): [number, number] {
  const safeDt = Math.max(0, finite(dt, 0));
  let steps = Math.max(1, Math.ceil(safeDt * integrationRate));
  const stepDt = safeDt / steps;
  let position = current;
  let speed = velocity;
  while (steps-- > 0) {
    [position, speed] = springStep(position, speed, target, stiffness, damping, stepDt);
  }
  return [position, speed];
}

export function createMoveState(target: MoveTarget): MoveState {
  return {
    cx: target.cx,
    cy: target.cy,
    vcx: 0,
    vcy: 0,
    tailX: target.cx,
    tailY: target.cy,
    tailVx: 0,
    tailVy: 0,
    tailR: 0,
    tailPhase: 0,
    tailInitialized: true,
  };
}

export function snapMoveState(state: MoveState, target: MoveTarget): void {
  state.cx = target.cx;
  state.cy = target.cy;
  state.vcx = 0;
  state.vcy = 0;
  state.tailX = target.cx;
  state.tailY = target.cy;
  state.tailVx = 0;
  state.tailVy = 0;
  state.tailR = 0;
  state.tailPhase = 0;
  state.tailInitialized = true;
}

function format(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function advanceMove(
  state: MoveState,
  target: MoveTarget,
  box: BlobBox,
  dt: number,
  options: MoveRenderOptions,
): MoveFrame {
  const scale = Math.max(0.01, finite(target.scale, 1));
  [state.cx, state.vcx] = springSteps(
    state.cx,
    state.vcx,
    target.cx,
    options.stiffness,
    options.damping,
    dt,
    options.integrationRate,
  );
  [state.cy, state.vcy] = springSteps(
    state.cy,
    state.vcy,
    target.cy,
    options.stiffness,
    options.damping,
    dt,
    options.integrationRate,
  );

  const speed = Math.hypot(state.vcx, state.vcy);
  let angle = 0;
  let stretchX = 1;
  let stretchY = 1;
  if (speed > options.speedThreshold) {
    const stretch = Math.min(options.stretch, speed * options.stretchSpeed);
    angle = Math.round(Math.atan2(state.vcy, state.vcx) * 100) / 100;
    stretchX = 1 + stretch;
    stretchY = 1 / (1 + stretch * options.stretchSquash);
  }

  if (!state.tailInitialized) {
    state.tailX = state.cx;
    state.tailY = state.cy;
    state.tailInitialized = true;
  }
  [state.tailX, state.tailVx] = springSteps(
    state.tailX,
    state.tailVx,
    state.cx,
    options.tailSpringStiffness,
    options.tailSpringDamping,
    dt,
    options.integrationRate,
  );
  [state.tailY, state.tailVy] = springSteps(
    state.tailY,
    state.tailVy,
    state.cy,
    options.tailSpringStiffness,
    options.tailSpringDamping,
    dt,
    options.integrationRate,
  );

  // The tail belongs to the side it trails from. Perpendicular extent sets
  // its size; the lag cap clears the body's own half-extent along the motion.
  const bodyWidth = Math.max(0, box.w * scale);
  const bodyHeight = Math.max(0, box.h * scale);
  const ux = speed > 0.001 ? state.vcx / speed : 1;
  const uy = speed > 0.001 ? state.vcy / speed : 0;
  const perpendicular = Math.max(
    options.minPerpendicular,
    Math.abs(ux) * bodyHeight + Math.abs(uy) * bodyWidth,
  );
  const halfAlong = (Math.abs(ux) * bodyWidth + Math.abs(uy) * bodyHeight) / 2;
  const base = perpendicular / 2;
  const lagX = state.tailX - state.cx;
  const lagY = state.tailY - state.cy;
  const lag = Math.hypot(lagX, lagY);
  const maxLag = halfAlong + base * (options.lagBase + options.force * options.lagForce);
  if (lag > maxLag && lag > 0) {
    state.tailX = state.cx + (lagX / lag) * maxLag;
    state.tailY = state.cy + (lagY / lag) * maxLag;
  }

  const onset = clamp((speed - options.tailOnsetSpeed) / options.tailOnsetRange);
  const targetRadius = base * options.tail * onset;
  state.tailR += (targetRadius - state.tailR) * Math.min(1, Math.max(0, dt) * options.tailRamp);

  const visible = state.tailR >= options.tailMinRadius;
  let midACx = state.cx;
  let midACy = state.cy;
  let midBCx = state.cx;
  let midBCy = state.cy;
  let midARadius = 0;
  let midBRadius = 0;
  if (visible) {
    // Wobble rides distance travelled, so it freezes when the gesture pauses.
    state.tailPhase += speed * Math.max(0, finite(dt, 0)) * options.tailPhaseSpeed;
    const wobble = state.tailR * options.tailWobble;
    const perpendicularX = -uy;
    const perpendicularY = ux;
    const wobbleA = Math.sin(state.tailPhase) * wobble;
    const wobbleB = Math.sin(state.tailPhase + options.tailWobblePhase) * -wobble;
    midACx = state.cx + lagX * options.tailMidpointA + perpendicularX * wobbleA;
    midACy = state.cy + lagY * options.tailMidpointA + perpendicularY * wobbleA;
    midBCx = state.cx + lagX * options.tailMidpointB + perpendicularX * wobbleB;
    midBCy = state.cy + lagY * options.tailMidpointB + perpendicularY * wobbleB;
    midARadius = state.tailR * options.tailMidRadiusA;
    midBRadius = state.tailR * options.tailMidRadiusB;
  }

  const tail = {
    cx: round(state.tailX),
    cy: round(state.tailY),
    radius: visible ? round(state.tailR) : 0,
    midACx: round(midACx),
    midACy: round(midACy),
    midARadius: visible ? round(midARadius) : 0,
    midBCx: round(midBCx),
    midBCy: round(midBCy),
    midBRadius: visible ? round(midBRadius) : 0,
    visible,
    fingerprint: visible
      ? [
          round(state.tailX),
          round(state.tailY),
          round(state.tailR),
          round(midACx),
          round(midACy),
          round(midBCx),
          round(midBCy),
        ].join(',')
      : 'hidden',
  } satisfies MoveTailFrame;

  const path = roundedRectPath(-box.w / 2, -box.h / 2, box.w, box.h, box.r);
  const transform =
    `translate(${format(state.cx)} ${format(state.cy)}) ` +
    (speed > options.speedThreshold
      ? `rotate(${format((angle * 180) / Math.PI)}) scale(${format(stretchX)} ${format(stretchY)}) `
      : '') +
    `scale(${format(scale)})`;
  const bodyDistance = Math.hypot(state.cx - target.cx, state.cy - target.cy);
  const moving =
    bodyDistance > options.settleDistance ||
    speed > options.settleSpeed ||
    state.tailR >= options.tailMinRadius;

  return { path, transform, tail, moving };
}

function bendPath(
  width: number,
  height: number,
  radius: number,
  bendY: number,
  bendX: number,
  options: BendOptions,
): string {
  const r = Math.min(Math.max(0, radius), width / 2, height / 2);
  // Directly adapted from the donor's Bend path: a quadratic top/bottom bow
  // makes the middle lead while the ends lag; cap radii change independently
  // so sideways motion blunts the front and stretches the back.
  const cy = Math.round(bendY * 2 * 10) / 10;
  const rxR = Math.max(
    r * options.radiusMin,
    Math.min(
      r * options.radiusMax,
      bendX > 0 ? r - options.leadingCapFactor * bendX : r + options.trailingCapFactor * -bendX,
    ),
  );
  const rxL = Math.max(
    r * options.radiusMin,
    Math.min(
      r * options.radiusMax,
      bendX > 0 ? r + options.trailingCapFactor * bendX : r - options.leadingCapFactor * -bendX,
    ),
  );
  const K = 0.5523;
  const round = (value: number): number => Math.round(value * 10) / 10;
  return (
    `M ${round(rxL)} 0 Q ${round(width / 2)} ${round(cy)} ${round(width - rxR)} 0 ` +
    `C ${round(width - rxR + K * rxR)} 0 ${round(width)} ${round(r - K * r)} ${round(width)} ${round(r)} ` +
    `L ${round(width)} ${round(height - r)} ` +
    `C ${round(width)} ${round(height - r + K * r)} ${round(width - rxR + K * rxR)} ${round(height)} ${round(width - rxR)} ${round(height)} ` +
    `Q ${round(width / 2)} ${round(height + bendY * 2)} ${round(rxL)} ${round(height)} ` +
    `C ${round(rxL - K * rxL)} ${round(height)} 0 ${round(height - r + K * r)} 0 ${round(height - r)} ` +
    `L 0 ${round(r)} ` +
    `C 0 ${round(r - K * r)} ${round(rxL - K * rxL)} 0 ${round(rxL)} 0 Z`
  );
}

export function createBendState(target: MoveTarget): BendState {
  return {
    cx: target.cx,
    cy: target.cy,
    previousCx: target.cx,
    previousCy: target.cy,
    vcx: 0,
    vcy: 0,
    bendY: 0,
    bendX: 0,
    initialized: false,
  };
}

export function snapBendState(state: BendState, target: MoveTarget): void {
  state.cx = target.cx;
  state.cy = target.cy;
  state.previousCx = target.cx;
  state.previousCy = target.cy;
  state.vcx = 0;
  state.vcy = 0;
  state.bendY = 0;
  state.bendX = 0;
  state.initialized = true;
}

/** Maximum body-bow footprint reserved in the SVG filter region. */
export function bendFilterPadding(box: BlobBox, options: BendOptions): number {
  return Math.min(box.w, box.h) * options.verticalCap * 2 * options.vertical;
}

/**
 * Donor Bend adaptation. The target centre is copied directly, so the
 * surface never trails the content; only the velocity-derived silhouette
 * bows and the smoothed bend values are exposed to the content as CSS vars.
 */
export function advanceBend(
  state: BendState,
  target: MoveTarget,
  box: BlobBox,
  dt: number,
  options: BendOptions,
): BendFrame {
  const safeDt = Math.max(1 / 240, finite(dt, 1 / 60));
  if (!state.initialized) {
    state.previousCx = target.cx;
    state.previousCy = target.cy;
    state.initialized = true;
  }
  const rawVx = (target.cx - state.previousCx) / safeDt;
  const rawVy = (target.cy - state.previousCy) / safeDt;
  state.previousCx = target.cx;
  state.previousCy = target.cy;
  // A light velocity smoothing keeps pointer sampling spikes from turning
  // into a one-frame notch while retaining the donor's immediate tracking.
  state.vcx = state.vcx * 0.7 + rawVx * 0.3;
  state.vcy = state.vcy * 0.7 + rawVy * 0.3;
  state.cx = target.cx;
  state.cy = target.cy;

  const minSide = Math.min(box.w, box.h);
  const verticalCap = minSide * options.verticalCap;
  const bTy =
    Math.max(-verticalCap, Math.min(verticalCap, state.vcy * options.velocityVertical)) *
    options.vertical;
  const horizontalCap = minSide * options.horizontalCap;
  const bTx =
    Math.max(-horizontalCap, Math.min(horizontalCap, state.vcx * options.velocityHorizontal)) *
    options.horizontal;
  state.bendY += (bTy - state.bendY) * Math.min(1, safeDt * options.smoothing);
  state.bendX += (bTx - state.bendX) * Math.min(1, safeDt * options.smoothing);
  const bendActive =
    Math.abs(state.bendY) > options.activeThreshold ||
    Math.abs(state.bendX) > options.activeThreshold;
  const radius = Math.min(...box.r);
  const path = bendActive
    ? bendPath(box.w, box.h, radius, state.bendY, state.bendX, options)
    : roundedRectPath(-box.w / 2, -box.h / 2, box.w, box.h, box.r);
  const transform = bendActive
    ? `translate(${format(state.cx - box.w / 2)} ${format(state.cy - box.h / 2)}) scale(${format(target.scale)})`
    : `translate(${format(state.cx)} ${format(state.cy)}) scale(${format(target.scale)})`;
  const bendX = Math.round(state.bendX * 10) / 10;
  const bendY = Math.round(state.bendY * 10) / 10;
  const moving =
    Math.abs(state.vcx) > 1 ||
    Math.abs(state.vcy) > 1 ||
    Math.abs(state.bendX) > options.activeThreshold * 0.1 ||
    Math.abs(state.bendY) > options.activeThreshold * 0.1;
  return {
    path,
    transform,
    bendX,
    bendY,
    moving,
    fingerprint: `${path}|${transform}|${bendX},${bendY}`,
  };
}
