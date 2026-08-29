/**
 * Move physics adapted from `liquid-gooey` by Jakub Antalik.
 *
 * Source: https://github.com/Jakubantalik/Libraries/tree/main/packages/liquid-gooey
 * Pinned commit: 3862ffa345217443b63696a8c331a0664eea4b04
 * Copyright (c) 2026 Jakub Antalik. Licensed under the MIT License.
 * See NOTICE for the attribution and license text. Bend, Melt, dissolve,
 * image-melt, and the donor's general observer are deliberately not included.
 */

import { CLAY_LIQUID_GOOEY_TOKENS } from './clay/tokens';
import { roundedRectPath, type BlobBox } from './liquidGooeyGeometry';

/** The donor's Move knobs, without the separate Bend knobs. */
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

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
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
