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

import { roundedRectPath, type BlobBox } from '../../liquid/geometry';
import type { MoveTarget } from '../../liquid/move';
import { clamp, finite, readToken, format } from '../../liquid/motionTokens';

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
